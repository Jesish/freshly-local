// C:\Users\CHME\Desktop\freshly-local\frontend\src\pages\Messages.jsx
import React, { useState, useEffect } from "react";
import { MessageSquare, Search, ChevronRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Adjust path if needed

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const userResponse = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userId = userResponse.data._id;

      const { data } = await axios.get(
        "http://localhost:5000/api/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedConversations = data.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p._id !== userId
        );
        return {
          id: conv._id,
          name: otherParticipant?.fullName || "Unknown User",
          avatar: otherParticipant?.farmImage || "/api/placeholder/40/40",
          lastMessage: conv.lastMessage
            ? conv.lastMessage.text
            : "No messages yet",
          timestamp: new Date(conv.updatedAt).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "short",
          }),
          recipientId: otherParticipant?._id,
          unread:
            conv.lastMessage &&
            new Date(conv.updatedAt) > new Date(userResponse.data.lastLogin),
        };
      });

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (convId) => {
    navigate(`/messages/${convId}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
          <MessageSquare size={28} className="text-[#81C784]" />
          Messages
        </h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:border-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={40} className="mx-auto mb-2 text-gray-300" />
              <p>No conversations found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredConversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {conv.name}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {conv.timestamp}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        conv.unread
                          ? "text-gray-800 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <span className="w-2 h-2 bg-[#81C784] rounded-full flex-shrink-0" />
                  )}
                  <ChevronRight
                    size={20}
                    className="text-gray-400 flex-shrink-0"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
