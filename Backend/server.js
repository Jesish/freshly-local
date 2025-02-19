const express = require("express");
const connectDB = require("./src/config/db");
require("dotenv").config(); // Ensure .env is loaded

const cors = require("cors");
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const cartRoutes = require("./src/routes/cartRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
