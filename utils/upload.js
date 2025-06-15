const multer = require("multer");
const path = require('path')

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/img/"));
  },
  filename: function (req, file, cb) {
    const fileName = `unit-${Date.now()}-${Math.random()}.${
      file.mimetype.split("/")[1]
    }`;
    cb(null, fileName);
  },
});


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/", "application/pdf"];

  // Check if mimetype starts with "image/" (which covers all image types)
  const isImage = file.mimetype.startsWith("image/");
  const isPDF = file.mimetype === "application/pdf";

  if (isImage || isPDF) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed!"), false);
  }
};


const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
});

module.exports = upload;
