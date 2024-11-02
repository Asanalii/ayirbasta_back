const User = require("../models/userModel");
const Item = require("../models/itemModel");
const Trade = require("../models/tradeModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper function to hash the password
const getHash = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    throw new Error("Error generating password hash");
  }
};

// Register a new user
exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists" });
    }

    const hashedPassword = await getHash(password);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ user: { firstname, lastname, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get items for the logged-in user
exports.getUserItems = async (req, res) => {
  const userId = req.user.id;

  try {
    const items = await Item.find({
      userId,
      status: "available",
    });

    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserRecommendations = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user's past item categories to determine preferred categories or tags
    const user = await User.findById(userId).populate("items");
    const preferredCategories = user.items.map((item) => item.category);

    // Recommend items from these categories
    const recommendations = await Item.aggregate([
      {
        $match: { status: "available", category: { $in: preferredCategories } },
      },
      { $sample: { size: 10 } }, // Limit recommendations to 10 items
    ]);

    res.status(200).json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserTrades = async (req, res) => {
  const userEmail = req.user.email;

  try {
    const trades = await Trade.find({
      $or: [
        { "giver.user_email": userEmail },
        { "receiver.user_email": userEmail },
      ],
    });

    res.status(200).json({ trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  res.status(200).json(user);
};

exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    console.log("Update attempt for userId:", userId);
    console.log("Update data received:", req.body);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: req.body }, // Use $set operator explicitly
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user:", user);
    res.status(200).json(user);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      message: "Error updating profile",
      error: err.message,
    });
  }
};
