const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
// const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config();

// Import routes
const userRoutes = require("./routes/users");
const itemRoutes = require("./routes/items");
const tradeRoutes = require("./routes/trades");

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes setup
app.use("/v1/users", userRoutes);
app.use("/v1/items", itemRoutes);
app.use("/v1/trades", tradeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// Serve static files (e.g., images)
app.use("/static", express.static(path.join(__dirname, "static")));
// app.use("/images", express.static("images"));

// Default route to handle unrecognized requests
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
