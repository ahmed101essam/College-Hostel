const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures only one counter for "appointmentNumber"
  },
  value: {
    type: Number,
    required: true,
    default: 1000, // Start numbering from 1000
  },
});

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
