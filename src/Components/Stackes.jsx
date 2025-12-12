import React from "react";
import { BanknoteArrowDown, BaggageClaim, BadgeDollarSign, MessagesSquare } from "lucide-react";
import GrowthChart from "../Components/GrowthChart";

const Stackes = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-fr">
      {/* Card 1: Total Orders (Replaces Expense) */}
      <div className="flex flex-col justify-between border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900/60 dark:backdrop-blur">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
              <BanknoteArrowDown className="h-6 w-6 text-rose-500" />
            </div>
            {/* <span className="text-xs font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg">-2.5%</span> */}
          </div>
          <h1 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Orders</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats?.totalOrders || 0}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Last 30 days</p>
        </div>
        <div className="mt-4 h-16">
          <GrowthChart />
        </div>
      </div>

      {/* Card 2: Avg Order Value (Replaces Sales Profit) */}
      <div className="flex flex-col justify-between border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900/60 dark:backdrop-blur">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <BaggageClaim className="h-6 w-6 text-emerald-500" />
            </div>
            {/* <span className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">+12%</span> */}
          </div>
          <h1 className="text-sm font-medium text-gray-500 dark:text-slate-400">Avg. Order Value</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCurrency(stats?.averageOrderValue)}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Per order</p>
        </div>
      </div>

      {/* Card 3: Total Revenue */}
      <div className="flex flex-col justify-between border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900/60 dark:backdrop-blur">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <BadgeDollarSign className="h-6 w-6 text-blue-500" />
            </div>
            {/* <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">+8.1%</span> */}
          </div>
          <h1 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Revenue</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCurrency(stats?.totalRevenue)}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Card 4: Active Customers (Replaces New Comments) */}
      <div className="flex flex-col justify-between border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900/60 dark:backdrop-blur">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <MessagesSquare className="h-6 w-6 text-amber-500" />
            </div>
            {/* <span className="text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg">+24</span> */}
          </div>
          <h1 className="text-sm font-medium text-gray-500 dark:text-slate-400">Active Customers</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats?.activeCustomers || 0}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Last 30 days</p>
        </div>
      </div>
    </div>
  );
};

export default Stackes;
