import React, { useState } from "react";
import API from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/users/reset-password", {
        email,
        password,
      });
      setMessage(response.data.message);
      setShowPopup(true);
      localStorage.removeItem("resetEmail");
      setTimeout(() => {
        setShowPopup(false);
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="text-xl text-gray-800">Freshly Local</span>
      </div>
      <h1 className="text-2xl font-normal text-center mb-8">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
            placeholder="Confirm new password"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {message && <p className="text-green-500 text-sm mt-1">{message}</p>}
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Success!</h3>
            <p>Your password has been reset successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
