const mongoose = require("mongoose");
const Unit = require("./Unit");
const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Review must have an author"],
      ref: "User",
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Review must have an unit"],
      ref: "Unit",
    },
    review: {
      type: String,
      required: [true, "Review must have comment"],
    },
    rating: {
      type: Number,
      required: [true, "Review must have rating"],
      min: 1,
      max: 5,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.find({ active: true }).populate({
    path: "author",
    select: "fullName photo",
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (unitId) {
  const stats = await this.aggregate([
    {
      $match: { unit: unitId, active: true },
    },
    {
      $group: {
        _id: "$unit",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  await Unit.findByIdAndUpdate(unitId, {
    rating: stats[0].avgRating,
    ratingQuantity: stats[0].nRating,
  });
  return 0;
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.unit);
});

reviewSchema.pre(/^findOneAndUpdate/, function (next) {
  this.r = this.findOne({}); // تخزين بيانات البحث بدلاً من تنفيذ استعلام جديد

  next();
});
reviewSchema.post(/^findOne/, async function (result) {
  await result.constructor.calcAverageRating(result.unit);
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
