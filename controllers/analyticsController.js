const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Branch = require('../models/Branch');

exports.getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.ownerId;
    
    const [restaurants, branches, orders] = await Promise.all([
      Restaurant.countDocuments({ ownerId }),
      Branch.countDocuments({ ownerId }),
      Order.find({ ownerId })
    ]);

    let totalRevenue = 0;
    orders.forEach(o => {
      if (o.status === 'completed' || o.status === 'served') {
        totalRevenue += o.totalAmount;
      }
    });

    const recentOrders = orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

    // Generate chart data for the last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        revenue: 0 
      };
    }).reverse();

    const hourlyCounts = Array(24).fill(0);
    const tableUsage = {};

    orders.forEach(o => {
      // chart logic
      if (o.status === 'completed' || o.status === 'served') {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.date === orderDate);
        if (dayMatch) {
          dayMatch.revenue += o.totalAmount;
        }
      }

      // peak time & table usage logic
      const hour = new Date(o.createdAt).getHours();
      hourlyCounts[hour]++;

      if (o.tableNumber) {
        tableUsage[o.tableNumber] = (tableUsage[o.tableNumber] || 0) + 1;
      }
    });

    const maxHourCount = Math.max(...hourlyCounts);
    const peakHour = hourlyCounts.indexOf(maxHourCount);
    const peakTime = maxHourCount > 0 ? `${peakHour}:00 - ${peakHour + 1}:00` : 'N/A';

    let topTable = 'N/A';
    let maxTableCount = 0;
    for (const [tableNum, count] of Object.entries(tableUsage)) {
      if (count > maxTableCount) {
        maxTableCount = count;
        topTable = `Table ${tableNum}`;
      }
    }

    res.json({
      totalRestaurants: restaurants,
      totalBranches: branches,
      totalOrders: orders.length,
      totalRevenue,
      recentOrders,
      chartData: last7Days,
      peakTime,
      topTable
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
