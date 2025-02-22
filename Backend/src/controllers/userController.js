const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Sign up user
const signup = async (req, res) => {
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

    user = new User({
      fullName,
      email,
      phoneNumber,
      password,
      farmName,
      farmLocation,
      userType,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    //can use it in env file for more secure.

    res.status(201).json({
      msg: "User created successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Login user
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      msg: "Login successful",
      token,
      userType: user.userType,
    });
  } catch (error) {
    console.error(error);
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
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
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

const getAllFarms = async (req, res) => {
  try {
    // Fetch all users who are farmers and have farm details
    const farms = await User.find({ userType: "farmer" });
    res.json(farms);
  } catch (error) {
    console.error(error);
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

    res.json({
      farmName: farm.farmName,
      farmLocation: farm.farmLocation,
      farmImage: farm.farmImage,
      farmdescription: farm.farmdescription,
      farmerName: farm.fullName,
      farmerEmail: farm.email,
      farmerPhone: farm.phoneNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  getAllFarmers,
  getAllFarms,
  getFarmById,
};

//farmer id each ..params totake form url
