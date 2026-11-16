const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, (req, res, next) => {
  const uploader = upload.single('image');
  uploader(req, res, (err) => {
    if (err) {
      console.error('Upload Error Details:', err);
      return res.status(500).json({ message: 'Failed to upload image', error: err, stack: err.stack });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(200).json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path
  });
});

module.exports = router;
