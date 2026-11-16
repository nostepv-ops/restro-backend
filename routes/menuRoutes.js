const express = require('express');
const router = express.Router();
const { createMenu, getMenuByBranch, deleteMenu } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

// Public route for fetching menu
router.get('/:branchId', getMenuByBranch);

router.post('/', protect, createMenu);
router.delete('/:id', protect, deleteMenu);

module.exports = router;
