const express = require("express");
const connectDB = require("./src/config/db");

const userRoutes = require('./src/routes/userRoutes');
const app = express();
const port = 5000;
connectDB();
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
