const Branch = require('../models/Branch');

exports.createBranch = async (req, res) => {
  try {
    const { restaurantId, name, address, images } = req.body;
    const branch = await Branch.create({ 
      restaurantId, name, address, images, ownerId: req.ownerId 
    });
    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let q = { ownerId: req.ownerId };
    if (restaurantId) q.restaurantId = restaurantId;
    
    const branches = await Branch.find(q).populate('restaurantId', 'name');
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Customer facing route (public)
exports.getBranchByIdPublic = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('restaurantId', 'name');
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addBranchImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.ownerId },
      { $push: { images: imageUrl } },
      { returnDocument: 'after' }
    );
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeBranchImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.ownerId },
      { $pull: { images: imageUrl } },
      { returnDocument: 'after' }
    );
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
