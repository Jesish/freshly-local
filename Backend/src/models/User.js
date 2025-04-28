const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  farmName: {
    type: String,
    default: "",
  },
  farmLocation: {
    type: {
      type: String,
      enum: ["Point"], // Restrict to "Point" type
      default: "Point",
    },
    coordinates: {
      type: [Number], // Array of [lng, lat]
      required: true,
    },
    placeName: { type: String }, // Optional human-readable name
  },
  farmImage: {
    type: [String], // Changed to array
    default: [], // Default to empty array
  },
  profileImage: {
    type: String,
    default: "",
  },
  farmdescription: {
    type: String,
    default: "",
  },
  userType: {
    type: String,
    enum: ["consumer", "farmer", "admin"],
    default: "consumer",
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  verificationDocuments: [{ type: String }], // Array of file paths
  isVerified: { type: Boolean, default: false }, // False for farmers until approved
  createdAt: { type: Date, default: Date.now },
});

//hash the password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//compare tye password
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
