const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['order_new', 'order_status'], required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
