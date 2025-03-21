// C:\Users\CHME\Desktop\freshly-local\frontend\src\components\Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, User, ShoppingCart, MessageSquare, Leaf } from "lucide-react";
import axios from "axios";
import CartModal from "./Cartmodel";
import MessagesPopup from "./MessagesPopup";
import ChatPopup from "./ChatPopup";

const Navbar = ({ onCartUpdate }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [openChats, setOpenChats] = useState([]); // Track open chat popups

  useEffect(() => {
    if (token) {
      fetchCartCount();
    }
  }, [token]);

  const fetchCartCount = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/getcart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCartCount(data.items ? data.items.length : 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(fetchCartCount);
    }
  }, [onCartUpdate]);

  // Function to open a chat
  const handleOpenChat = (user) => {
    if (!openChats.find((chat) => chat.id === user.id)) {
      setOpenChats([...openChats, user]);
    }
  };

  // Function to close a chat
  const handleCloseChat = (userId) => {
    setOpenChats(openChats.filter((chat) => chat.id !== userId));
  };

  return (
    <>
      <header className="bg-white py-4 px-6 flex justify-between items-center border-b shadow-sm">
        <div className="flex items-center gap-2">
          <Leaf className="text-green-700" size={28} />
          <span className="text-green-700 font-semibold text-xl">
            Freshly Local
          </span>
        </div>
        {!token ? (
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={() => navigate("/signup")}
            >
              Start Selling
            </button>
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6 text-gray-700">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:text-green-700 transition-colors"
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate("/consumerprofile")}
              className="flex items-center gap-2 hover:text-green-700 transition-colors"
            >
              <User size={20} />
              <span>Account</span>
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 hover:text-green-700 transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMessagesOpen(true)}
              className="flex items-center gap-2 hover:text-green-700 transition-colors"
            >
              <MessageSquare size={20} />
              <span>Messages</span>
            </button>
          </div>
        )}
      </header>
      <CartModal
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        onCartUpdate={fetchCartCount}
      />
      <MessagesPopup
        isOpen={isMessagesOpen}
        setIsOpen={setIsMessagesOpen}
        onOpenChat={handleOpenChat}
      />
      {/* Render all open chats */}
      {openChats.map((chat) => (
        <ChatPopup
          key={chat.id}
          user={chat}
          onClose={() => handleCloseChat(chat.id)}
        />
      ))}
    </>
  );
};

export default Navbar;
