const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const uploadDir = path.join(__dirname, "..", "..", "uploads");
const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();

// Ensure the folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const signup = async (req, res) => {
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "farmImage", maxCount: 1 },
    { name: "verificationDocuments", maxCount: 5 },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ msg: "File upload error" });
    }

    const {
      fullName,
      email,
      phoneNumber,
      password,
      farmName,
      farmLocation,
      userType,
    } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      if (userType === "farmer") {
        if (!req.files || !req.files["farmImage"]) {
          return res
            .status(400)
            .json({ msg: "Farm image is required for farmers" });
        }
        if (!req.files || !req.files["verificationDocuments"]) {
          return res
            .status(400)
            .json({ msg: "At least one verification document is required" });
        }
      }

      const userData = {
        fullName,
        email,
        phoneNumber,
        password,
        userType,
        farmLocation: farmLocation ? JSON.parse(farmLocation) : undefined,
        isVerified: userType === "farmer" ? false : true, // Farmers need approval
      };

      if (farmName) userData.farmName = farmName;
      if (req.files && req.files["profileImage"]) {
        userData.profileImage = `/Uploads/${req.files["profileImage"][0].filename}`;
      }
      if (req.files && req.files["farmImage"]) {
        userData.farmImage = `/Uploads/${req.files["farmImage"][0].filename}`;
      }
      if (req.files && req.files["verificationDocuments"]) {
        userData.verificationDocuments = req.files["verificationDocuments"].map(
          (file) => `/Uploads/${file.filename}`
        );
      }

      user = new User(userData);
      await user.save();

      res.status(201).json({
        msg:
          userType === "farmer"
            ? "Account created, awaiting admin approval"
            : "User created successfully",
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (user.userType === "farmer" && !user.isVerified) {
      return res.status(403).json({ msg: "You are not yet verified" });
    }

    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      msg: "Login successful",
      token,
      userId: user._id,
      userType: user.userType,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

//get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user); // Return full user object
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "farmImages", maxCount: 10 },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ msg: "File upload error" });
    }

    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const {
      fullName,
      email,
      phoneNumber,
      farmName,
      farmdescription,
      farmLocation,
    } = req.body;

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Update personal details
      if (fullName) user.fullName = fullName;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      // Update farmer-specific details
      if (user.userType === "farmer") {
        if (farmName) user.farmName = farmName;
        if (farmdescription) user.farmdescription = farmdescription; // Matches schema
        if (farmLocation) {
          const parsedLocation = JSON.parse(farmLocation);
          user.farmLocation = {
            type: "Point",
            coordinates:
              parsedLocation.coordinates || user.farmLocation.coordinates,
            placeName: parsedLocation.placeName || user.farmLocation.placeName,
          };
        }
      }

      // Handle profile image
      if (req.files && req.files["profileImage"]) {
        user.profileImage = `/uploads/${req.files["profileImage"][0].filename}`;
      }

      // Handle farm images
      if (req.files && req.files["farmImages"]) {
        const newFarmImages = req.files["farmImages"].map(
          (file) => `/uploads/${file.filename}`
        );
        user.farmImage = user.farmImage
          ? [...user.farmImage, ...newFarmImages]
          : newFarmImages;
      }

      await user.save();

      console.log("Updated user:", user);
      res.json({ msg: "Profile updated successfully", user });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  });
};

