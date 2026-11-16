const express = require('express');
const router = express.Router();
const { register, login, getMe, addStaff, getStaff, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

router.post('/staff', protect, authorize('owner'), addStaff);
router.get('/staff', protect, authorize('owner', 'staff_manager'), getStaff);

module.exports = router;
