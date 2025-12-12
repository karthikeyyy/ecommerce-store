import React from "react";

function TopSection({ salesData }) {
  // Calculate today's sales
  const today = new Date().toISOString().split('T')[0];
  const todayStats = salesData?.dailySales?.find(d => d.date === today) || { revenue: 0 };
  const totalRevenue = salesData?.summary?.totalRevenue || 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full h-full p-6 sm:p-8 border border-gray-200 rounded-2xl bg-white dark:bg-slate-900/60 dark:border-slate-800 dark:backdrop-blur shadow-sm flex flex-col justify-between">
      {/* Header Text */}
      <div className="mb-4">
        <h1 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Welcome Back to Shopping Mia
        </h1>
        <p className="text-base text-gray-500 dark:text-slate-400">
          You have earned {formatCurrency(totalRevenue)} revenue this month — keep it up!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 border-gray-200 sm:ltr:border-r sm:rtl:border-l dark:border-slate-700 sm:pr-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 flex-wrap">
            {formatCurrency(todayStats.revenue)}
            <span className="text-sm font-normal text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
              📈 +0%
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Today's Sales
          </p>
        </div>

        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 sm:pl-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 flex-wrap">
            {formatCurrency(totalRevenue)}
            <span className="text-sm font-normal text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
              📈 +12%
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Total Revenue (30d)
          </p>
        </div>
      </div>
    </div>
  );
}

export default TopSection;
