const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const {
  createCircle,
  getMyCircles,
  getCircleById,
  updateCircle,
  deleteCircle,
  inviteMember,
  getMyInvites,
  acceptInvite,
  removeMember,
  leaveCircle,
  updateMemberRole,
} = require("../controllers/circle.controller");

/* =======================
   CIRCLE ROUTES
======================= */

// Create circle
router.post("/", authMiddleware, createCircle);

// Get logged-in user's circles
router.get("/", authMiddleware, getMyCircles);

// Get single circle
router.get("/:id", authMiddleware, getCircleById);

// Invite user
router.post("/:id/invite", authMiddleware, inviteMember);

// Get my invites
router.get("/invites/me", authMiddleware, getMyInvites);

// Accept invite ✅ (THIS IS IMPORTANT)
router.post("/accept/:token", authMiddleware, acceptInvite);

// Update circle
router.put("/:id", authMiddleware, updateCircle);

// Delete circle
router.delete("/:id", authMiddleware, deleteCircle);

// Remove member
router.delete("/:id/members/:userId", authMiddleware, removeMember);

// Change role
router.put("/:id/members/:userId/role", authMiddleware, updateMemberRole);

// Leave circle
router.post("/:id/leave", authMiddleware, leaveCircle);

module.exports = router;
