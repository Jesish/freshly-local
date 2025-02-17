const express = require("express");
const connectDB = require("./src/config/db");
require("dotenv").config(); // Ensure .env is loaded

const cors = require("cors");
const userRoutes = require("./src/routes/userRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
