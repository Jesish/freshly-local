import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Logo and Name */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Leaf className="w-6 h-6 text-green-500" />
        <span className="text-xl text-gray-800">Freshly Local</span>
      </div>

      <div>
        <h1 className="text-2xl font-normal text-center mb-8">Login to your account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Login
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-green-600 hover:underline">
              Create an account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;