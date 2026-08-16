import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SEGMENTS = [
  { key: "resolved", label: "Resolved", color: "#1F7A4D" },
  { key: "failed", label: "Failed", color: "#C22A2A" },
  { key: "pending", label: "Pending", color: "#A6790A" },
];

export default function HealthCheckPanel({ healthCheck }) {
  if (!healthCheck) return null;

  const data = SEGMENTS.map((s) => ({ ...s, value: healthCheck[s.key] }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold mb-4">
        Post-Action Health Check
      </p>

      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-2xl font-extrabold text-fg tabular-nums">{total}</span>
          <span className="text-[10px] uppercase tracking-[0.08em] text-fg-subtle font-semibold">checks</span>
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        {data.map((d) => (
          <div key={d.key} className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-fg-muted font-medium">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
            <span className="font-mono font-semibold text-fg tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}