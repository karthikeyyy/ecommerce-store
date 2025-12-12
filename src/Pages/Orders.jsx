import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import {
  ShoppingBag,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await axiosClient.get("/orders/admin/orders");
      setOrders(res.data.orders);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
      case "shipped":
        return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
      case "processing":
        return "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300";
      case "cancelled":
        return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-7 h-7 text-blue-500" />
                  Orders
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Monitor order flow, delivery status, and recent activity.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                    Total orders
                  </p>
                  <p className="mt-1 text-xl font-semibold">{totalOrders}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                    Revenue
                  </p>
                  <p className="mt-1 text-xl font-semibold text-emerald-500">
                    ₹{totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur">
              <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500 dark:text-blue-400">
                    Recent orders
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Showing {orders.length} orders
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide dark:bg-slate-900/80 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 md:px-6 text-left">Order ID</th>
                      <th className="px-4 py-3 md:px-6 text-left">Customer</th>
                      <th className="px-4 py-3 md:px-6 text-left">Date</th>
                      <th className="px-4 py-3 md:px-6 text-left">Items</th>
                      <th className="px-4 py-3 md:px-6 text-left">Amount</th>
                      <th className="px-4 py-3 md:px-6 text-left">Status</th>
                      <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition-colors"
                      >
                        <td className="px-4 py-3 md:px-6 font-semibold text-blue-600 dark:text-blue-400">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 md:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                              {order.user?.name?.charAt(0) || "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {order.user?.name || "Unknown"}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-slate-500">
                                {order.items.length} item{order.items.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 md:px-6 text-xs text-gray-500 dark:text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 md:px-6 text-sm text-gray-600 dark:text-slate-300">
                          {order.items.length}
                        </td>
                        <td className="px-4 py-3 md:px-6 text-sm font-semibold">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-4 py-3 md:px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 md:px-6 text-right">
                          <button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Orders;
