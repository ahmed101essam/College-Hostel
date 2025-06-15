const Appointment = require("../models/Appointment");
const Unit = require("../models/Unit");
const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

exports.bookAppointment = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  const unitId = req.params.unitId;
  const unit = req.unit;

  const prevAppointment = await Appointment.findOne({
    user: userId,
    unit: req.unit._id,
    $or: [{ status: "completed" }, { status: "pending" }], // ✅ Correct usage
  });

  if (prevAppointment) {
    return next(
      new AppError("Sorry you already booked an appointment for this unit")
    );
  }

  console.log(req.unit);

  const appointment = await Appointment.create({
    user: userId,
    unit: req.unit._id,
    availableDates: req.body.availableDates,
    notes: req.body.notes,
  });

  try {
    const userEmail = new Email(user);
    await userEmail.sendAppointmentRequestUser(unit, appointment);
    const ownerEmail = new Email(unit.owner);
    await ownerEmail.sendAppointmentRequestOwner(unit, appointment, user);
  } catch (error) {
    new AppError(error.message);
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

exports.confirmAppointment = catchAsync(async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.appointmentId;
  let appointment = await Appointment.find({
    appointmentNumber: appointmentId,
    status: "pending",
  });

  if (appointment.length == 0) {
    return next(new AppError("There is no appointment with that id", 400));
  }
  appointment = appointment[0];
  console.log(appointment.unit.owner._id, "sdasd", user._id);

  if (appointment.unit.owner._id.toString() !== user._id.toString()) {
    return next(
      new AppError("You are not authorized to do accept the appointment", 403)
    );
  }

  appointment = await Appointment.findOneAndUpdate(
    { appointmentNumber: appointmentId },
    { status: "confirmed", date: req.body.date },
    { new: true, runValidators: true }
  );

  try {
    const email = new Email(appointment.user);
    await email.sendAppointmentRequestConfirmation(
      appointment,
      appointment.unit,
      appointment.unit.owner
    );
  } catch (error) {
    console.log(error);

    return next(
      new AppError("Couldn't successfully send the confirmation mail", 500)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});
exports.refuseAppointment = catchAsync(async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.appointmentId;
  let appointment = await Appointment.find({
    appointmentNumber: appointmentId,
    status: "pending",
  }).populate("unit");

  if (appointment.length === 0) {
    return next(new AppError("There is no appointment with that id", 400));
  }

  appointment = appointment[0];

  if (appointment.unit.owner._id.toString() !== user._id.toString()) {
    return next(
      new AppError("You are not authorized to refuse this appointment", 403)
    );
  }

  appointment.status = "refused";
  await appointment.save();

  try {
    const email = new Email(appointment.user);
    await email.sendAppointmentRefusal(appointment, appointment.unit);
  } catch (error) {
    console.log(error);

    return next(
      new AppError("Couldn't successfully send the refusal mail", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Appointment request has been refused",
  });
});
exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.appointmentId;
  let appointment = await Appointment.find({
    appointmentNumber: appointmentId,
    $or: [{ status: "pending" }, { status: "confirmed" }],
  }).populate("unit");

  if (appointment.length === 0) {
    return next(new AppError("There is no appointment with that id", 400));
  }

  appointment = appointment[0];

  if (appointment.user._id.toString() !== user._id.toString()) {
    return next(
      new AppError("You are not authorized to cancel this appointment", 403)
    );
  }

  appointment.status = "canceled";
  await appointment.save();

  try {
    const email = new Email(appointment.unit.owner);
    await email.sendAppointmentCancellation(
      appointment,
      appointment.unit,
      appointment.user
    );
  } catch (error) {
    console.log(error);

    return next(
      new AppError("Couldn't successfully send the cancellation mail", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Your appointment has been canceled",
  });
});
exports.getAllUnitAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({
    unit: req.unit._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      appointments,
    },
  });
});
