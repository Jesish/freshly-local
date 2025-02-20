import React, { useState } from "react";
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
} from "lucide-react";
import farmimage from "./assets/Farm.jpg";
const FarmProfilePage = () => {
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 0,
    review: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: value,
    });
  };

  const handleRatingChange = (rating) => {
    setReviewForm({
      ...reviewForm,
      rating: rating,
    });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    console.log("Review submitted:", reviewForm);
    // Reset form after submission
    setReviewForm({
      name: "",
      rating: 0,
      review: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Leaf className="text-green-700" />
          <span className="text-green-700 font-semibold">Freshly Local</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-1 text-gray-700">
            <Home size={18} />
            <span>Home</span>
          </a>
          <a href="#" className="flex items-center gap-1 text-gray-700">
            <User size={18} />
            <span>Account</span>
          </a>
          <a href="#" className="flex items-center gap-1 text-gray-700">
            <ShoppingCart size={18} />
            <span>Cart</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Farm Hero Section */}
        <section className="px-6 py-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden shadow-md">
            <img
              src={farmimage}
              alt="Green Valley Farm"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Green Valley Farm
            </h1>
            <div className="flex items-center gap-1 text-gray-600 mb-6">
              <MapPin size={18} className="text-gray-500" />
              <span>123 Farmland Road, Green Valley, CA 94123</span>
            </div>
            <button className="bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={18} />
              <span>Shop Now</span>
            </button>
          </div>
        </section>

        {/* About the Farm */}
        <section className="bg-green-50 py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-green-800 mb-6 text-center">
              About the Farm
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto mb-10 text-center">
              Green Valley Farm is a family-owned organic farm that has been
              serving our community for over 30 years. We take pride in our
              sustainable farming practices and commitment to producing the
              highest quality organic produce.
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
        </section>

        {/* Contact Information */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-green-800 mb-6">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="text-green-700" />
                  <span className="text-gray-700">(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-green-700" />
                  <span className="text-gray-700">
                    contact@freshlylocal.com
                  </span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden h-48 md:h-auto">
                {/* Map placeholder */}
                <img
                  src="/api/placeholder/600/300"
                  alt="Farm location map"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-green-800 mb-8 text-center">
              Customer Reviews
            </h2>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    <img
                      src="/api/placeholder/40/40"
                      alt="Sarah Johnson"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">Sarah Johnson</h3>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "Amazing organic produce! The tomatoes are the best I've ever
                  tasted. Great customer service too!"
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                    <img
                      src="/api/placeholder/40/40"
                      alt="Mike Thompson"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">Mike Thompson</h3>
                    <div className="flex">
                      {[1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      ))}
                      <Star size={16} className="text-gray-300" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "Fresh vegetables and friendly staff. Will definitely be
                  coming back!"
                </p>
              </div>
            </div>

            {/* Write a Review Form */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-medium text-green-800 mb-4 text-center">
                Write a Review
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
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

        {/* Similar Farms */}
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

      {/* Footer */}
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
