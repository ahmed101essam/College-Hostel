const mongoose = require("mongoose");
const Counter = require("./Counter");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Appointment must have a user"],
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Appointment must be linked to a unit"],
    },
    date: {
      type: Date,
    },
    availableDates: [
      {
        type: Date,
        required: [true, "Please provide available dates for the visit"],
      },
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "refused", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

appointmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "unit",
    select: "title owner location",
  }).populate({
    path: "user",
    select: "fullName email",
  });
  next();
});

// Pre-save hook to generate unique appointment number
appointmentSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "X", "Z"];
  const randomChar = characters[Math.floor(Math.random() * characters.length)];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "appointmentNumber" },
      { $inc: { value: 1 } },
      { new: true, upsert: true, session }
    );

    this.appointmentNumber = `${randomChar}${counter.value}`;

    await session.commitTransaction();
    session.endSession();

    next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
