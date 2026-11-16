const express = require('express');
const router = express.Router();
const { createTable, getTables, generateTableQR, updateTableStatus, updateTable, deleteTable } = require('../controllers/tableController');
const { protect } = require('../middleware/authMiddleware');

router.get('/qr', protect, generateTableQR);

router.route('/')
  .post(protect, createTable);

router.get('/:branchId', getTables); // Public for checking availability potentially, or just keep it open for now
router.put('/:id/status', protect, updateTableStatus);
router.put('/:id', protect, updateTable);
router.delete('/:id', protect, deleteTable);

module.exports = router;
