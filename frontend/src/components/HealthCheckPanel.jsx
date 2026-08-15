import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SEGMENTS = [
  { key: "resolved", label: "Resolved", color: "#3fae7c" },
  { key: "failed", label: "Failed", color: "#d64545" },
  { key: "pending", label: "Pending", color: "#d9a441" },
];

export default function HealthCheckPanel({ healthCheck }) {
  if (!healthCheck) return null;

  const data = SEGMENTS.map((s) => ({ ...s, value: healthCheck[s.key] }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-surface border border-border-subtle rounded-md p-5">
      <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle mb-4">
        Post-Action Health Check
      </p>

      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-xl text-fg tabular-nums">{total}</span>
          <span className="text-[10px] uppercase tracking-[0.08em] text-fg-subtle">checks</span>
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        {data.map((d) => (
          <div key={d.key} className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-fg-muted">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
            <span className="font-mono text-fg tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}