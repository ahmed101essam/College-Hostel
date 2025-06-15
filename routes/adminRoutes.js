const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const unitController = require("../controllers/unitController");
const requestController = require("../controllers/requestController");
const adminRouter = express.Router();

// Apply protection and admin restriction to all routes in this router

adminRouter.route("/login").post(authController.login); // login shouldn't be protected

adminRouter.use(authController.protect, authController.restrictTo("admin"));

adminRouter.route("/allUsers").get(userController.getAllUsers);

adminRouter
  .route("/user/:id")
  .delete(userController.suspendUser)
  .get(userController.getUser)
  .patch(userController.activateUser);

adminRouter.route("/suspendedUsers").get(userController.getSuspendedUsers);

adminRouter.route("/verifyUnit/:id").patch(unitController.verifyUnit);

adminRouter.route("allUnits").get(unitController.getAllUnits);

adminRouter
  .route("unit/:id")
  .get(unitController.getUnit)
  .delete(unitController.suspendUnit)
  .patch(unitController.activateUnit);

adminRouter
  .route("/requests")
  .get(authController.restrictTo("admin"), requestController.getAllRequests);

adminRouter.route("/requests/:id").patch(requestController.editRequest);

module.exports = adminRouter;
