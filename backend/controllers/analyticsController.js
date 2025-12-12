import Order from "../models/orderModel.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

// Get sales analytics
export const getSalesAnalytics = async (req, res) => {
  try {
    const { period = "30d", startDate, endDate } = req.query;

    let start, end;
    end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Parse period (7d, 30d, 90d, 1y)
      const match = period.match(/(\d+)([dmy])/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        start = new Date();
        
        if (unit === 'd') start.setDate(start.getDate() - value);
        else if (unit === 'm') start.setMonth(start.getMonth() - value);
        else if (unit === 'y') start.setFullYear(start.getFullYear() - value);
      } else {
        start = new Date();
        start.setDate(start.getDate() - 30);
      }
    }

    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by day
    const salesByDay = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.totalAmount;
      acc[date].orders += 1;
      return acc;
    }, {});

    const dailySales = Object.values(salesByDay).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
        },
        dailySales,
        period: { start, end },
      },
    });
  } catch (error) {
    console.error("Get sales analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

// Get top products
export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10, sortBy = "revenue" } = req.query;

    const orders = await Order.find({ status: { $ne: "cancelled" } })
      .populate("items.product");

    // Aggregate product stats
    const productStats = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString();
        if (!productId) return;

        if (!productStats[productId]) {
          productStats[productId] = {
            product: item.product,
            revenue: 0,
            quantity: 0,
            orders: 0,
          };
        }

        productStats[productId].revenue += item.price * item.quantity;
        productStats[productId].quantity += item.quantity;
        productStats[productId].orders += 1;
      });
    });

    // Convert to array and sort
    let topProducts = Object.values(productStats);

    if (sortBy === "revenue") {
      topProducts.sort((a, b) => b.revenue - a.revenue);
    } else if (sortBy === "quantity") {
      topProducts.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === "orders") {
      topProducts.sort((a, b) => b.orders - a.orders);
    }

    topProducts = topProducts.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error("Get top products error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch top products" });
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (req, res) => {
  try {
    // Find admin role first to exclude it properly
    const adminRole = await Role.findOne({ name: "admin" });
    
    let query = {};
    if (adminRole) {
      query = { role: { $ne: adminRole._id } };
    }

    const totalCustomers = await User.countDocuments(query);
    
    const activeCustomers = await Order.distinct("user", {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Customer lifetime value
    const orders = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          avgLifetimeValue: { $avg: "$totalSpent" },
          avgOrdersPerCustomer: { $avg: "$orderCount" },
        },
      },
    ]);

    const stats = orders[0] || {
      avgLifetimeValue: 0,
      avgOrdersPerCustomer: 0,
    };

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers: activeCustomers.length,
        averageLifetimeValue: stats.avgLifetimeValue,
        averageOrdersPerCustomer: stats.avgOrdersPerCustomer,
      },
    });
  } catch (error) {
    console.error("Get customer analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch customer analytics" });
  }
};

// Get revenue forecast
export const getRevenueForecast = async (req, res) => {
  try {
    // Get last 90 days of data
    const start = new Date();
    start.setDate(start.getDate() - 90);

    const orders = await Order.find({
      createdAt: { $gte: start },
      status: { $ne: "cancelled" },
    });

    // Simple linear regression forecast for next 30 days
    const dailyRevenue = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.totalAmount;
      return acc;
    }, {});

    const revenues = Object.values(dailyRevenue);
    const avgDailyRevenue = revenues.length > 0 
      ? revenues.reduce((a, b) => a + b, 0) / revenues.length
      : 0;

    // Forecast next 30 days
    const forecast = [];
    for (let i = 1; i <= 30; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedRevenue: avgDailyRevenue,
      });
    }

    res.json({
      success: true,
      data: {
        historicalAverage: avgDailyRevenue,
        forecast,
      },
    });
  } catch (error) {
    console.error("Get forecast error:", error);
    res.status(500).json({ success: false, message: "Failed to generate forecast" });
  }
};

// Export data to CSV
export const exportAnalytics = async (req, res) => {
  try {
    const { type = "sales", format = "csv" } = req.query;

    let data = [];
    let headers = [];

    if (type === "sales") {
      const orders = await Order.find({ status: { $ne: "cancelled" } })
        .sort({ createdAt: -1 });

      headers = ["Order ID", "Date", "Customer", "Total", "Status"];
      data = orders.map(order => [
        order._id,
        new Date(order.createdAt).toLocaleDateString(),
        order.user?.name || "Guest",
        order.totalAmount,
        order.status,
      ]);
    }

    // Convert to CSV
    const csv = [
      headers.join(","),
      ...data.map(row => row.join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${type}-export.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ success: false, message: "Failed to export data" });
  }
};
