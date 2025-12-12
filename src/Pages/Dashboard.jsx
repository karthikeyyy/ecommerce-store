import React from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import Barchart from "../Components/Barchart";
import DonutChart from "../Components/TopSelling";
import Stackes from "../Components/Stackes";
import LineChartt from "../Components/Candelstick";
import TopSection from "../Components/TopSection";
import DashboardInventorySlider from "../Components/DashboardInventorySlider";
import { getProducts } from "../services/productService";
import analyticsService from "../services/analyticsService";

const Dashboard = () => {
  const [loading, setLoading] = React.useState(true);
  const [salesData, setSalesData] = React.useState(null);
  const [topProducts, setTopProducts] = React.useState([]);
  const [customerStats, setCustomerStats] = React.useState(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesRes, productsRes, customersRes] = await Promise.all([
          analyticsService.getSalesAnalytics("30d"),
          // Fetch raw products for "Recently Added" list
          getProducts(),
          analyticsService.getCustomerAnalytics()
        ]);

        if (salesRes.data.success) setSalesData(salesRes.data.data);

        // Handle products response (direct array from getProducts based on previous file views)
        // Sort by date desc to get "Recently Added"
        if (Array.isArray(productsRes)) {
          const sorted = productsRes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTopProducts(sorted.slice(0, 5));
        }

        if (customersRes.data.success) setCustomerStats(customersRes.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight">Ecommerce Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Overview of your store's performance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2 min-w-0 flex flex-col gap-6">
                <div className="flex-1 min-h-0">
                  <TopSection salesData={salesData} />
                </div>
                <div className="flex-1 min-h-0">
                  <Barchart data={salesData?.dailySales || []} />
                </div>
              </div>
              <div className="lg:col-span-1 min-w-0">
                <Stackes stats={{ ...salesData?.summary, ...customerStats }} />
              </div>
            </div>

            <div className="w-full">
              <DashboardInventorySlider />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 min-w-0">
                <LineChartt />
              </div>
              <div className="lg:col-span-1 min-w-0">
                <DonutChart products={topProducts} />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
