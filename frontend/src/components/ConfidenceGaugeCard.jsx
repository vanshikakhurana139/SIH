import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import Gauge from "./Gauge";

const SEVERITY_COLOR = {
  low: "var(--color-severity-low)",
  medium: "var(--color-severity-medium)",
  high: "var(--color-severity-high)",
  critical: "var(--color-severity-critical)",
};

export default function ConfidenceGaugeCard({ incident, incidents }) {
  const value = incident?.confidence ?? 0;

  const counts = { low: 0, medium: 0, high: 0, critical: 0 };
  (incidents || []).forEach((i) => {
    if (counts[i.severity] !== undefined) counts[i.severity] += 1;
  });
  const chartData = Object.entries(counts).map(([severity, count]) => ({ severity, count }));

  return (
    <div className="dash-card px-5 py-5">
      <p className="dash-eyebrow mb-1">Confidence Gauge</p>
      <Gauge value={value} />
      <div className="mt-3 pt-3 border-t border-border-subtle">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-fg-muted mb-2">
          Risk Factor Breakdown
        </p>
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="30%">
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.severity} fill={SEVERITY_COLOR[d.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
