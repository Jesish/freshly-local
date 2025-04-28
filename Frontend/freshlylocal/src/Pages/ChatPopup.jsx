import React, { useState, useEffect, useRef } from "react";
import { X, Send, MoreVertical } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000");

const ChatPopup = ({ user, onClose, index = 0 }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [dropdownId, setDropdownId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageIdToDelete, setMessageIdToDelete] = useState(null);
  const messagesEndRef = useRef(null);
  const isNewConversation = user.recipientId && !user.id;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get(
          "http://localhost:5000/api/users/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const currentUserId = userResponse.data._id;
        localStorage.setItem("userId", currentUserId);

        if (!isNewConversation && user.id) {
          setConversationId(user.id);
        } else {
          const { data } = await axios.get(
            "http://localhost:5000/api/conversations",
            {
              headers: { Authorization: `Bearer ${token}` },
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
        toast.error("Failed to initialize chat. Please try again.");
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
        createdAt: msg.createdAt,
        edited: msg.edited || false,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const recipientId = user.recipientId || user.id;

      if (isEditing) {
        await axios.put(
          "http://localhost:5000/api/message",
          { messageId: editMessageId, text: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsEditing(false);
        setEditMessageId(null);
      } else {
        const { data } = await axios.post(
          "http://localhost:5000/api/message",
          { recipientId, text: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (isNewConversation && data.conversationId) {
          setConversationId(data.conversationId);
        }
      }

      setMessage("");
    } catch (error) {
      console.error(
        isEditing ? "Error editing message:" : "Error sending message:",
        error.response?.data || error
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
    } catch (error) {
      console.error("Error deleting message:", error.response?.data || error);
      toast.error("Failed to delete message. Please try again.");
    }
  };

  const confirmDelete = (messageId) => {
    setMessageIdToDelete(messageId);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const rightOffset = 4 + index * 320;

  return (
    <div
      className="fixed bottom-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-[450px] z-50"
      style={{ right: `${rightOffset}px` }}
    >
      <div className="p-3 bg-green-50 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <img
            src={
              user.avatar && user.avatar.startsWith("http")
                ? user.avatar
                : user.avatar
                ? `http://localhost:5000${user.avatar}`
                : "/api/placeholder/32/32"
            }
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover hover:scale-105 transition-transform"
          />
          <span className="font-semibold text-gray-800">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            {/* Placeholder for future buttons */}
          </button>
          <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            {/* Placeholder for future buttons */}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 hide-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            } items-start gap-2 animate-fade-in`} // Added gap and animation
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Do you really want to delete this message?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(messageIdToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isEditing ? "Editing..." : "Type a message..."}
            className={`flex-1 p-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none overflow-hidden transition-all ${
              isEditing ? "border-green-500" : ""
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
            style={{ minHeight: "40px", maxHeight: "100px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(
                e.target.scrollHeight,
                100
              )}px`;
            }}
          />
          {isEditing ? (
            <>
              <button
                onClick={handleSend}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleEditCancel}
                className="p-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-transform hover:scale-105"
                title="Cancel Edit"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={handleSend}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
