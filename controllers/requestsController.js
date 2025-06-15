const catchAsync = require("../utils/catchAsync");
const Request = require("../models/Request");
const AppError = require("../utils/appError");

exports.getAllRequests = catchAsync(async (req, res, next) => {
  const requests = await Request.find()
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
    { status: req.body.status, messages: $push(req.body.message) },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!request) {
    return next(new AppError("No request found with that id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      request: request,
    },
  });
});
