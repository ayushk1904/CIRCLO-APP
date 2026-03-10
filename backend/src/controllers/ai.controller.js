const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Message = require("../models/Message");

// 🔥 Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 Fixed virtual AI user (same ID used everywhere)
const AI_USER_ID = new mongoose.Types.ObjectId("000000000000000000000001");

exports.chatWithAI = async (req, res) => {
  try {
    const { message, circleId } = req.body;

    if (!message || !circleId) {
      return res.status(400).json({
        message: "message and circleId are required",
      });
    }

    // 🔥 Gemini model
    const model = genAI.getGenerativeModel({
  model: "models/text-bison-001",
});


    const result = await model.generateContent(message);
    const aiReply = result.response.text();

    // 🔥 Save AI message
    const aiMessage = await Message.create({
      circle: circleId,
      sender: AI_USER_ID,
      content: aiReply,
      isAI: true,
    });

    // 🔥 Populate sender (frontend safety)
    await aiMessage.populate("sender", "name avatar");

    // 🔥 Emit via socket
    const io = req.app.get("io");
    io.to(circleId).emit("new-message", aiMessage);

    res.json({
      success: true,
      message: aiMessage,
    });
  } catch (error) {
    console.error("Circlo AI error:", error);
    res.status(500).json({
      message: "Circlo AI is currently unavailable",
    });
  }
};

