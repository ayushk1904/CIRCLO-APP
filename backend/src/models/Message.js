const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // TEXT MESSAGE
    content: {
      type: String,
    },

    // MESSAGE TYPE
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    // FILE DATA
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },

    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
