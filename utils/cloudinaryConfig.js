const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dsafqgv3j",
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

module.exports = cloudinary;
