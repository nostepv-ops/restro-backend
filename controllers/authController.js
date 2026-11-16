const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Owner registration
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    
    user = await User.create({ name, email, password, role: 'owner' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

// Add staff profile (Owner only)
exports.addStaff = async (req, res) => {
  try {
    const { name, email, password, role, branchIds } = req.body; // role: staff_manager, staff_waiter, staff_kitchen
    const staffExist = await User.findOne({ email });
    if (staffExist) return res.status(400).json({ message: 'Staff already exists' });
    
    const newStaff = await User.create({
      name, email, password, role, ownerId: req.user._id, branchIds: branchIds || []
    });
    
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staffMembers = await User.find({ ownerId: req.user._id }).select('-password');
    res.json(staffMembers);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create reset token (random hex string)
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash and store in db
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save({ validateBeforeSave: false });

    // Since we don't have an email server configured, we simply return the token to the frontend
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    res.status(200).json({ message: 'Password reset link simulated!', resetUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    // Hash the token from the URL to compare with DB
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({ 
      resetPasswordToken, 
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    // Set new password (the model pre-save hook will hash it automatically)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password reset completely successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
