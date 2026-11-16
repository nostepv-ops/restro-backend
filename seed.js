require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Branch = require('./models/Branch');
const Menu = require('./models/Menu');
const Table = require('./models/Table');
const Order = require('./models/Order');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany();
    await Restaurant.deleteMany();
    await Branch.deleteMany();
    await Menu.deleteMany();
    await Table.deleteMany();
    await Order.deleteMany();

    // 1. Create Owner
    const hashedPassword = await bcrypt.hash('password123', 10);
    // bypass pre-save hook since we hash here
    const owner = await User.create({
      name: 'John Doe HeadChef',
      email: 'owner@restro.com',
      password: hashedPassword,
      role: 'owner'
    });
    console.log('✓ Owner Created: owner@restro.com / password123');

    // 2. Create Restaurant
    const restaurant = await Restaurant.create({
      name: 'The Golden Spoon',
      description: 'A fine dining experience like no other.',
      type: 'Fine Dining',
      ownerId: owner._id
    });
    console.log('✓ Restaurant Created');

    // 3. Create Branch
    const branch = await Branch.create({
      restaurantId: restaurant._id,
      name: 'Downtown Golden Spoon',
      address: '123 Fine Dining Ave, Metropolis',
      images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
      ownerId: owner._id
    });
    console.log('✓ Branch Created');

    // 4. Create Tables
    const tables = await Table.insertMany([
      { branchId: branch._id, tableNumber: '1', capacity: 2, ownerId: owner._id, status: 'available' },
      { branchId: branch._id, tableNumber: '2', capacity: 4, ownerId: owner._id, status: 'available' },
      { branchId: branch._id, tableNumber: '3', capacity: 2, ownerId: owner._id, status: 'available' },
      { branchId: branch._id, tableNumber: 'VIP-1', capacity: 8, ownerId: owner._id, status: 'booked' }
    ]);
    console.log('✓ Tables Created');

    // 5. Create Menu Items
    const menuItems = await Menu.insertMany([
      { branchId: branch._id, name: 'Truffle Pasta', price: 29.99, category: 'Mains', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601', ownerId: owner._id },
      { branchId: branch._id, name: 'Caesar Salad', price: 12.50, category: 'Starters', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9', ownerId: owner._id },
      { branchId: branch._id, name: 'Cheesecake', price: 8.99, category: 'Desserts', image: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd', ownerId: owner._id },
      { branchId: branch._id, name: 'Red Wine (Glass)', price: 15.00, category: 'Beverages', image: 'https://images.unsplash.com/photo-1584225064785-fb4014d59a5d', ownerId: owner._id }
    ]);
    console.log('✓ Menu Created');

    // 6. Create Demo Order
    await Order.create({
      branchId: branch._id,
      tableNumber: '1',
      customerName: 'Alice',
      items: [
        { name: 'Truffle Pasta', quantity: 1, price: 29.99, menuId: menuItems[0]._id },
        { name: 'Red Wine (Glass)', quantity: 2, price: 15.00, menuId: menuItems[3]._id }
      ],
      totalAmount: 59.99,
      status: 'pending',
      ownerId: owner._id
    });
    
    await Order.create({
      branchId: branch._id,
      tableNumber: '3',
      customerName: 'Bob',
      items: [
        { name: 'Caesar Salad', quantity: 1, price: 12.50, menuId: menuItems[1]._id }
      ],
      totalAmount: 12.50,
      status: 'served',
      ownerId: owner._id
    });
    console.log('✓ Mock Orders Created');
    
    console.log('SEED COMPLETION SUCCESSFUL!');
    process.exit(0);
  } catch(error) {
    require('fs').writeFileSync('err.txt', error.stack || error.message);
    console.log('SEEDING ERROR:', error.message);
    process.exit(1);
  }
}

seedData();
