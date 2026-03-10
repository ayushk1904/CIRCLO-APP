const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const {
  getMessages,
  sendMessage,
} = require("../controllers/message.controller");

/* ================= GET MESSAGES ================= */
router.get(
  "/circle/:circleId",
  authMiddleware,
  getMessages
);

/* ================= SEND TEXT ================= */
router.post(
  "/circle/:circleId",
  authMiddleware,
  sendMessage
);

/* ================= SEND FILE / IMAGE ================= */
router.post(
  "/circle/:circleId/upload",
  authMiddleware,
  upload.single("file"),   // 🔴 REQUIRED
  sendMessage              // 🔴 SINGLE SOURCE OF TRUTH
);

module.exports = router;
