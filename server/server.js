
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());

app.use(express.json({ limit: "20mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/portfolios", portfolioRoutes);

app.get("/", (req, res) => {
  res.send("PageCraft API is running 🚀");
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You are authorized!",
    userId: req.userId,
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully ✅");

    app.listen(PORT, () => {
      console.log(`PageCraft server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
  });
