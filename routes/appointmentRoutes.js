const {
  bookAppointment,
  confirmAppointment,
  refuseAppointment,
  getAllUnitAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../controllers/authController");
const { owner } = require("../controllers/unitController");

const appointmentRouter = require("express").Router();

appointmentRouter
  .route("/")
  .post(bookAppointment)
  .get(owner, getAllUnitAppointments);
appointmentRouter.patch("/:appointmentId/confirm", owner, confirmAppointment);
appointmentRouter.patch("/:appointmentId/refuse", owner, refuseAppointment);
appointmentRouter.patch("/:appointmentId/cancel", cancelAppointment);

module.exports = appointmentRouter;
