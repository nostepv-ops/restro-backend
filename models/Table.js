const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  tableNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked', 'occupied'], default: 'available' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
