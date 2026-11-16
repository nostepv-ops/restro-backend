const Restaurant = require('../models/Restaurant');

exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const restaurant = await Restaurant.create({ name, description, type, ownerId: req.ownerId });
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.ownerId });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
