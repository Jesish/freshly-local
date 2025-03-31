// C:\Users\CHME\Desktop\freshly-local\backend\server.js
const express = require("express");
const connectDB = require("./src/config/db");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const paymentRoutes = require("./src/routes/PaymentRoutes");
const ReviewRoutes = require("./src/routes/ReviewRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const messageRoutes = require("./src/routes/messageRoutes");

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

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", messageRoutes);

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

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});