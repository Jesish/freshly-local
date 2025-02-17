import React from "react";
import { Search, ShoppingCart } from "lucide-react";

const LandingPage = () => {
  const farms = [
    {
      id: 1,
      name: "Green Valley Farm",
      description:
        "Fresh vegetables and herbs grown with sustainable practices",
      image: "/api/placeholder/400/300",
    },
    {
      id: 2,
      name: "Sunny Orchards",
      description: "Fresh seasonal fruits from our family-owned orchard",
      image: "/api/placeholder/400/300",
    },
    {
      id: 3,
      name: "Happy Dairy Farm",
      description: "Fresh dairy products from grass-fed cows",
      image: "/api/placeholder/400/300",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <img
            src="/api/placeholder/32/32"
            alt="Freshly Local"
            className="h-8"
          />
          <span className="text-green-600 font-semibold text-xl">
            Freshly Local
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Start Selling
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Login
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-6 py-12 grid grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Connect with Farmers,
            <br />
            Freshness Guaranteed.
          </h1>
          <p className="text-gray-600 mb-8">
            Explore local farms and shop fresh produce directly from farmers.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search farm or products..."
              className="w-full px-4 py-3 pl-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div>
          <img
            src="/api/placeholder/600/400"
            alt="Happy Farmer"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Discover Farms Section */}
      <div className="px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Discover Local Farms
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {farms.map((farm) => (
              <div
                key={farm.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={farm.image}
                  alt={farm.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{farm.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {farm.description}
                  </p>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              About
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
            <a href="#" className="hover:text-gray-900">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              {/* Facebook icon placeholder */}
              <div className="w-5 h-5 bg-gray-600 rounded-full" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              {/* Instagram icon placeholder */}
              <div className="w-5 h-5 bg-gray-600 rounded-full" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
