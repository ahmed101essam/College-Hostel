const catchAsync = require("../utils/catchAsync");
const cloudinary = require("../utils/cloudinaryConfig");
const fs = require("fs/promises");

exports.unitUploadResize = catchAsync(async (req, res, next) => {
  req.body.images = [];
  req.body.documents = {};

  if (!req.files) return next();

  // Helper function to upload file & remove local copy
  const uploadFile = async (file) => {
    const uploadResult = await cloudinary.uploader.upload(file.path);
    await fs.unlink(file.path); // Delete local file
    return uploadResult.secure_url;
  };

  // Upload Title Deed
  if (req.files.titleDeed) {
    req.body.documents.titleDeed = await uploadFile(req.files.titleDeed[0]);
  }

  // Upload Electricity Bill
  if (req.files.electricityBill) {
    req.body.documents.electricityBill = await uploadFile(req.files.electricityBill[0]);
  }
  if (req.files.idCard) {
    req.body.documents.idCard = await uploadFile(req.files.idCard[0]);
  }
  // Upload & Process Images
  if (req.files.images) {
    req.body.images = await Promise.all(
      req.files.images.map(async (img) => {
        const result = await cloudinary.uploader.upload(img.path, { format: "webp" });
        await fs.unlink(img.path); // Delete local image file
        return cloudinary.url(result.public_id, {
          transformation: [
            { quality: "auto:good" },
            { width: 2000, height: 1333, crop: "fill", gravity: "auto" },
          ],
        });
      })
    );
  }

  next();
});
