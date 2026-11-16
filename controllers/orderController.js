const Order = require('../models/Order');
const Table = require('../models/Table');
const Notification = require('../models/Notification');

exports.createOrder = async (req, res) => {
  try {
    const { branchId, tableNumber, customerName, items, totalAmount } = req.body;
    
    const Branch = require('../models/Branch');
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    
    // Check if there is an active (uncompleted) order for this table
    let order = await Order.findOne({ 
      branchId, 
      tableNumber, 
      status: { $ne: 'completed' } 
    });

    if (order) {
      // Aggregate the items onto the existing bill
      order.items.push(...items);
      order.totalAmount += totalAmount;
      // Revert status to pending so the kitchen sees the new items
      order.status = 'pending';
      if (!order.customerName && customerName) order.customerName = customerName;
      await order.save();

      // Notify staff of the add-on
      await Notification.create({
        branchId, message: `Add-on order from Table ${tableNumber}`, type: 'order_new', orderId: order._id, ownerId: branch.ownerId
      });

      return res.status(200).json(order);
    }
    
    // No active order exists, create a new one
    order = await Order.create({
      branchId, tableNumber, customerName, items, totalAmount, ownerId: branch.ownerId
    });

    // Update table status to occupied
    await Table.findOneAndUpdate({ branchId, tableNumber }, { status: 'occupied' });
    
    // Create Notification
    await Notification.create({
      branchId, message: `New order from Table ${tableNumber}`, type: 'order_new', orderId: order._id, ownerId: branch.ownerId
    });

    res.status(201).json(order);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.getOrders = async (req, res) => {
  try {
    const { branchId, status } = req.query;
    let filter = { ownerId: req.ownerId };
    if (branchId) filter.branchId = branchId;
    if (status) filter.status = status;
    
    const orders = await Order.find(filter).sort('-createdAt');
    res.json(orders);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate({ _id: req.params.id, ownerId: req.ownerId }, { status }, { returnDocument: 'after' });
    
    // update table if completed
    if (status === 'completed') {
      await Table.findOneAndUpdate({ branchId: order.branchId, tableNumber: order.tableNumber }, { status: 'available' });
    }

    res.json(order);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.getActiveOrderForTable = async (req, res) => {
  try {
    const { branchId, tableNumber } = req.params;
    const order = await Order.findOne({ branchId, tableNumber, status: { $ne: 'completed' } });
    if (!order) return res.status(200).json(null);
    res.status(200).json(order);
  } catch(err) { res.status(500).json({ message: err.message }); }
};
