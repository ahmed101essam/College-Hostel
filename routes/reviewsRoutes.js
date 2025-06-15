const { protect } = require("../controllers/authController");
const {
  addReview,
  validReview,
  reviewOwner,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { post } = require("./appointmentRoutes");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").post(protect, addReview);
reviewsRouter
  .route("/:reviewId")
  .all(protect, validReview, reviewOwner)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = reviewsRouter;
