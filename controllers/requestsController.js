const catchAsync = require("../utils/catchAsync");
const Request = require("../models/Request");
const AppError = require("../utils/appError");
const Unit = require("../models/Unit");

exports.getAllRequests = catchAsync(async (req, res, next) => {
  const requests = await Request.find({ status: { $ne: "accepted" } })
    .populate("unit", "name")
    .populate("user", "name email");

  res.status(200).json({
    status: "success",
    length: requests.length,
    data: {
      requests: requests,
    },
  });
});

exports.myRequests = catchAsync(async (req, res, next) => {
  const requests = await Request.find({ user: req.user.id })
    .populate("unit", "name")
    .populate("user", "name email");

  res.status(200).json({
    status: "success",
    length: requests.length,
    data: {
      requests: requests,
    },
  });
});

exports.editRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, $push: { messages: req.body.message } },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!request) {
    return next(new AppError("No request found with that id", 404));
  }

  if (req.body.status === "accepted") {
    await Unit.findByIdAndUpdate(
      request.unit._id,
      { status: "active", isVerified: true },
      { new: true }
    );
  }
  if (req.body.status === "rejected") {
    await Unit.findByIdAndUpdate(
      request.unit._id,
      { status: "rejected" },
      { new: true }
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      request: request,
    },
  });
});
