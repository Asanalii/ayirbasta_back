// models/counterModel.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: 0 },
  seq: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
