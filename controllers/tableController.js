const Table = require('../models/Table');
const qrcode = require('qrcode');

exports.createTable = async (req, res) => {
  try {
    const { branchId, tableNumber, capacity } = req.body;
    const table = await Table.create({ branchId, tableNumber, capacity, ownerId: req.ownerId });
    res.status(201).json(table);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ branchId: req.params.branchId });
    res.json(tables);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

// Returns a base64 QR code image Data URI
exports.generateTableQR = async (req, res) => {
  try {
    const { branchId, tableNumber } = req.query; // front end wants URL: /menu/:branchId?table=TABLE_NUMBER
    // In production, we assume frontend runs on some URL
    const clientURL = req.headers.origin || 'http://localhost:5173';
    const link = `${clientURL}/menu/${branchId}?table=${tableNumber}`;
    
    const qrCodeImage = await qrcode.toDataURL(link);
    res.json({ qrCodeImage, link });
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findOneAndUpdate({ _id: req.params.id, ownerId: req.ownerId }, { status }, { returnDocument: 'after' });
    res.json(table);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const table = await Table.findOneAndUpdate({ _id: req.params.id, ownerId: req.ownerId }, { tableNumber, capacity }, { returnDocument: 'after' });
    res.json(table);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTable = async (req, res) => {
  try {
    await Table.findOneAndDelete({ _id: req.params.id, ownerId: req.ownerId });
    res.json({ message: 'Table removed' });
  } catch(err) { res.status(500).json({ message: err.message }); }
};
