// C:\Users\CHME\Desktop\freshly-local\backend\src\routes\messageRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} = require("../controllers/messageController");

// Get all conversations for the logged-in user
router.get("/conversations", protect, getConversations);

// Get messages for a specific conversation
router.get("/messages/:conversationId", protect, getMessages);

router.post("/message", protect, sendMessage);
router.put("/message", protect, editMessage);
router.delete("/message/:messageId", protect, deleteMessage);

module.exports = router;
