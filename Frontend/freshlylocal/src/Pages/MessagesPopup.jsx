import React, { useState, useEffect } from "react";
import { X, MessageSquare, MoreHorizontal, Search, Edit } from "lucide-react";
import axios from "axios";
import { useChat } from "./ChatContext"; // Ensure correct path

const MessagesPopup = ({ isOpen, setIsOpen }) => {
  const { openChat } = useChat(); // This should now work
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const userResponse = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const userId = userResponse.data._id;

      const { data } = await axios.get(
        "http://localhost:5000/api/conversations",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
          timestamp: new Date(conv.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          online: false,
          recipientId: otherParticipant?._id,
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

  const handleSelectChat = (conv) => {
    openChat({
      id: conv.id,
      name: conv.name,
      avatar: conv.avatar,
      recipientId: conv.recipientId,
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 w-80 h-[60vh] bg-white shadow-2xl z-50 flex flex-col rounded-lg border border-gray-200">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare size={20} className="text-green-600" /> Chats
        </h2>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Edit size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Messenger"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No conversations found.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredConversations.map((conv) => (
              <li
                key={conv.id}
                onClick={() => handleSelectChat(conv)}
                className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {conv.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{conv.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MessagesPopup;
