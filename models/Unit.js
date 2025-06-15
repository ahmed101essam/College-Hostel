const mongoose = require("mongoose");
const unitSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      required: [true, "Property size is required"],
      min: [50, "Property must be greater than 50 square meters"],
      max: [500, "Property must be smaller than 500 square meters"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Please provide the number of rooms"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Please provide the number of bathrooms"],
    },
    category: {
      type: String,
      required: [true, "Property category is required"],
      enum: ["apartment", "villa", "studio", "duplex"],
    },
    available: {
      type: Boolean,
      default: true,
      required: [true, "Availability status is required"],
    },
    furnished: {
      type: Boolean,
      required: [true, "Furnishing status is required"],
      default: true,
    },
    monthlyPrice: {
      type: Number,
      required: [true, "Please provide the price per month"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    whatsApp: {
      type: String,
    },
    propertyLevel: {
      type: Number,
      required: [true, "Property level is required"],
    },
    PropertyNumber: {
      type: Number,
    },
    title: {
      type: String,
      required: [true, "Property title is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
    },
    location: {
      type: String,
      required: [true, "Property location is required"],
    },
    address: {
      type: String,
      required: [true, "Property address is required"],
    },
    insurance: {
      type: Number,
    },
    deposit: {
      type: Number,
    },
    images: [
      {
        type: String,
        required: [true, "Property images are required"],
      },
    ],
    rating: {
      type: Number,
      default: 0,
      // required: [true, "Property rating is required"],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    documents: {
      idCard: { type: String, required: true },
      titleDeed: { type: String, required: true }, // File URL
      electricityBill: { type: String, required: true }, // File URL
    },
    isVerified: {
      type: Boolean,
      default: false,
      // required: [true, "Verification status is required"],
    },
    status: {
      type: String,
      default: "inactive",
      enum: ["active", "inactive", "suspended"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

unitSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "unit",
  localField: "_id",
});

unitSchema.pre(/^find/, function (next) {
  if (this.getOptions().byPassAdmin || this.getOptions().byPassByUserHimself) {
    next();
  }
  this.populate({
    path: "owner",
    select: "fullName email phone photo", // Select only necessary fields
  });

  next();
});

const Unit = mongoose.model("Unit", unitSchema);

module.exports = Unit;
