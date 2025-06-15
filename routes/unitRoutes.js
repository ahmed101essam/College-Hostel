const unitRouter = require("express").Router();
const {
  addUnit,
  getAllUnits,
  getUnit,
  updateUnit,
  deleteUnit,
  validUnit,
  owner,
  validAndActiveUnit,
  myUnits,
} = require("../controllers/unitController");
const { unitUploadResize } = require("../middlewares/cloud");
const upload = require("../utils/upload");
const { protect } = require("../controllers/authController");
const appointmentRouter = require("./appointmentRoutes");
const reviewsRouter = require("./reviewsRoutes");

unitRouter
  .route("/")
  .post(
    protect,
    upload.fields([
      { name: "images", maxCount: 14 },
      { name: "electricityBill", maxCount: 1 },
      { name: "titleDeed", maxCount: 1 },
      { name: "idCard", maxCount: 1 },
    ]),
    unitUploadResize,
    addUnit
  )
  .get(getAllUnits);
unitRouter.route("/my-units").get(protect, myUnits); // Assuming this is to get units owned by the user

unitRouter
  .route("/:unitId")
  .delete(protect, validUnit, owner, deleteUnit)
  .get(validUnit, getUnit)
  .patch(
    protect,
    validUnit,
    owner,
    upload.fields([{ name: "images", maxCount: 14 }]),
    unitUploadResize,
    updateUnit
  );

unitRouter.use(
  "/:unitId/appointments",
  protect,
  validAndActiveUnit,
  appointmentRouter
);
unitRouter.use("/:unitId/reviews", validAndActiveUnit, reviewsRouter);

module.exports = unitRouter;
