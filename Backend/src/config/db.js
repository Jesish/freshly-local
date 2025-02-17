const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const connectDB = async () => {
  const mongoURI = process.env.db_url;

  // Debug log to check if db_url is loaded
  console.log("MongoDB URI from .env:", mongoURI);

  if (!mongoURI) {
    console.error("Error: MongoDB URI is not defined in .env");
    process.exit(1); // Exit process with failure
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
