// C:\Users\CHME\Desktop\freshly-local\frontend\src\Pages\FarmDetails.jsx
import {
  MapPin,
  Home,
  User,
  ShoppingCart,
  Phone,
  Mail,
  Star,
  Home as HomeIcon,
  Truck,
  Leaf,
  Edit2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useChat } from "./ChatContext";
import axios from "axios";
import farmer from "../assets/farm.png";
import Navbar from "./Navbar";
import ChatPopup from "./ChatPopup"; // Import ChatPopup directly

const FarmProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    review: "",
  });
  const [editReviewId, setEditReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, review: "" });
  const [consumerName, setConsumerName] = useState("");
  const [consumerId, setConsumerId] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // Reintroduce isChatOpen
  const { openChat } = useChat();
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

  useEffect(() => {
    const fetchConsumerDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setConsumerName(response.data.fullName);
        setConsumerId(response.data._id);
      } catch (error) {
        console.error("Error fetching consumer details:", error);
        setConsumerName("Anonymous");
        setConsumerId("");
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
        {
          farmId: id,
          rating: reviewForm.rating,
          review: reviewForm.review,
        },
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

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/reviews/${editReviewId}`,
        {
          rating: editForm.rating,
          review: editForm.review,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setReviews(
        reviews.map((r) => (r._id === editReviewId ? response.data.review : r))
      );
      setEditReviewId(null);
      setEditForm({ rating: 0, review: "" });
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setReviews(reviews.filter((r) => r._id !== reviewId));
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  if (!farm) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <section className="px-6 py-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden shadow-md">
            <img
              src={farm.farmImage || farmer}
              alt="image"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              {farm.farmName}
            </h1>
            <div className="flex items-center gap-1 text-gray-600 mb-6">
              <MapPin size={18} className="text-gray-500" />
              <span>{farm.farmLocation}</span>
            </div>
            <button
              className="bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
              onClick={() => navigate(`/ProductPage/${id}`)}
            >
              <ShoppingCart size={18} />
              <span>Shop Now</span>
            </button>
          </div>
        </section>

        <section className="bg-green-50 py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-green-800 mb-6 text-center">
              About the Farm
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto mb-10 text-center">
              {farm.farmdescription}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <Leaf className="text-green-700" />
                <span className="text-gray-700">100% Organic Produce</span>
              </div>
              <div className="flex items-center gap-3">
                <HomeIcon className="text-green-700" />
                <span className="text-gray-700">Family-Owned Since 1990</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="text-green-700" />
                <span className="text-gray-700">Local Delivery Available</span>
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              openChat({
                id: User._id,//changed for the error 403 error one.....
                name: farm.farmName,
                recipientId: id,
              })
            }
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <MessageSquare size={20} /> Message Farmer
          </button>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-green-800 mb-6">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="text-green-700" />
                  <span className="text-gray-700">{farm.farmerPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-green-700" />
                  <span className="text-gray-700">{farm.farmerEmail}</span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden h-48 md:h-auto">
                <img
                  src="/api/placeholder/600/300"
                  alt="Farm location map"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-green-800 mb-8 text-center">
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 col-span-2">
                  No reviews yet.
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white p-6 rounded-lg shadow-sm"
                  >
                    {editReviewId === review._id ? (
                      <form onSubmit={handleUpdateReview}>
                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleEditRatingChange(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  size={24}
                                  className={`${
                                    editForm.rating >= star
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2">
                            Your Review
                          </label>
                          <textarea
                            name="review"
                            value={editForm.review}
                            onChange={handleEditInputChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          ></textarea>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md transition-colors"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditReviewId(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            <img
                              src="/api/placeholder/40/40"
                              alt={review.name || review.consumerId?.fullName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {review.name || review.consumerId?.fullName}
                            </h3>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={`${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          {review.review}
                        </p>
                        {review.consumerId?._id === consumerId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-medium text-green-800 mb-4 text-center">
                Write a Review
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={consumerName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={`${
                            reviewForm.rating >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    name="review"
                    value={reviewForm.review}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="py-12 px-6 bg-green-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-green-800 mb-8 text-center">
              Similar Farms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/api/placeholder/400/300"
                    alt="Sunrise Organic Farm"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    Sunrise Organic Farm
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Specializing in organic vegetables and fruits
                  </p>
                  <a
                    href="#"
                    className="text-green-700 text-sm font-medium hover:underline"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/api/placeholder/400/300"
                    alt="Valley View Gardens"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    Valley View Gardens
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Fresh flowers and seasonal produce
                  </p>
                  <a
                    href="#"
                    className="text-green-700 text-sm font-medium hover:underline"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/api/placeholder/400/300"
                    alt="Heritage Family Farm"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    Heritage Family Farm
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Heritage varieties and artisanal products
                  </p>
                  <a
                    href="#"
                    className="text-green-700 text-sm font-medium hover:underline"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <ChatPopup
          user={{ id: id, name: farm.farmName, recipientId: id }}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      <footer className="bg-green-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">freshly local</h3>
            <p className="text-green-100 text-sm">
              Connecting you to local farms and fresh produce.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-green-100">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Find Farms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  How it Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-green-100">
              <li>support@freshlylocal.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-green-100 hover:text-white">
                <span className="w-8 h-8 border border-green-100 rounded-full flex items-center justify-center">
                  f
                </span>
              </a>
              <a href="#" className="text-green-100 hover:text-white">
                <span className="w-8 h-8 border border-green-100 rounded-full flex items-center justify-center">
                  in
                </span>
              </a>
              <a href="#" className="text-green-100 hover:text-white">
                <span className="w-8 h-8 border border-green-100 rounded-full flex items-center justify-center">
                  t
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-6 mt-6 border-t border-green-700 text-center text-sm text-green-100">
          © 2025 FreshlyLocal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default FarmProfilePage;
