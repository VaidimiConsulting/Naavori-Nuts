import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      [salesAndOrders], 
      [statusCounts], 
      [recentSales],
      [unassignedDeliveries],
      [openTickets],
      [lowStockItems],
      [totalCustomers],
      [recentOrders]
    ] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total), 0) as grossSales, COUNT(id) as totalOrders FROM orders'),
      pool.query('SELECT order_status, COUNT(id) as count FROM orders GROUP BY order_status'),
      pool.query(`
        SELECT DATE(created_at) as date, SUM(total) as daily_sales, COUNT(id) as order_count 
        FROM orders 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
      pool.query(`SELECT COUNT(*) as count FROM orders WHERE order_status = 'packed'`),
      pool.query(`SELECT COUNT(*) as count FROM support_tickets WHERE status IN ('open', 'in_progress')`),
      pool.query(`SELECT COUNT(*) as count FROM product_variants WHERE stock <= 10`),
      pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`),
      pool.query(`SELECT id, order_number, shipping_name, total, payment_method, order_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`)
    ]);

    let pendingPacking = 0;
    let outForDelivery = 0;
    let totalDelivered = 0;

    statusCounts.forEach(row => {
      if (row.order_status === 'placed' || row.order_status === 'confirmed') pendingPacking += row.count;
      if (row.order_status === 'out_for_delivery' || row.order_status === 'shipped') outForDelivery += row.count;
      if (row.order_status === 'delivered') totalDelivered += row.count;
    });

    res.json({
      success: true,
      data: {
        grossSales: Number(salesAndOrders[0]?.grossSales || 0),
        totalOrders: Number(salesAndOrders[0]?.totalOrders || 0),
        pendingPacking,
        outForDelivery,
        totalDelivered,
        unassignedDeliveries: unassignedDeliveries[0]?.count || 0,
        openTickets: openTickets[0]?.count || 0,
        lowStockCount: lowStockItems[0]?.count || 0,
        totalCustomers: totalCustomers[0]?.count || 0,
        recentOrders: recentOrders || [],
        chartData: recentSales || []
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};
