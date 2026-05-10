import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function SectorBarChart({ data = [] }) {
  const sorted = [...data].sort((a, b) => Number(b.total_applications) - Number(a.total_applications));

  const labels    = sorted.map((d) => d.sector);
  const totals    = sorted.map((d) => Number(d.total_applications));
  const accepted  = sorted.map((d) => Number(d.accepted_applications));
  const rates     = sorted.map((d) => Number(d.placement_rate));

  const chartData = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Total Applications",
        data: totals,
        backgroundColor: "rgba(3,91,157,0.82)",
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: "yLeft",
        order: 2,
      },
      {
        type: "bar",
        label: "Accepted",
        data: accepted,
        backgroundColor: "rgba(29,122,58,0.80)",
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: "yLeft",
        order: 2,
      },
      {
        type: "line",
        label: "Acceptance Rate (%)",
        data: rates,
        borderColor: "#e07b00",
        backgroundColor: "rgba(224,123,0,0.12)",
        borderWidth: 2.5,
        pointBackgroundColor: "#e07b00",
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.38,
        fill: false,
        yAxisID: "yRight",
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top", align: "end",
        labels: { boxWidth: 12, boxHeight: 12, borderRadius: 3, useBorderRadius: true, font: { size: 11 }, color: "#555", padding: 16 },
      },
      tooltip: {
        backgroundColor: "#fff", borderColor: "#e5e7eb", borderWidth: 1,
        titleColor: "#111", bodyColor: "#444", padding: 12,
        callbacks: {
          label: (ctx) => ctx.dataset.label === "Acceptance Rate (%)"
            ? `  Acceptance rate: ${ctx.parsed.y}%`
            : `  ${ctx.dataset.label}: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#707881" } },
      yLeft: {
        beginAtZero: true, position: "left",
        grid: { color: "rgba(112,120,129,0.1)" },
        ticks: { font: { size: 11 }, color: "#707881" },
        title: { display: true, text: "Applications", font: { size: 11 }, color: "#9ca3af" },
      },
      yRight: {
        beginAtZero: true, max: 100, position: "right",
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 11 }, color: "#e07b00", callback: (v) => `${v}%` },
        title: { display: true, text: "Acceptance Rate", font: { size: 11 }, color: "#e07b00" },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 text-base">Applications per Sector</h3>
        <p className="text-xs text-gray-400 mt-0.5">Bars show total vs accepted · Line shows acceptance rate (right axis)</p>
      </div>
      <div style={{ height: 300 }}>
        {sorted.length === 0
          ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
          : <Chart type="bar" data={chartData} options={options} />
        }
      </div>
    </div>
  );
}