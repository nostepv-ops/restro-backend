const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, getActiveOrderForTable } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createOrder); 
router.get('/active/:branchId/:tableNumber', getActiveOrderForTable);

router.route('/')
  .get(protect, getOrders);

router.put('/:id', protect, updateOrderStatus);

module.exports = router;
