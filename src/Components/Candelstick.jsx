

import React, { useState } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
} from "recharts";

// ✅ Candlestick Data directly here
const dataWeekly = [
  { name: "Mon", open: 1000, close: 1200, low: 900, high: 1400 },
  { name: "Tue", open: 1200, close: 1500, low: 1100, high: 1600 },
  { name: "Wed", open: 1500, close: 1400, low: 1350, high: 1600 },
  { name: "Thu", open: 1400, close: 1700, low: 1300, high: 1800 },
  { name: "Fri", open: 1700, close: 1600, low: 1500, high: 1800 },
  { name: "Sat", open: 1600, close: 1800, low: 1550, high: 2000 },
  { name: "Sun", open: 1800, close: 2000, low: 1700, high: 2200 },
];

const dataMonthly = [
  { name: "Jan", open: 10000, close: 12000, low: 9000, high: 15000 },
  { name: "Feb", open: 12000, close: 15000, low: 11000, high: 16000 },
  { name: "Mar", open: 15000, close: 14000, low: 13500, high: 16000 },
  { name: "Apr", open: 14000, close: 17000, low: 13000, high: 18000 },
  { name: "May", open: 17000, close: 16000, low: 15000, high: 18000 },
  { name: "Jun", open: 16000, close: 18000, low: 15500, high: 20000 },
];

const dataYearly = [
  { name: "2020", open: 90000, close: 120000, low: 85000, high: 140000 },
  { name: "2021", open: 120000, close: 150000, low: 100000, high: 170000 },
  { name: "2022", open: 150000, close: 140000, low: 135000, high: 160000 },
  { name: "2023", open: 140000, close: 170000, low: 130000, high: 190000 },
];

// ✅ Custom Candle Shape
const Candle = ({ x, y, width, height, payload }) => {
  const { open, close } = payload;
  const up = close > open;
  const fill = up ? "#10b981" : "#ef4444"; // green or red

  const candleHeight = Math.abs(close - open);
  const candleY = up ? y + (height - candleHeight) : y;

  return (
    <g>
      <line
        x1={x + width / 2}
        x2={x + width / 2}
        y1={y}
        y2={y + height}
        stroke={fill}
        strokeWidth={2}
      />
      <rect
        x={x}
        y={candleY}
        width={width}
        height={Math.max(candleHeight, 3)}
        rx={2}
        fill={fill}
      />
    </g>
  );
};

const CandlestickChart = () => {
  const [timeframe, setTimeframe] = useState("weekly");

  const getData = () => {
    switch (timeframe) {
      case "weekly":
        return dataWeekly;
      case "monthly":
        return dataMonthly;
      case "yearly":
        return dataYearly;
      default:
        return dataWeekly;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Candlestick Chart</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Market analysis and trends</p>
        </div>

        <div className="flex gap-2 items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl h-fit">
          {["weekly", "monthly", "yearly"].map((frame) => (
            <button
              key={frame}
              onClick={() => setTimeframe(frame)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none ${timeframe === frame
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                }`}
            >
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={getData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
            <Bar dataKey="close" shape={<Candle />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CandlestickChart;
