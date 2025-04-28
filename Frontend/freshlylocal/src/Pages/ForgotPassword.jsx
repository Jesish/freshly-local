import React, { useState, useEffect, useRef } from "react";
import API from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/users/verify-otp", {
        email,
        otp: otpCode,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/reset-password"), 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Invalid or expired OTP");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await API.post("/users/forgot-password", { email });
      setMessage("New OTP sent");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="text-xl text-gray-800">Freshly Local</span>
      </div>
      <h1 className="text-2xl font-normal text-center mb-8">Verify OTP</h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Enter the 6-digit OTP sent to {email}
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
            />
          ))}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && (
          <p className="text-green-500 text-sm text-center">{message}</p>
        )}
        <p className="text-center text-sm text-gray-600">
          Time remaining: {timer}s {timer === 0 && <span>(OTP expired)</span>}
        </p>
        <div>
          <button
            type="submit"
            disabled={loading || timer === 0}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
        {timer === 0 && (
          <div>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300"
            >
              {loading ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default VerifyOTP;
