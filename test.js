const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();
(async () => {
  const db = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const admin = await User.create({
    fullName: "Ahmed Shehab",
    email: "ahmed.essam9608@gmail.com",
    phone: "01006940537",
    password: "Ahmed1234",
    role: "admin",
    verified: true,
  });
})();
