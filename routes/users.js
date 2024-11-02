const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserItems,
  getUserTrades,
  getUserRecommendations,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/users.js");
const requireAuth = require("../middlewares/authMiddleware");
const authenticate = require("../middlewares/authenticate.js");

// Define routes for users
router.post("/sign-up", registerUser);
router.post("/sign-in", authenticate, loginUser);
router.get("/items", requireAuth, getUserItems);
router.get("/recommended-items", requireAuth, getUserRecommendations);
router.get("/trades", requireAuth, getUserTrades);
router.get("/profile", requireAuth, getUserProfile);
router.patch("/update", requireAuth, updateUserProfile);
module.exports = router;
