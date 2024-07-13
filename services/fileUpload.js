const multer = require("multer");
const path = require('path');
const ExcelJS = require('exceljs');

// Set up storage for uploaded files
const storage = multer.memoryStorage(); // Use memory storage for serverless environments

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("file");

// Check file type
function checkFileType(file, cb) {
  const filetypes = /xls|xlsx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/vnd.ms-excel' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Excel Only!");
  }
}

module.exports = upload;
