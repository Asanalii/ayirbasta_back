const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    status: String,
    description: String,
    category: String,
    user_email: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: String,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
