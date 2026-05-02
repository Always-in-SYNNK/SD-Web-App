// frontend/src/components/analytics/ApplicationVolumeChart.jsx
//
// Requires: npm install chart.js react-chartjs-2   (run inside frontend/)
//
// Props:
//   data — array of { opportunityTitle, count, status } from the API

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Filler
);

const PALETTE = [
  "#035b9d", "#1d7a3a", "#a06000", "#a32d2d", "#535AB7", "#0F6E56",
];

export default function ApplicationVolumeChart({ data = [] }) {
  const [chartType, setChartType] = useState("bar");

  const labels = data.map((d) => truncate(d.opportunityTitle, 22));
  const counts  = data.map((d) => d.count);
  const isLine  = chartType === "line";

  const chartData = {
    labels,
    datasets: [
      {
        label: "Applications",
        data: counts,
        backgroundColor: isLine
          ? "rgba(3,91,157,0.08)"
          : PALETTE.map((c) => c + "cc"),
        borderColor:     isLine ? "#035b9d" : PALETTE,
        borderWidth:     isLine ? 2.5 : 0,
        borderRadius:    isLine ? 0 : 8,
        fill:            isLine,
        tension:         0.42,
        pointBackgroundColor: "#035b9d",
        pointRadius:     isLine ? 5 : 0,
        pointHoverRadius: isLine ? 7 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.parsed.y} applications` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#707881", maxRotation: 30 },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(112,120,129,0.1)" },
        ticks: { font: { size: 11 }, color: "#707881", stepSize: 20 },
      },
    },
  };

  const ChartComponent = isLine ? Line : Bar;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-800 text-base">
            Application Volume per Opportunity
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Live from{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#035b9d]">
              GET /api/analytics/applications
            </code>
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1.5">
          {["bar", "line"].map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition ${
                chartType === t
                  ? "bg-[#035b9d] text-white border-[#035b9d]"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 260 }}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <ChartComponent data={chartData} options={options} />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#035b9d] inline-block" />
          Applications
        </span>
      </div>
    </div>
  );
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}