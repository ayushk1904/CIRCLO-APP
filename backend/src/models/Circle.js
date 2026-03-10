const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: String,
  token: String,
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24 hours
  },
});

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["owner", "admin", "member"],
    default: "member",
  },
});

const circleSchema = new mongoose.Schema(
  {
    name: String,
    description: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [memberSchema],
    invites: [inviteSchema],

    // 🤖 AI training prompt (per circle)
    aiPrompt: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Circle", circleSchema);
