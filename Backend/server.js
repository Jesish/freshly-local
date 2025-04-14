// C:\Users\CHME\Desktop\freshly-local\backend\server.js
const express = require("express");
const connectDB = require("./src/config/db");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const paymentRoutes = require("./src/routes/PaymentRoutes");
const ReviewRoutes = require("./src/routes/ReviewRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const path = require("path");
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", messageRoutes);

// Directions Proxy Endpoint
app.get("/api/directions", async (req, res) => {
  const { start, end } = req.query;
  const apiKey = process.env.ORS_API_KEY;

  console.log("GET /api/directions hit with:", { start, end });

  if (!apiKey) {
    return res.status(500).json({ error: "ORS API key is not configured" });
  }
  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "Start and end coordinates required" });
  }

  try {
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          start.split(",").map(Number), // [lng, lat]
          end.split(",").map(Number), // [lng, lat]
        ],
        format: "geojson",
      },
      {
        headers: {
          Authorization: apiKey, // ORS uses Authorization header for API key
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    console.log("ORS Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("ORS Directions Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });
    res
      .status(500)
      .json({ error: error.response?.data?.error || "ORS failed" });
  }
});
// Pass io to app for controllers to use
app.set("io", io);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
