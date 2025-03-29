// C:\Users\CHME\Desktop\freshly-local\backend\src\controllers\messageController.js
const Conversation = require("../models/Conversation");
const Message = require("../models/message"); // Fixed typo: "message" to "Message"
const User = require("../models/User");
const mongoose = require("mongoose");

// Get all conversations for the logged-in user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "fullName farmImage userType")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.conversationId;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });
    console.log("getMessages - User ID:", userId);
    console.log("getMessages - Conversation ID:", conversationId);
    console.log("getMessages - Conversation:", conversation);

    if (!conversation) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not part of this conversation" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "fullName farmImage")
      .populate("recipient", "fullName farmImage")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Send a message (start a new conversation if needed)
const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipientId, text } = req.body;

    // Validate recipientId
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }

    // Validate recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Check if a conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId],
      });
      await conversation.save();
    }

    // Create the message
    const message = new Message({
      conversationId: conversation._id,
      sender: userId,
      recipient: recipientId,
      text,
    });
    await message.save();

    // Update the conversation's last message and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Populate the message with sender and recipient details
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName farmImage")
      .populate("recipient", "fullName farmImage");

    res.status(201).json({
      ...populatedMessage._doc,
      conversationId: conversation._id, // Include conversationId in the response
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