//to get all farmers
const getAllFarmers = async (req, res) => {
  try {
    // Check if the user is a consumer (not a farmer)
    if (req.user.userType !== "consumer") {
      return res
        .status(403)
        .json({ msg: "Access denied, only consumers can view farmers" });
    }

    // Fetch all farmers
    const farmers = await User.find({ userType: "farmer" }).select(
      "name email"
    );
    res.json(farmers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get All Farms (Consumer Side)
const getAllFarms = async (req, res) => {
  try {
    const farms = await User.find({
      userType: "farmer",
      isVerified: true,
    }).select("fullName farmName farmLocation farmImage");
    res.json(farms);
  } catch (error) {
    console.error("Error fetching farms:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Fetch farm details by ID
const getFarmById = async (req, res) => {
  try {
    const farm = await User.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }
    console.log("Farm profileImage:", farm.profileImage); // Added for debugging

    res.json({
      farmName: farm.farmName,
      farmLocation: farm.farmLocation,
      farmImage: farm.farmImage,
      farmdescription: farm.farmdescription,
      farmerName: farm.fullName,
      farmerEmail: farm.email,
      farmerPhone: farm.phoneNumber,
      profileImage: farm.profileImage
        ? `http://localhost:5000${farm.profileImage}`
        : "/api/placeholder/32/32", // Changed to include profileImage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getFarmerStats = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // Total Products
    const totalProducts = await Product.countDocuments({ farmer: farmerId });

    // Total Orders
    const totalOrders = await Transaction.countDocuments({ farmId: farmerId });

    // Monthly Earnings (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyOrders = await Transaction.find({
      farmId: farmerId,
      createdAt: { $gte: thirtyDaysAgo },
      status: "completed", // Only completed orders count towards earnings
    });
    const monthlyEarnings = monthlyOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Pending Orders
    const pendingOrders = await Transaction.countDocuments({
      farmId: farmerId,
      status: "pending",
    });

    res.json({
      totalProducts,
      totalOrders,
      monthlyEarnings,
      pendingOrders,
    });
  } catch (error) {
    console.error("Error fetching farmer stats:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const getFarmerProfile = async (req, res) => {
  try {
    // Fetch the authenticated farmer's data by their ID (from protect middleware)
    const farmer = await User.findById(req.user._id).select("-password"); // Exclude password

    if (!farmer) {
      return res.status(404).json({ msg: "Farmer not found" });
    }

    // Ensure the user is a farmer
    if (farmer.userType !== "farmer") {
      return res.status(403).json({ msg: "Not authorized as a farmer" });
    }

    // Return farmer-specific details
    res.json({
      fullName: farmer.fullName,
      email: farmer.email,
      phoneNumber: farmer.phoneNumber,
      farmName: farmer.farmName,
      farmLocation: farmer.farmLocation,
      farmImage: farmer.farmImage,
      farmdescription: farmer.farmdescription,
      userType: farmer.userType,
    });
  } catch (error) {
    console.error("Error fetching farmer profile:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Reset Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Email not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 60 * 1000; // 60 seconds
    await user.save();
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Freshly Local Password Reset OTP",
      text: `Your OTP is: ${otp}\nThis OTP is valid for 60 seconds.`,
    };
    console.log("Email User:", process.env.EMAIL_USER);
    console.log("Email Pass:", process.env.EMAIL_PASS);
    const transporter = require("nodemailer").createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }
    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.password = password; // Hashed by pre-save middleware
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: Get Pending Farmers
const getPendingFarmers = async (req, res) => {
  try {
    const farmers = await User.find({
      userType: "farmer",
      isVerified: false,
    }).select("fullName email farmName farmImage verificationDocuments");
    res.json(farmers);
  } catch (error) {
    console.error("Error fetching pending farmers:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: Approve/Reject Farmer
const verifyFarmer = async (req, res) => {
  try {
    const { userId, action } = req.body;
    const farmer = await User.findById(userId);
    if (!farmer || farmer.userType !== "farmer") {
      return res.status(404).json({ msg: "Farmer not found" });
    }

    if (action === "approve") {
      farmer.isVerified = true;
      await farmer.save();
      res.json({ msg: "Farmer approved" });
    } else if (action === "reject") {
      await farmer.deleteOne();
      res.json({ msg: "Farmer rejected" });
    } else {
      res.status(400).json({ msg: "Invalid action" });
    }
  } catch (error) {
    console.error("Error verifying farmer:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  getAllFarmers,
  getAllFarms,
  getFarmById,
  getMe,
  getFarmerStats,
  getFarmerProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getPendingFarmers,
  verifyFarmer,
};

//farmer id each ..params totake form url
