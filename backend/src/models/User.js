const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,            // ✅ ADD THIS
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  avatar: {
    type: String,
    default: "",
  },

  // ✅ FIXED LOCATION
  invites: [
    {
      circle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Circle",
      },
      token: String,
      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
