// middlewares/multerMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer to save uploaded files in a specified directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../static/images");
    fs.mkdirSync(uploadDir, { recursive: true });

    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(
      path.join(__dirname, "../static/images"),
      file.originalname
    );
    cb(null, uniqueFilename);
  },
});

// Multer configuration
const upload = multer({ storage });

function generateUniqueFilename(directory, originalFilename) {
  const extension = path.extname(originalFilename);
  const baseFilename = path.basename(originalFilename, extension);
  let uniqueFilename = `${baseFilename}${extension}`;
  let counter = 1;

  // Ensure the filename is unique
  while (fs.existsSync(path.join(directory, uniqueFilename))) {
    uniqueFilename = `${baseFilename}(${counter})${extension}`;
    counter++;
  }

  return uniqueFilename;
}

module.exports = upload;
