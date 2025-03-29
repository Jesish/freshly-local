// C:\Users\CHME\Desktop\freshly-local\frontend\src\pages\ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Send, ChevronLeft } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Adjust path if needed

const ChatPage = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientId, setRecipientId] = useState(null); // New state for recipientId
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const userResponse = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const currentUserId = userResponse.data._id;

      const { data } = await axios.get(
        `http://localhost:5000/api/messages/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedMessages = data.map((msg) => ({
        id: msg._id,
        text: msg.text,
        sender: msg.sender._id === currentUserId ? "me" : "them",
        senderId: msg.sender._id, // Keep sender ID for reference
        recipientId: msg.recipient._id, // Keep recipient ID
      }));

      const conversationResponse = await axios.get(
        `http://localhost:5000/api/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const conversation = conversationResponse.data.find(
        (conv) => conv._id === conversationId
      );
      const otherParticipant = conversation.participants.find(
        (p) => p._id !== currentUserId
      );
      setRecipientName(otherParticipant?.fullName || "Unknown User");
      setRecipientId(otherParticipant?._id); // Store recipientId

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !recipientId) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/message",
        { recipientId, text: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([
        ...messages,
        { id: data._id, text: data.text, sender: "me" },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/messages")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Chat with {recipientName}
            </h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[70vh] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg break-words ${
                    msg.sender === "me"
                      ? "bg-[#81C784] text-white"
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-3 border-t border-gray-200 pt-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#81C784] text-gray-700 resize-none overflow-hidden"
              rows="1"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{ minHeight: "40px", maxHeight: "100px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  100
                )}px`;
              }}
            />
            <button
              onClick={handleSend}
              className="p-2 bg-[#81C784] text-white rounded-full hover:bg-[#6DA970] transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
