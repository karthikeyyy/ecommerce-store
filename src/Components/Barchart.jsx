import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
} from "recharts";

export default function RevenueNetProfitChart({ className = "w-full h-full", data = [] }) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      revenue: item.revenue,
      profit: item.revenue * 0.2 // Simulating ~20% net profit
    }));
  }, [data]);

  const totalRevenue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [data]);

  const totalProfit = totalRevenue * 0.2; // Simulating profit

  return (
    <div className={`bg-white dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue & Net Profit</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Daily revenue (bar) vs est. profit (line)</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {/* revenue as bars */}
              <Bar dataKey="revenue" name="Revenue" barSize={32} fill="#10B981" radius={[4, 4, 0, 0]} />

              {/* profit as line */}
              <Line type="monotone" dataKey="profit" name="Est. Net Profit" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-48 p-4 bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-xl">
          <div className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Summary</div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total Revenue</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalRevenue)}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Est. Net Profit</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalProfit)}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
