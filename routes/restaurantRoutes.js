const express = require('express');
const router = express.Router();
const { createRestaurant, getRestaurants } = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createRestaurant)
  .get(protect, getRestaurants);

module.exports = router;
