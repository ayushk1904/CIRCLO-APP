const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const {
  uploadAvatar,
  getInvites,
  acceptInvite,
  rejectInvite,
} = require("../controllers/user.controller");

// =========================
// Avatar Upload
// =========================
router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "circlo/avatars",
        width: 300,
        height: 300,
        crop: "fill",
      });

      const user = await require("../models/User").findByIdAndUpdate(
        req.user._id,
        { avatar: result.secure_url },
        { new: true }
      ).select("-password");

      res.json({
        message: "Avatar updated successfully",
        avatar: user.avatar,
        user,
      });
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ message: "Avatar upload failed" });
    }
  }
);

// =========================
// INVITES
// =========================

// Get all invites for logged-in user
router.get("/invites", authMiddleware, getInvites);

// Accept invite
router.post("/invites/:token/accept", authMiddleware, acceptInvite);

// Reject invite
router.post("/invites/:token/reject", authMiddleware, rejectInvite);

module.exports = router;
