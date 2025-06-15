const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Provide your fullname!"],
      minlength: [3, "Name must be more than 3 characters!"],
      maxlength: [40, "Name must be less than 40 characters"],
    },
    email: {
      type: String,
      required: [true, "Provide your email!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Provid a valid email"],
    },
    phone: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Provide a password"],
      minlength: 8,
      select: false,
    },
    photo: {
      type: String,
    },
    passwordChangetAt: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    status: {
      type: String,
      default: "inactive",
      enum: ["active", "inactive", "suspended"],
    },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: Date,

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Unit" }], // Wishlist
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  //  Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangetAt = Date.now() - 2000;

  next();
});

userSchema.pre(/^find/, function (next) {
  if (this.getOptions().byPassAdmin || this.getOptions().byPassByUserHimself)
    next();
  else {
    this.find({ status: "active" });
    next();
  }
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangetAt) {
    const changedTimestamp = parseInt(this.passwordChangetAt.getTime() / 1000);
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomInt(100000, 1000000).toString();
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createVerificationToken = function () {
  const token = crypto.randomInt(100000, 1000000).toString();
  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

module.exports = mongoose.model("User", userSchema);
