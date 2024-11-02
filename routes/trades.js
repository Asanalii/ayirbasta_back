const express = require("express");
const router = express.Router();
const {
  createTrade,
  showTrade,
  acceptTrade,
  declineTrade,
} = require("../controllers/trades.js");
const requireAuth = require("../middlewares/authMiddleware.js");

// Define routes for trades
router.post("/", requireAuth, createTrade);
router.get("/:id", requireAuth, showTrade);
router.patch("/:id/accept", requireAuth, acceptTrade);
router.patch("/:id/decline", requireAuth, declineTrade);

module.exports = router;
