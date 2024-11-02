const express = require("express");
const {
  createItem,
  getItem,
  updateItem,
  deleteItem,
  getItems,
  toggleLike,
  getLikedItems,
} = require("../controllers/items.js");

const requireAuth = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerMiddleware");

const router = express.Router();

// Define routes in correct order - specific routes before parameterized routes
router.get("/liked", requireAuth, getLikedItems);
router.get("/", getItems);
router.post("/", requireAuth, upload.single("images"), createItem);
router.get("/:id", getItem);
router.patch("/:id", requireAuth, upload.single("images"), updateItem);
router.delete("/:id", requireAuth, deleteItem);
router.post("/:id/like", requireAuth, toggleLike);

module.exports = router;
