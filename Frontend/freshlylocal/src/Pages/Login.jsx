import React, { useState } from "react";
import API from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, X } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await API.post("/users/login", formData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        if (response.data.userType === "farmer") {
          if (response.data.isVerified) {
            navigate("/Dashboard");
          } else {
            setError("You are not yet verified.");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
          }
        } else if (response.data.userType === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      setError(error.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!forgotEmail) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!validateEmail(forgotEmail)) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    try {
      await API.post("/users/forgot-password", { email: forgotEmail });
      localStorage.setItem("resetEmail", forgotEmail);
      setShowForgotPopup(false);
      navigate("/forgot-password");
    } catch (error) {
      setError(error.response?.data?.msg || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Freshly Local" className="h-12" />
          <span className="text-2xl font-bold text-green-600 ml-2">
            Freshly Local
          </span>
        </div>

        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4 space-y-2">
            <p>
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-green-600 hover:underline font-medium"
              >
                Sign Up
              </a>
            </p>
            <p>
              <button
                type="button"
                onClick={() => setShowForgotPopup(true)}
                className="text-green-600 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </p>
          </div>
        </form>

        {showForgotPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full relative animate-fade-in">
              <button
                onClick={() => setShowForgotPopup(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Reset Password
              </h3>
              <form onSubmit={handleForgotSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
