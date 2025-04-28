import React, { useState, useEffect, useRef } from "react";
import { Send, ChevronLeft, MoreVertical, X } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientId, setRecipientId] = useState(null);
  const [dropdownId, setDropdownId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  /* ──────────────────────────────────────────
     Socket events & initial fetch
  ──────────────────────────────────────────*/
  useEffect(() => {
    socket.emit("joinConversation", conversationId);

    socket.on("newMessage", (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        setMessages((prev) => [
          ...prev,
          {
            id: newMessage._id,
            text: newMessage.text,
            sender:
              newMessage.sender._id === localStorage.getItem("userId")
                ? "me"
                : "them",
            createdAt: newMessage.createdAt,
            edited: newMessage.edited || false,
          },
        ]);
      }
    });

    socket.on("messageEdited", (updated) => {
      if (updated.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === updated._id
              ? { ...m, text: updated.text, edited: true }
              : m
          )
        );
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    fetchMessages();

    return () => {
      socket.off("newMessage");
      socket.off("messageEdited");
      socket.off("messageDeleted");
    };
  }, [conversationId]);

  /* ──────────────────────────────────────────
     Helpers
  ──────────────────────────────────────────*/
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const meRes = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUserId = meRes.data._id;
      localStorage.setItem("userId", currentUserId);

      const { data } = await axios.get(
        `http://localhost:5000/api/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formatted = data.map((msg) => ({
        id: msg._id,
        text: msg.text,
        sender: msg.sender._id === currentUserId ? "me" : "them",
        senderId: msg.sender._id,
        recipientId: msg.recipient._id,
        createdAt: msg.createdAt,
        edited: msg.edited || false,
      }));

      const convRes = await axios.get(
        "http://localhost:5000/api/conversations",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const conversation = convRes.data.find((c) => c._id === conversationId);
      const other = conversation.participants.find(
        (p) => p._id !== currentUserId
      );

      setRecipientName(other?.fullName || "Unknown User");
      setRecipientId(other?._id);
      setMessages(formatted);
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !recipientId) return;
    try {
      const token = localStorage.getItem("token");
      if (isEditing) {
        await axios.put(
          "http://localhost:5000/api/message",
          { messageId: editMessageId, text: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsEditing(false);
        setEditMessageId(null);
      } else {
        await axios.post(
          "http://localhost:5000/api/message",
          { recipientId, text: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setMessage("");
    } catch (err) {
      console.error(
        isEditing ? "Error editing message:" : "Error sending message:",
        err.response?.data || err
      );
      toast.error(
        isEditing
          ? "Failed to edit message. Please try again."
          : "Failed to send message. Please try again."
      );
    }
  };

  const handleEditStart = (messageId, text) => {
    setIsEditing(true);
    setEditMessageId(messageId);
    setMessage(text);
    setDropdownId(null);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditMessageId(null);
    setMessage("");
  };

  const handleDelete = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDropdownId(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting message:", err.response?.data || err);
      toast.error("Failed to delete message. Please try again.");
    }
  };

  const confirmDelete = (messageId) => {
    setMsgToDelete(messageId);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ──────────────────────────────────────────
     UI
  ──────────────────────────────────────────*/
  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/messages")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Chat with {recipientName}
            </h1>
          </div>
        </div>

        {/* Chat box */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-[75vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 hide-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                } items-start gap-3 animate-fade-in`}
              >
                {msg.sender === "me" && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDropdownId(dropdownId === msg.id ? null : msg.id)
                      }
                      className="p-1 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Message options"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {dropdownId === msg.id && (
                      <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-slide-down">
                        <button
                          onClick={() => handleEditStart(msg.id, msg.text)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(msg.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg break-words shadow-sm ${
                    msg.sender === "me"
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs italic opacity-75 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.edited && " (edited)"}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isEditing ? "Editing..." : "Type a message..."}
              className={`flex-1 p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none overflow-hidden transition-all ${
                isEditing ? "border-green-500" : "border-gray-300"
              }`}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                } else if (e.key === "Escape" && isEditing) {
                  handleEditCancel();
                }
              }}
              style={{ minHeight: "48px", maxHeight: "120px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  120
                )}px`;
              }}
            />
            {isEditing ? (
              <>
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  title="Cancel Edit"
                  aria-label="Cancel edit"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={handleSend}
                className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Do you really want to delete this message?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(msgToDelete);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
