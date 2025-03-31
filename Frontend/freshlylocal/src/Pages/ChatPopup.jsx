// C:\Users\CHME\Desktop\freshly-local\frontend\src\context\ChatPopup.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatPopup = ({ user, onClose, index = 0 }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [dropdownId, setDropdownId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef(null);
  const isNewConversation = user.recipientId && !user.id;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUserId = userResponse.data._id;
        localStorage.setItem("userId", currentUserId);

        if (!isNewConversation && user.id) {
          setConversationId(user.id);
        } else {
          const { data } = await axios.get("http://localhost:5000/api/conversations", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const existingConv = data.find(conv =>
            conv.participants.some(p => p._id === currentUserId) &&
            conv.participants.some(p => p._id === user.recipientId)
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
    if (conversationId) {
      socket.emit("joinConversation", conversationId);

      socket.on("newMessage", (newMessage) => {
        if (newMessage.conversationId === conversationId) {
          setMessages((prev) => [
            ...prev,
            {
              id: newMessage._id,
              text: newMessage.text,
              sender: newMessage.sender._id === localStorage.getItem("userId") ? "me" : "them",
              createdAt: newMessage.createdAt,
              edited: newMessage.edited || false,
            },
          ]);
        }
      });

      socket.on("messageEdited", (updatedMessage) => {
        if (updatedMessage.conversationId === conversationId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage._id
                ? { ...msg, text: updatedMessage.text, edited: true }
                : msg
            )
          );
        }
      });

      socket.on("messageDeleted", ({ messageId }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      });

      fetchMessages();

      return () => {
        socket.off("newMessage");
        socket.off("messageEdited");
        socket.off("messageDeleted");
      };
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const userResponse = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUserId = userResponse.data._id;

      const { data } = await axios.get(`http://localhost:5000/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedMessages = data.map((msg) => ({
        id: msg._id,
        text: msg.text,
        sender: msg.sender._id === currentUserId ? "me" : "them",
        createdAt: msg.createdAt,
        edited: msg.edited || false,
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (isNewConversation && data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error);
    }
  };

  const handleEdit = async (messageId) => {
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/message",
        { messageId, text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setDropdownId(null);
    } catch (error) {
      console.error("Error editing message:", error.response?.data || error);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDropdownId(null);
    } catch (error) {
      console.error("Error deleting message:", error.response?.data || error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const rightOffset = 4 + index * 320;

  return (
    <div
      className="fixed bottom-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-[450px] z-70"
      style={{ right: `${rightOffset}px` }}
    >
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
            className={`mb-3 flex ${msg.sender === "me" ? "justify-end" : "justify-start"} relative group`}
          >
            {editingId === msg.id ? (
              <div className="max-w-[70%] flex items-center gap-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="1"
                  autoFocus
                />
                <button
                  onClick={() => handleEdit(msg.id)}
                  className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                className={`max-w-[70%] p-2 rounded-lg break-words ${
                  msg.sender === "me"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-800 shadow-sm border border-gray-200"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.edited && " (edited)"}
                </span>
              </div>
            )}
            {msg.sender === "me" && !editingId && (
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setDropdownId(dropdownId === msg.id ? null : msg.id)}
                  className="p-1 text-gray-600 hover:text-gray-800"
                >
                  <MoreHorizontal size={16} />
                </button>
                {dropdownId === msg.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <button
                      onClick={() => {
                        setEditingId(msg.id);
                        setEditText(msg.text);
                        setDropdownId(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
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
              e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
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