require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected Successfully");
  } catch (error) {
    console.error(" MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

connectDB();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(` Server running on Port ${process.env.PORT}`);
});
