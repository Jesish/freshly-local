import React, { useState, useEffect, useRef } from "react";
import { X, Send, Phone, Video } from "lucide-react";
import axios from "axios";

const ChatPopup = ({ user, onClose, index = 0 }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const isNewConversation = user.recipientId && !user.id; // New if recipientId exists but no conversation ID

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get(
          "http://localhost:5000/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const currentUserId = userResponse.data._id;

        if (!isNewConversation && user.id) {
          setConversationId(user.id); // Existing conversation
        } else {
          // Check for an existing conversation with this recipient
          const { data } = await axios.get(
            "http://localhost:5000/api/conversations",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const existingConv = data.find(
            (conv) =>
              conv.participants.some((p) => p._id === currentUserId) &&
              conv.participants.some((p) => p._id === user.recipientId)
          );
          if (existingConv) {
            setConversationId(existingConv._id);
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };
    initializeChat();
  }, [user.id, user.recipientId, isNewConversation]);

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const userResponse = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const currentUserId = userResponse.data._id;

      const { data } = await axios.get(
        `http://localhost:5000/api/messages/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const formattedMessages = data.map((msg) => ({
        id: msg._id,
        text: msg.text,
        sender: msg.sender._id === currentUserId ? "me" : "them",
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const recipientId = user.recipientId || user.id;
      const { data } = await axios.post(
        "http://localhost:5000/api/message",
        { recipientId, text: message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (isNewConversation && data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages([
        ...messages,
        { id: data._id, text: data.text, sender: "me" },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const rightOffset = 4 + index * 320;

  return (
    <div
      className="fixed bottom-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-[450px] z-70!important"
      style={{ right: `${rightOffset}px` }}
    >
      {/* Rest of the JSX remains unchanged */}
      <div className="p-3 bg-green-50 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <img
            src={user.avatar || "/api/placeholder/32/32"}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold text-gray-800">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <Phone size={18} className="text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <Video size={18} className="text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-2 rounded-lg break-words ${
                msg.sender === "me"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-800 shadow-sm border border-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none overflow-hidden"
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
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
