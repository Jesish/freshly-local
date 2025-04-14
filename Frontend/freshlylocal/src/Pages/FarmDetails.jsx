// C:\Users\CHME\Desktop\freshly-local\frontend\src\Pages\FarmDetails.jsx
import {
  MapPin,
  Phone,
  Mail,
  Star,
  MessageSquare,
  ShoppingCart,
  Leaf,
  Home as HomeIcon,
  Truck,
  Edit2,
  Trash2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useChat } from "./ChatContext";
import axios from "axios";
import Navbar from "./Navbar";
import ChatPopup from "./ChatPopup";
import DirectionsMap from "./DirectionsMap";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Are you sure you want to delete this review?
        </h3>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className="bg-teal-400 hover:bg-teal-500 text-white py-2 px-4 rounded-md text-sm transition-all duration-200"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const FarmProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, review: "" });
  const [editReviewId, setEditReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, review: "" });
  const [consumer, setConsumer] = useState({
    fullName: "",
    _id: "",
    profileImage: "",
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const { openChat } = useChat();
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (
      farm?.farmLocation?.coordinates &&
      !mapRef.current &&
      mapContainerRef.current &&
      !showDirections
    ) {
      const [lng, lat] = farm.farmLocation.coordinates;
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([lat, lng], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup(farm.farmName).openPopup();

      map.on("click", () => setShowDirections(true));

      setTimeout(() => map.invalidateSize(), 100);

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [farm, showDirections]);

  useEffect(() => {
    if (showDirections && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [showDirections]);

  // Fetch farm details
  useEffect(() => {
    const fetchFarmDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/farm/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFarm(response.data);
      } catch (error) {
        console.error("Error fetching farm details:", error);
      }
    };
    fetchFarmDetails();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/reviews/farm/${id}`
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id]);

  // Fetch consumer details
  useEffect(() => {
    const fetchConsumerDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setConsumer({
          fullName: response.data.fullName,
          _id: response.data._id,
          profileImage: response.data.profileImage || "",
        });
      } catch (error) {
        console.error("Error fetching consumer details:", error);
        setConsumer({ fullName: "Anonymous", _id: "", profileImage: "" });
      }
    };
    fetchConsumerDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({ ...reviewForm, [name]: value });
  };

  const handleRatingChange = (rating) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditRatingChange = (rating) => {
    setEditForm({ ...editForm, rating });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        { farmId: id, rating: reviewForm.rating, review: reviewForm.review },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setReviews([...reviews, response.data.review]);
      setReviewForm({ rating: 0, review: "" });
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleEditReview = (review) => {
    setEditReviewId(review._id);
    setEditForm({ rating: review.rating, review: review.review });
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReviews(reviews.filter((r) => r._id !== reviewId));
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const openDeleteModal = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      handleDeleteReview(reviewToDelete);
    }
  };

  const truncateReview = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (!farm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                {farm.farmImage && farm.farmImage.length > 0 ? (
                  <div className="relative rounded-xl overflow-hidden shadow-md">
                    <div className="flex space-x-4 snap-x snap-mandatory overflow-x-auto scrollbar-hide">
                      {farm.farmImage.map((img, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${img}`}
                          alt={`Farm Image ${index + 1}`}
                          className="w-full h-96 object-cover snap-center rounded-xl"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center text-gray-500">
                    No farm images available
                  </div>
                )}
              </div>
              <div className="lg:col-span-2 flex flex-col justify-center items-center lg:items-center">
                <div className="flex flex-col items-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 mr-72">
                    {farm.farmName}
                  </h1>
                  <div className="flex items-center gap-3">
                    <MapPin size={24} className="text-green-600" />
                    <span className="text-lg text-gray-600">
                      {farm.farmLocation.placeName}
                    </span>
                  </div>
                </div>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                  onClick={() => navigate(`/ProductPage/${id}`)}
                >
                  <ShoppingCart size={20} />
                  Shop Now
                </button>
                <button
                  onClick={() =>
                    openChat({
                      id: farm._id,
                      name: farm.farmName,
                      recipientId: id,
                    })
                  }
                  className="w-full mt-4 bg-white hover:bg-gray-100 text-gray-800 py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-gray-200 transition-all duration-300 shadow-md"
                >
                  <MessageSquare size={20} />
                  Message Farmer
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              About the Farm
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed text-lg">
              {farm.farmdescription ||
                "Fresh, organic produce grown with care."}
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-3">
                <Leaf className="text-green-600" size={24} />
                <span className="text-gray-700 text-lg">100% Organic</span>
              </div>
              <div className="flex items-center gap-3">
                <HomeIcon className="text-green-600" size={24} />
                <span className="text-gray-700 text-lg">Family-Owned</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="text-green-600" size={24} />
                <span className="text-gray-700 text-lg">Local Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Location */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
              Contact & Location
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-4">
                  <Phone className="text-green-600" size={24} />
                  <span className="text-gray-700 text-lg">
                    {farm.farmerPhone}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="text-green-600" size={24} />
                  <span className="text-gray-700 text-lg">
                    {farm.farmerEmail}
                  </span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-md">
                {farm.farmLocation?.coordinates && !showDirections ? (
                  <div ref={mapContainerRef} className="w-full h-80" />
                ) : (
                  <p className="text-center text-gray-500 flex items-center justify-center h-80">
                    {showDirections
                      ? "Viewing directions"
                      : "Location unavailable"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-16 px-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
              Customer Reviews
            </h2>
            {/* Review Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {reviews.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 text-base">
                  No reviews yet. Share your thoughts!
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white/30 backdrop-blur-md p-4 rounded-lg shadow-sm hover:scale-105 hover:rotate-2 transition-all duration-300 animate-fade-in"
                  >
                    {editReviewId === review._id ? (
                      <div className="space-y-2">
                        <div className="flex flex-col items-center">
                          <img
                            src={
                              consumer.profileImage
                                ? `http://localhost:5000${consumer.profileImage}`
                                : "https://via.placeholder.com/40"
                            }
                            alt={consumer.fullName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-400 mb-2"
                          />
                          <h3 className="text-xs font-bold text-gray-800">
                            {consumer.fullName}
                          </h3>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleEditRatingChange(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  size={16}
                                  className={`${
                                    editForm.rating >= star
                                      ? "text-yellow-500 fill-yellow-500 animate-pop"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          name="review"
                          value={editForm.review}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          placeholder="Edit review (50 chars max)"
                          maxLength={50}
                          required
                        />
                        <div className="flex gap-2 justify-center">
                          <button
                            type="submit"
                            onClick={handleUpdateReview}
                            className="bg-teal-400 hover:bg-teal-500 text-white py-1 px-2 rounded-md text-xs transition-all duration-200"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditReviewId(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded-md text-xs transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center relative">
                        <img
                          src={
                            review.consumerId?.profileImage
                              ? `http://localhost:5000${review.consumerId.profileImage}`
                              : "https://via.placeholder.com/40"
                          }
                          alt={review.consumerId?.fullName || "Reviewer"}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-400 mb-2"
                        />
                        <h3 className="text-xs font-bold text-gray-800">
                          {review.consumerId?.fullName || "Anonymous"}
                        </h3>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${
                                star <= review.rating
                                  ? "text-yellow-500 fill-yellow-500 animate-pop"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-black text-center">
                          {truncateReview(review.review)}
                        </p>
                        {review.consumerId?._id === consumer._id && (
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-teal-400 hover:animate-spin transition-all duration-200"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(review._id)}
                              className="text-red-500 hover:animate-spin transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Review Form */}
            <div className="max-w-md mx-auto bg-gray-200 p-6 rounded-lg shadow-md border-2 border-gradient-to-r from-teal-400 to-pink-400">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Share Your Review
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      consumer.profileImage
                        ? `http://localhost:5000${consumer.profileImage}`
                        : "https://via.placeholder.com/40"
                    }
                    alt={consumer.fullName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-400 mb-2"
                  />
                  <input
                    type="text"
                    value={consumer.fullName}
                    disabled
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-center bg-gray-100"
                  />
                </div>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={16}
                        className={`${
                          reviewForm.rating >= star
                            ? "text-yellow-500 fill-yellow-500 animate-pop"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  name="review"
                  value={reviewForm.review}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Your review (50 chars max)"
                  maxLength={50}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-teal-400 hover:bg-teal-500 hover:animate-pulse text-white py-1.5 px-3 rounded-md text-sm transition-all duration-200"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <ChatPopup
          user={{ id: farm._id, name: farm.farmName, recipientId: id }}
          onClose={() => setIsChatOpen(false)}
        />
      )}
      {showDirections && (
        <DirectionsMap
          destination={farm.farmLocation}
          onClose={() => setShowDirections(false)}
        />
      )}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Freshly Local</h3>
            <p className="text-gray-300 text-sm">
              Connecting you to local farms and fresh produce.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Find Farms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>support@freshlylocal.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <span className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center">
                  f
                </span>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <span className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center">
                  in
                </span>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <span className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center">
                  t
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-gray-700 text-center text-sm text-gray-300">
          © 2025 FreshlyLocal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default FarmProfilePage;
