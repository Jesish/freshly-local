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
      .populate("participants", "fullName farmImage profileImage userType")
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
      .populate("sender", "fullName farmImage profileImage")
      .populate("recipient", "fullName farmImage profileImage")
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
    const io = req.app.get("io"); // Access Socket.IO instance

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({ participants: [userId, recipientId] });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      sender: userId,
      recipient: recipientId,
      text,
    });
    await message.save();

    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName farmImage profileImage")
      .populate("recipient", "fullName farmImage profileImage");

    // Emit message to the conversation room
    io.to(conversation._id.toString()).emit("newMessage", {
      ...populatedMessage._doc,
      conversationId: conversation._id,
    });

    res.status(201).json({
      ...populatedMessage._doc,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit a message
const editMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId, text } = req.body;
    const io = req.app.get("io");

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    message.edited = true; // Add edited flag
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate("sender", "fullName farmImage profileImage")
      .populate("recipient", "fullName farmImage profileImage");

    io.to(message.conversationId.toString()).emit("messageEdited", {
      ...populatedMessage._doc,
      conversationId: message.conversationId,
    });

    res.status(200).json(populatedMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;
    const io = req.app.get("io");

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });
    }

    const conversationId = message.conversationId;
    await message.deleteOne();

    io.to(conversationId.toString()).emit("messageDeleted", { messageId });

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
};
