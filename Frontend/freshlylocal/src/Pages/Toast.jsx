// C:\Users\CHME\Desktop\freshly-local\frontend\src\components\Toast.jsx
import React, { useEffect } from "react";

const Toast = ({ message, isVisible, setIsVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, setIsVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
};

export default Toast;
