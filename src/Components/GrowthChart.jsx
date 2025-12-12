// ExpenseDonutChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseDonutChart = () => {
  const data = {
    labels: ["Rent", "Food", "Transport", "Entertainment", "Others"],
    datasets: [
      {
        label: "Expenses",
        data: [1200, 500, 200, 150, 100],
        backgroundColor: [
          "#FF6384", // Rent
          "#36A2EB", // Food
          "#FFCE56", // Transport
          "#4BC0C0", // Entertainment
          "#9966FF", // Others
        ],
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // prevent overflow
    cutout: "70%", // donut thickness
    plugins: {
      legend: {
        display: false, // hide legend bar
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.label}: $${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ExpenseDonutChart;
