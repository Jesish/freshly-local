import React, { useState, useEffect } from "react";
import API from "../utils/axiosInstance";
import { FileText, Check, X } from "lucide-react";

const AdminDashboard = () => {
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingFarmers = async () => {
      setLoading(true);
      try {
        const response = await API.get("/users/pending-farmers", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPendingFarmers(response.data);
      } catch (err) {
        setError("Failed to load pending farmers.");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingFarmers();
  }, []);

  const handleVerification = async (userId, action) => {
    try {
      await API.post(
        "/users/verify-farmer",
        { userId, action },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPendingFarmers(
        pendingFarmers.filter((farmer) => farmer._id !== userId)
      );
    } catch (err) {
      setError(`Failed to ${action} farmer.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Admin - Farmer Verification
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : pendingFarmers.length === 0 ? (
          <p className="text-gray-600 text-center">No pending farmers.</p>
        ) : (
          <div className="space-y-4">
            {pendingFarmers.map((farmer) => (
              <div
                key={farmer._id}
                className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {farmer.farmName} ({farmer.fullName})
                  </h3>
                  <p className="text-sm text-gray-600">{farmer.email}</p>
                  {farmer.verificationDocuments.map((doc, index) => (
                    <a
                      key={index}
                      href={`http://localhost:5000${doc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      <FileText size={16} /> Document {index + 1}
                    </a>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerification(farmer._id, "approve")}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleVerification(farmer._id, "reject")}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
