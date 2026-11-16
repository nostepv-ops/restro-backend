const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  address: { type: String },
  images: [{ type: String }], // Cloudinary URLs
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // denormalized for easier tenant isolation
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
