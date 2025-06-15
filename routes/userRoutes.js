const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const passport = require("passport");

const userRouter = express.Router();

// userRouter.post("/signup")
userRouter.route("/login/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
userRouter
  .route("/login/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      authController.sendToken(req.user, 200, res);
    }
  );
userRouter.route("/signup").post(authController.signup);
userRouter.route("/login").post(authController.login);
userRouter.route("/forgotPassword").post(authController.forgotPassword);
userRouter.route("/resetPassword/:token").patch(authController.resetPassword);
userRouter
  .route("/updateMyPassword")
  .patch(authController.protect, authController.updatePassword);

userRouter
  .route("/updateMe")
  .patch(authController.protect, userController.updateMe);

userRouter
  .route("/deleteMe")
  .delete(authController.protect, userController.deleteMe);

userRouter.route("/logout", (req, res) => {
  req.logout();
  res.redirect("http:localhost:3000");
});

userRouter.route("/verifyMe").post(authController.verifyEmail);
userRouter
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );
userRouter
  .route("/favorites")
  .all(authController.protect)
  .post(userController.addToWishlist)
  .get(userController.getWishlist)
  .delete(userController.deleteFromWishlist);
userRouter.route("/:id").get(userController.getUser);

module.exports = userRouter;
