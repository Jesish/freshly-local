// C:\Users\CHME\Desktop\freshly-local\frontend\src\components\MessagesPopup.jsx
import React, { useState } from "react";
import { X, MessageSquare, MoreHorizontal, Search, Edit } from "lucide-react";

const MessagesPopup = ({ isOpen, setIsOpen, onOpenChat }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data for conversations (replace with API data later)
  const conversations = [
    {
      id: 1,
      name: "Farmer John",
      avatar: "/api/placeholder/40/40",
      lastMessage: "You: aaba dhat",
      timestamp: "12m",
      online: true,
    },
    {
      id: 2,
      name: "Farmer Jane",
      avatar: "/api/placeholder/40/40",
      lastMessage: "No room found vano",
      timestamp: "1h",
      online: false,
    },
    {
      id: 3,
      name: "Farmer Bob",
      avatar: "/api/placeholder/40/40",
      lastMessage: "You: Ok",
      timestamp: "3h",
      online: false,
    },
    {
      id: 4,
      name: "Farmer Alice",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Testai xa tei vara nth change",
      timestamp: "3h",
      online: false,
    },
    {
      id: 5,
      name: "Farmer Sam",
      avatar: "/api/placeholder/40/40",
      lastMessage: "😊",
      timestamp: "5h",
      online: false,
    },
    {
      id: 6,
      name: "Farmer Kamal",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Um",
      timestamp: "5h",
      online: true,
    },
    {
      id: 7,
      name: "Farmer Acharya",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Eah",
      timestamp: "12h",
      online: false,
    },
    {
      id: 8,
      name: "Farmer Lily",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Hey there!",
      timestamp: "1d",
      online: false,
    },
    {
      id: 9,
      name: "Farmer Mike",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thanks for the order",
      timestamp: "2d",
      online: false,
    },
  ];

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (user) => {
    onOpenChat(user); // Open the chat using the prop
    setIsOpen(false); // Optionally close the MessagesPopup
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 w-80 h-[74vh] bg-white shadow-2xl z-50 flex flex-col rounded-lg border border-gray-200">
      {/* Header */}
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

      {/* Search Bar */}
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

      {/* Conversations List */}
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
                {/* Avatar */}
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
                {/* Name and Last Message */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {conv.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {/* Timestamp */}
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
