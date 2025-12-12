import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import analyticsService from "../services/analyticsService";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [data, setData] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    activeCustomers: 0,
    salesByDay: [],
    topProducts: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesRes, topProdRes, customerRes] = await Promise.all([
          analyticsService.getSalesAnalytics(period),
          analyticsService.getTopProducts(10),
          analyticsService.getCustomerAnalytics(),
        ]);

        if (salesRes.data.success) {
          const { summary, dailySales } = salesRes.data.data;

          // Process daily sales for the chart
          // Find max revenue for scaling 
          const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1);

          const chartData = dailySales.map(d => ({
            label: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: d.date,
            value: (d.revenue / maxRevenue) * 100, // Percentage for height
            revenue: d.revenue,
            orders: d.orders
          }));

          // Process Top Products
          const products = topProdRes.data.success ? topProdRes.data.data.map(p => ({
            name: p.product?.name || "Unknown Product",
            sku: p.product?.sku || "N/A",
            revenue: p.revenue,
            orders: p.orders,
            conversion: 0 // Backend doesn't support yet
          })) : [];

          setData({
            revenue: summary.totalRevenue,
            orders: summary.totalOrders,
            customers: customerRes.data.success ? customerRes.data.data.totalCustomers : 0,
            activeCustomers: customerRes.data.success ? customerRes.data.data.activeCustomers : 0,
            salesByDay: chartData,
            topProducts: products
          });
        }

      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const trafficSources = useMemo(() => [
    { label: "Organic Search", value: 42 },
    { label: "Paid Ads", value: 26 },
    { label: "Social Media", value: 18 },
    { label: "Direct", value: 9 },
    { label: "Referral", value: 5 },
  ], []);

  const totalTraffic = useMemo(
    () => trafficSources.reduce((sum, s) => sum + s.value, 0),
    [trafficSources]
  );

  const formatCurrency = (value) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const MetricChange = ({ value }) => {
    if (value === undefined || value === null) return null;
    const positive = value >= 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;
    const color = positive
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-500 dark:text-rose-400";
    const bg = positive
      ? "bg-emerald-50 dark:bg-emerald-500/10"
      : "bg-rose-50 dark:bg-rose-500/10";

    return (
      <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${bg} ${color}`}>
        <Icon className="w-3 h-3" />
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-lg font-medium text-indigo-600 animate-pulse">Loading Analytics...</div>
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
                  <BarChart3 className="w-7 h-7 text-indigo-500" />
                  Analytics
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Overview of revenue, orders, customer behavior, and traffic sources.
                </p>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                      Revenue
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatCurrency(data.revenue)}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                {/* Comparison currently hidden/mocked as backend upgrade needed */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[0.7rem] text-gray-400 dark:text-slate-500">
                    Total Revenue
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                      Orders
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {data.orders.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[0.7rem] text-gray-400 dark:text-slate-500">
                    Total Orders
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                      Total Customers
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {data.customers.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[0.7rem] text-gray-400 dark:text-slate-500">
                    Registered Users
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                      Active customers
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {data.activeCustomers.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[0.7rem] text-gray-400 dark:text-slate-500">
                    Last 30 days
                  </span>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500 dark:text-indigo-400">
                      Sales
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      Last {period === '7d' ? '7 days' : period}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-5 pt-4 md:px-6">
                  {data.salesByDay.length > 0 ? (
                    <div className="flex h-40 items-end justify-between gap-2 md:gap-3">
                      {data.salesByDay.map((d) => (
                        <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
                          <div className="relative flex w-full flex-col justify-end rounded-xl bg-gradient-to-t from-indigo-100 to-indigo-400 dark:from-indigo-950 dark:to-indigo-500/70">
                            <div
                              className="w-full rounded-xl bg-indigo-500/90 dark:bg-indigo-400"
                              style={{ height: `${d.value}%`, minHeight: "8px" }}
                              title={`${formatCurrency(d.revenue)} - ${d.orders} orders`}
                            />
                          </div>
                          <span className="text-[0.7rem] text-gray-400 dark:text-slate-500">
                            {d.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                      No sales data available
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                        Traffic sources
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Where your visitors are coming from
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {trafficSources.map((s) => {
                      const percentage = totalTraffic
                        ? Math.round((s.value / totalTraffic) * 100)
                        : 0;
                      return (
                        <div key={s.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              {s.label}
                            </span>
                            <span className="text-gray-400 dark:text-slate-500">
                              {percentage}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                    Quick insight
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-slate-200">
                    Weekend traffic and sales are consistently higher. Consider
                    scheduling campaigns and blog posts for Fridays to capture this
                    spike.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                    Top products
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Ranked by revenue
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide dark:bg-slate-900/80 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 md:px-6 text-left">Product</th>
                      <th className="px-4 py-3 md:px-6 text-left">SKU</th>
                      <th className="px-4 py-3 md:px-6 text-right">Revenue</th>
                      <th className="px-4 py-3 md:px-6 text-right">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {data.topProducts.length > 0 ? (
                      data.topProducts.map((p) => (
                        <tr
                          key={p.sku + p.name}
                          className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition-colors"
                        >
                          <td className="px-4 py-3 md:px-6">
                            <span className="text-sm font-medium text-gray-900 dark:text-slate-100 line-clamp-1">
                              {p.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 md:px-6 text-xs text-gray-400 dark:text-slate-500">
                            {p.sku}
                          </td>
                          <td className="px-4 py-3 md:px-6 text-right font-semibold">
                            {formatCurrency(p.revenue)}
                          </td>
                          <td className="px-4 py-3 md:px-6 text-right">
                            {p.orders}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No product data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Analytics;
