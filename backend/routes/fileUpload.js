const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the fs module
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads'); // Correctly points to backend/uploads
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadsDir}`);
  } catch (err) {
    console.error(`Error creating uploads directory at ${uploadsDir}:`, err);
    // Depending on the severity, you might want to exit or handle this error differently
    process.exit(1); // Exit if we can't create the essential uploads directory
  }
}

// Configure Multer for file storage
// This is a basic setup. You might want to customize filenames, destinations,
// and add file type validation based on your needs.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this directory exists or create it
    cb(null, 'uploads/'); // Store files in an 'uploads' directory in the backend root
  },
  filename: function (req, file, cb) {
    // Keep original filename + timestamp to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter example (optional)
const fileFilter = (req, file, cb) => {
  // Accept only audio files (you can expand this list)
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an audio file!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // 20MB file size limit (adjust as needed)
  },
  // fileFilter: fileFilter // Uncomment to enable file filtering
});

// POST route for uploading a single audio file
// This route is protected, meaning a user must be logged in.
router.post('/upload', authenticateToken, upload.single('audiofile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // At this point, req.file contains information about the uploaded file
  // e.g., req.file.path, req.file.filename, req.file.mimetype, req.file.size
  console.log('File uploaded:', req.file);

  // TODO: Add logic to process the audio file (e.g., save path to DB, call AI filter)

  res.status(200).json({
    message: 'File uploaded successfully!',
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size
  });
}, (error, req, res, next) => {
  // Multer error handling
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }
  // Other errors (e.g., from fileFilter)
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

// Add a test GET route
router.get('/upload-test', (req, res) => {
  console.log('GET /api/upload-test hit on backend');
  res.json({ message: 'File upload test GET route is working on backend!' });
});

module.exports = router;
