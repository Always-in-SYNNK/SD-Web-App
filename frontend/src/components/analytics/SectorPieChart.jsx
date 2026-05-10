import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ["#035b9d","#1d7a3a","#a06000","#a32d2d","#535AB7","#0F6E56","#b45309","#6d28d9","#0e7490","#be185d","#065f46","#92400e"];

export default function SectorPieChart({ data = [] }) {
  const sectors = data
    .map((d) => ({
      sector:   d.sector || "Unknown",
      total:    Number(d.totalApplications ?? 0),
      accepted: Number(d.acceptedApplications ?? 0),
      rate:     Number(d.placementRate ?? 0),
    }))
    .filter((d) => d.accepted > 0);

  const grandAccepted = sectors.reduce((s, d) => s + d.accepted, 0) || 1;

  const chartData = {
    labels: sectors.map((d) => d.sector),
    datasets: [{
      data: sectors.map((d) => d.accepted),
      backgroundColor: PALETTE.slice(0, sectors.length).map((c) => c + "d9"),
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const centreLabel = {
    id: "centreLabel",
    beforeDraw(chart) {
      const { ctx, chartArea: { left, right, top, bottom } } = chart;
      const cx = (left + right) / 2;
      const cy = (top + bottom) / 2;
      ctx.save();
      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(grandAccepted, cx, cy - 10);
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("Accepted", cx, cy + 12);
      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "right",
        labels: {
            boxWidth: 12, boxHeight: 12, borderRadius: 3, useBorderRadius: true,
            font: { size: 11 }, color: "#555", padding: 16,
            maxItems: 6,  // 6 per row
            generateLabels: (chart) =>
            chart.data.labels.map((label, i) => ({
                text: `${label} (${((chart.data.datasets[0].data[i] / grandAccepted) * 100).toFixed(1)}%)`,
                fillStyle: PALETTE[i % PALETTE.length] + "d9",
                strokeStyle: "#fff", lineWidth: 1, index: i, hidden: false,
            })),
        },
        },
      tooltip: {
        backgroundColor: "#fff", borderColor: "#e5e7eb", borderWidth: 1,
        titleColor: "#111", bodyColor: "#444", padding: 12,
        callbacks: {
          label: (ctx) => {
            const d = sectors[ctx.dataIndex];
            return [
              `  Accepted: ${d.accepted} of ${d.total}`,
              `  Placement rate: ${d.rate}%`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 text-base">Placements by Sector</h3>
        <p className="text-xs text-gray-400 mt-0.5">Share of accepted applicants across sectors</p>
      </div>
      <div style={{ height: 250 }}>
        {sectors.length === 0
          ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">No accepted applications yet</div>
          : <Doughnut data={chartData} options={options} plugins={[centreLabel]} />
        }
      </div>
    </div>
  );
}