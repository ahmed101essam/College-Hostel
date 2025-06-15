const Unit = require("../models/Unit");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

exports.getAllUnits = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Unit.find({
      status: "active", // Exclude inactive units
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const units = await features.query;
  res.status(200).json({
    status: "success",
    length: units.length,
    data: {
      units: units,
    },
  });
});

exports.owner = catchAsync(async (req, res, next) => {
  console.log(req.unit.owner);

  if (req.unit.owner._id.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to edit this unit", 403));
  }
  next();
});

exports.validUnit = catchAsync(async (req, res, next) => {
  const unit = await Unit.findById(req.params.unitId);
  console.log(req.body);

  if (!unit) {
    return next(new AppError("No unit found with that id", 404));
  }
  if (unit.status == "suspended") {
    return next(new AppError("The unit is suspended you can't access it", 400));
  }

  req.unit = unit;
  next();
});

exports.validAndActiveUnit = catchAsync(async (req, res, next) => {
  const unit = await Unit.find({
    _id: req.params.unitId,
    status: "active",
  });
  if (!unit) {
    return next(
      new AppError("No unit found with that id or the unit is not active", 404)
    );
  }
  req.unit = unit[0];
  next();
});

exports.updateUnit = catchAsync(async (req, res, next) => {
  const allowedFields = [
    "available",
    "furnished",
    "monthlyPrice",
    "contactPhone",
    "whatsApp",
    "title",
    "description",
    "location",
    "address",
    "insurance",
    "deposit",
    "images",
  ];
  const filteredObj = {};

  console.log(req.body);

  Object.keys(req.body).map((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = req.body[key];
    }
  });

  console.log(filteredObj);

  const updatedUnit = await Unit.findByIdAndUpdate(
    req.params.unitId,
    filteredObj,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      unit: updatedUnit,
    },
  });
});

exports.deleteUnit = catchAsync(async (req, res, next) => {
  await Unit.findByIdAndUpdate(req.params.unitId, { status: "inactive" });
  res.status(204).json({
    status: "success",
    data: {
      unit: null,
    },
  });
});

exports.suspend = catchAsync(async (req, res, next) => {
  await Unit.findByIdAndUpdate(req.params.unitId, { status: "suspended" });
  res.status(204).json({
    status: "success",
    data: {
      unit: null,
    },
  });
});

exports.getUnit = catchAsync(async (req, res, next) => {
  const unit = await Unit.findById(req.params.unitId).populate({
    path: "reviews",
    // populate: { path: "author", select: "name email" }, // Get author details
  });
  if (!unit) {
    return next(new AppError("No unit found with that id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      unit: unit,
    },
  });
});

exports.addUnit = catchAsync(async (req, res, next) => {
  const body = req.body;
  body.owner = req.user.id;
  const unit = await Unit.create(req.body);

  const request = await Request.create({
    unit: unit._id,
    user: req.user.id,
    status: "pending",
    message: "Request to add a new unit",
  });

  res.status(201).json({
    status: "success",
    data: {
      unit: unit,
    },
  });
});

exports.verifyUnit = catchAsync(async (req, res, next) => {
  const unit = await Unit.findById(req.params.unitId).setOptions({
    byPassAdmin: true,
  });

  if (!unit) {
    return next(new AppError("There is no unit found by that ID", 404));
  }

  // Ensure the owner has an email
  if (!unit.owner || !unit.owner.email) {
    return next(
      new AppError("The unit owner does not have a valid email.", 400)
    );
  }

  // Send verification email
  try {
    const email = new Email(unit.owner.email);
    await email.sendUnitVerification(unit._id);
  } catch (error) {
    return next(new AppError("Failed to send verification email.", 500));
  }

  // Return success response
  res.status(200).json({
    status: "success",
    message: "Verification email sent successfully.",
    data: { unit },
  });
});

exports.activateUnit = catchAsync(async (req, res, next) => {
  const unit = await Unit.findOneAndUpdate(
    { _id: req.params.unitId, status: { $ne: "active" } },
    { status: "active" },
    { new: true, runValidators: true }
  ).setOptions({ byPassAdmin: true });

  if (!unit) {
    return next(new AppError("Unit not found or is already active.", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      unit: unit,
    },
  });
});

exports.myUnits = catchAsync(async (req, res, next) => {
  const units = await Unit.find({ owner: req.user.id, status: "active" });

  if (units.length === 0) {
    return next(new AppError("You have no active units", 404));
  }

  res.status(200).json({
    status: "success",
    length: units.length,
    data: {
      units: units,
    },
  });
});
