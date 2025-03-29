// C:\Users\CHME\Desktop\freshly-local\backend\src\routes\messageRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

// Get all conversations for the logged-in user
router.get("/conversations", protect, getConversations);

// Get messages for a specific conversation
router.get("/messages/:conversationId", protect, getMessages);

// Send a message (creates a new conversation if needed)
router.post("/message", protect, sendMessage);

module.exports = router;
