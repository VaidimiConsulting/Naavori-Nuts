import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // We execute these concurrently for max speed
    const [
      [salesAndOrders], 
      [statusCounts], 
      [recentSales]
    ] = await Promise.all([
      pool.query('SELECT SUM(total) as grossSales, COUNT(id) as totalOrders FROM orders'),
      pool.query('SELECT order_status, COUNT(id) as count FROM orders GROUP BY order_status'),
      pool.query(`
        SELECT DATE(created_at) as date, SUM(total) as daily_sales 
        FROM orders 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `)
    ]);

    let pendingPacking = 0;
    let outForDelivery = 0;

    statusCounts.forEach(row => {
      if (row.order_status === 'placed' || row.order_status === 'confirmed') pendingPacking += row.count;
      if (row.order_status === 'out_for_delivery') outForDelivery += row.count;
    });

    res.json({
      success: true,
      data: {
        grossSales: salesAndOrders[0].grossSales || 0,
        totalOrders: salesAndOrders[0].totalOrders || 0,
        pendingPacking,
        outForDelivery,
        chartData: recentSales
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};
