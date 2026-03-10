const Message = require("../models/Message");
const Circle = require("../models/Circle");

/**
 * GET all messages of a circle
 */
exports.getMessages = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user.id;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    const isMember = circle.members.some(
      (m) => m.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ circle: circleId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * SEND message (text or file)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const hasFile = Boolean(req.file);

    if (!content?.trim() && !hasFile) {
      return res
        .status(400)
        .json({ message: "Message or file required" });
    }

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    const isMember = circle.members.some(
      (m) => m.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await Message.create({
      circle: circleId,
      sender: userId,
      content: content || "",
      fileUrl: hasFile ? `/uploads/${req.file.filename}` : null,
      fileName: hasFile ? req.file.originalname : null,
    });

    const populatedMessage = await message.populate(
      "sender",
      "name email"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
