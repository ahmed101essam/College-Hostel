const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    body: {
      user,
    },
  });
};

exports.sendToken = createSendToken;

exports.signup = catchAsync(async (req, res) => {
  console.log(req.body);
  const { fullName, email, password, phone } = req.body;

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
  });
  const verificationToken = await user.createVerificationToken();
  await user.save({ validateBeforeSave: false });
  await new Email(user).sendVerification(verificationToken);

  res.status(200).json({
    status: "success",
    message: "user created successfully please send the verification token",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Chek if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password"));
  }

  // 2) Check if user exists and password correct
  const user = await User.findOne({ email: email }).select("+password");

  if (!user.verified) {
    return next(new AppError("You have to verify you email first", 401));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything is ok , send Token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting oken and check if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError("The token belonging to this user does no longer exist.")
    );
  }
  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.")
    );
  }

  // GRANT ACCESS
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

//  طلب إعادة تعيين كلمة المرور
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email

  try {
    await new Email(user).sendPasswordReset(resetToken);
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sendig the email. Try again later!", 500)
    );
  }
});

//  إعادة تعيين كلمة المرور باستخدام التوكن
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).setOptions({ byPassByUserHimself: true });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  console.log(req.body.password, req.body.passwordConfirm);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user

  createSendToken(user, 200, res);
  // 4) Log the user in, send JWT
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get the user
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if the POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3) If so, update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");
  const user = await User.findOne({
    verificationToken: hashedToken,
  }).setOptions({ byPassByUserHimself: true });
  console.log(user);
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // 3) Update verification property for the user
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.verified = true;
  user.status = "active";
  await user.save({ validateBeforeSave: false });
  // 4) Log the user in, send JWT
  res.status(200).json({
    status: "success",
    message: "User verified successfully please sign in.",
  });
});
