const Menu = require('../models/Menu');

exports.createMenu = async (req, res) => {
  try {
    const { branchId, name, price, category, image } = req.body;
    const item = await Menu.create({ branchId, name, price, category, image, ownerId: req.ownerId });
    res.status(201).json(item);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.getMenuByBranch = async (req, res) => {
  try {
    const menus = await Menu.find({ branchId: req.params.branchId });
    res.json(menus);
  } catch(err) { res.status(500).json({ message: err.message }); }
};

exports.deleteMenu = async (req, res) => {
  try {
    await Menu.findOneAndDelete({ _id: req.params.id, ownerId: req.ownerId });
    res.json({ message: 'Menu deleted' });
  } catch(err) { res.status(500).json({ message: err.message }); }
};
