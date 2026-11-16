const express = require('express');
const router = express.Router();
const { createBranch, getBranches, getBranchByIdPublic, addBranchImage, removeBranchImage } = require('../controllers/branchController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBranches)
  .post(protect, createBranch);

router.get('/public/:id', getBranchByIdPublic);

router.post('/:id/images', protect, addBranchImage);
router.put('/:id/images/remove', protect, removeBranchImage);

module.exports = router;
