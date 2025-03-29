// C:\Users\CHME\Desktop\freshly-local\frontend\src\context\ChatContext.jsx
import React, { createContext, useContext, useState } from "react";
import ChatPopup from "./ChatPopup";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [openChats, setOpenChats] = useState([]);

  const openChat = (user) => {
    const chatExists = openChats.some(
      (chat) => chat.id === user.id || chat.recipientId === user.recipientId
    );
    if (!chatExists) {
      setOpenChats([...openChats, user]);
    }
  };

  const closeChat = (userId) => {
    setOpenChats(
      openChats.filter(
        (chat) => chat.id !== userId && chat.recipientId !== userId
      )
    );
  };

  return (
    <ChatContext.Provider value={{ openChat, closeChat }}>
      {children}
      {openChats.map((user, index) => (
        <ChatPopup
          key={user.id || user.recipientId}
          user={user}
          onClose={() => closeChat(user.id || user.recipientId)}
          index={index}
        />
      ))}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
