const express = require("express");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");
const unitRouter = require("./routes/unitRoutes");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // أو ضيف رابط الفرونت إند
    credentials: true,
  })
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "http://localhost:3000/api/users/login/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            password: "google_oauth",
            passwordConfirm: "google_oauth",
            verified: true,
            verificationToken: undefined,
            verificationTokenExpires: undefined,
            // Placeholder password
            // Since Google authentication is verified
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
app.use("/api/users", userRouter);
app.use("/api/units", unitRouter);
app.get("/", (req, res) => {
  res.send("<a href='/api/users/login/google'>login with google</a>");
});

app.use(globalErrorHandler);

module.exports = app;
