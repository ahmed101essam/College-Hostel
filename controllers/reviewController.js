const Appointment = require("../models/Appointment");
const Review = require("../models/Review");
const Unit = require("../models/Unit");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.addReview = catchAsync(async (req, res, next) => {
  const unit = req.unit;
  const user = req.user;

  if (!req.body.review || !req.body.rating) {
    return next(new AppError("please provide rating and review", 400));
  }

  if (user._id.toString() === unit.owner._id.toString()) {
    return next(new AppError("You cannot add a review on your unit", 403));
  }

  const isThereAVisit = await Appointment.find({
    unit: unit._id,
    user: user._id,
    status: "completed",
  });

  if (isThereAVisit.length === 0) {
    return next(
      new AppError(
        "You can not add a review as you didn't see the unit before",
        403
      )
    );
  }

  const review = await Review.create({
    unit: unit._id,
    author: user._id,
    review: req.body.review,
    rating: req.body.rating,
  });

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.validReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError("The review id you provided is invalid.", 400));
  }
  req.review = review;
  next();
});

exports.reviewOwner = catchAsync(async (req, res, next) => {
  if (req.user._id.toString() !== req.review.author._id.toString()) {
    return next(
      new AppError("you can not perform this action on that review", 403)
    );
  }
  next();
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const unit = req.unit;
  const user = req.user;

  let review = req.review;

  if (!req.body.review && !req.body.rating) {
    return next(new AppError("please provide rating or review", 400));
  }
  const obj = {};
  if (req.body.review) {
    obj.review = req.body.review;
  }
  if (req.body.rating) {
    obj.rating = req.body.rating;
  }

  review = await Review.findOneAndUpdate({ _id: req.review._id }, obj, {
    new: true,
    runValidators: true,
    returnDocument: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  review = await Review.findOneAndUpdate(
    { _id: req.review._id },
    { active: false },
    {
      new: true,
      runValidators: true,
      returnDocument: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: null,
  });
});
