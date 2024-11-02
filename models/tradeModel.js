const mongoose = require("mongoose");

// Define the Trade schema
const TradeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  giver: {
    type: Object,
    required: true,
  },
  receiver: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
});

TradeSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Trade", TradeSchema);
