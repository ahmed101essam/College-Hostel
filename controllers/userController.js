const Unit = require("../models/Unit");
const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: { $ne: "admin" } }).select(
    "fullName email phone role"
  );
  res.status(200).json({
    status: "success",
    data: {
      users: users,
    },
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password update. Please use /updateMyPassword.",
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, "fullName", "email", "phone");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { status: "inactive"});
  await Unit.updateMany(
    { owner: req.user.id, status: "active" },
    { status: "inactive" }
  );
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (user) {
    res.status(200).json({
      status: "success",
      data: {
        user: user,
      },
    });
  } else {
    return next(new AppError("No user found with that ID", 404));
  }
});

const deleteUser = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findByIdAndUpdate(id, { status: "inactive" });

  await Unit.updateMany(
    { owner: id, status: "active" },
    { status: "inactive" }
  );
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});

const getWishlist = catchAsync(async (req, res, next) => {
  const id = req.user._id;
console.log("A&A");

  console.log(id)
  const user = await User.findById(id).populate("favorites");

  res.status(200).json({
    status: "success",
    body: {
      wishlist: user.favorites,
    },
  });
});


const addToWishlist = catchAsync(async (req, res, next) => {
  const id = req.body.unit;

  const unit = await Unit.findById(id);



  if (!unit) {
    return next(new AppError("This is not valid unit id", 400));
  }

  if(unit.owner._id === req.user.id){
    return next(new AppError("You cannot add your unit to favorites list",400))
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $addToSet: { favorites: unit.id },
    },
    { new: true }
  ).populate("favorites");

  res.status(200).json({
    status: "success",
    body: {
      wishlist: user.favorites,
    },
  });
});

const deleteFromWishlist = catchAsync(async (req, res, next) => {
  const id = req.body.unit;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { favorites: id } }, // Remove from array
    { new: true }
  ).populate("favorites");

  res.status(200).json({
    status: "success",
    body: {
      wishlist: user.favorites,
    },
  });
});

const suspendUser = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findByIdAndUpdate(
    id,
    { status: "suspended" },
    { new: true, runValidators: true }
  );
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});

const getSuspendedUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().setOptions({ byPassAdmin: true });
  res.status(200).json({
    status: "success",
    data: {
      users: users,
    },
  });
});

const activateUser = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, status: "suspended" },
    { status: "active" },
    { new: true, runValidators: true }
  ).setOptions({ byPassAdmin: true });

  if (!user) {
    return next(new AppError("User not found or it is already acive", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  deleteFromWishlist,
  getWishlist,
  addToWishlist,
  deleteUser,
  suspendUser,
  getSuspendedUsers,
  activateUser,
};
