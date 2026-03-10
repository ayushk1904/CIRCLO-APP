const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Circle = require("../models/Circle");
const Groq = require("groq-sdk");

/* =========================
   🔑 GROQ CLIENT
========================= */
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing in .env");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =========================
   🤖 VIRTUAL AI USER
========================= */
const AI_USER_ID = new mongoose.Types.ObjectId("000000000000000000000001");

/* =========================
   POST /api/ai/chat
========================= */
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, circleId } = req.body;

    if (!message || !circleId) {
      return res.status(400).json({
        message: "message and circleId are required",
      });
    }

    /* =========================
       🔍 FETCH CIRCLE + MEMBERS
    ========================= */
    const circle = await Circle.findById(circleId).populate(
      "members.user",
      "name email"
    );

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    /* =========================
       👥 MEMBERS CONTEXT
    ========================= */
    const membersList =
      circle.members.length > 0
        ? circle.members
            .map(
              (m) => `- ${m.user?.name || "Unknown"} (${m.role})`
            )
            .join("\n")
        : "No members yet";

    /* =========================
       💬 FETCH CHAT HISTORY
    ========================= */
    const recentMessages = await Message.find({
      circle: circleId,
      isAI: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name")
      .lean();

    const chatHistory =
      recentMessages.length > 0
        ? recentMessages
            .reverse()
            .map(
              (m) =>
                `${m.sender?.name || "Unknown"}: ${m.content}`
            )
            .join("\n")
        : "No messages yet.";

    /* =========================
       🧠 SYSTEM PROMPT
    ========================= */
    const systemPrompt = `
You are Circlo AI, an intelligent assistant inside a group chat app called Circlo.

App knowledge:
- Circlo uses real-time group chats called "circles"
- Users chat instantly via WebSockets
- AI replies when users type /ai, @ai, or @bot

Current circle:
- Name: ${circle.name}
- Description: ${circle.description || "No description"}
- Members:
${membersList}

Recent chat history:
${chatHistory}

Instructions:
- Read the chat history carefully
- If user asks for a summary, summarize ONLY the provided chats
- Identify main topics, mood, and decisions (if any)
- If chats are casual, clearly say so
- If info is missing, say you don’t have it
- Do NOT hallucinate
- Never mention internal models or providers
- Be friendly, concise, and helpful
`;

    /* =========================
       🚀 GROQ (LLAMA-3.1)
    ========================= */
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const aiReply =
      completion?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    /* =========================
       💾 SAVE AI MESSAGE
    ========================= */
    const aiMessage = await Message.create({
      circle: circleId,
      sender: AI_USER_ID,
      content: aiReply,
      isAI: true,
    });

    await aiMessage.populate("sender", "name avatar");

    /* =========================
       📡 SOCKET EMIT
    ========================= */
    const io = req.app.get("io");
    if (io) {
      io.to(circleId).emit("new-message", aiMessage);
    }

    res.json({
      success: true,
      message: aiMessage,
    });
  } catch (err) {
    console.error("❌ Groq AI error:", err);
    res.status(500).json({
      message: "AI is currently unavailable",
    });
  }
});

module.exports = router;
