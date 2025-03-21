// C:\Users\CHME\Desktop\freshly-local\frontend\src\components\ChatPopup.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Send, Phone, Video } from "lucide-react";

const ChatPopup = ({ user, onClose, index = 0 }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! How can I help you today?", sender: "them" },
    { id: 2, text: "Hey, I had a question about your products.", sender: "me" },
  ]); // Dummy data

  const messagesEndRef = useRef(null); // For auto-scrolling to the bottom

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      { id: messages.length + 1, text: message, sender: "me" },
    ]);
    setMessage("");
    // Add backend send logic here later
  };

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Calculate the right offset based on the index (stack chats horizontally)
  const rightOffset = 4 + index * 320; // 4rem base + 320px for each chat

  return (
    <div
      className="fixed bottom-8 w-80 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-[450px] z-40"
      style={{ right: `${rightOffset}px` }}
    >
      {/* Header */}
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

      {/* Messages */}
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

      {/* Input */}
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
