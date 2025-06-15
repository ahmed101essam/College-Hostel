const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    unit: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Unit",
      required: [true, "Unit reference is required"],
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    messages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
