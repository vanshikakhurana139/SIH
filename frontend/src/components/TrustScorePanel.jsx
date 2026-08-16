import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TrustScorePanel({ trustScores, onEnableAutopilot }) {
  if (!trustScores) return null;

  const chartData = trustScores.map((t) => ({
    name: t.label,
    score: Math.round(t.score * 100),
    eligible: t.auto_pilot_eligible,
  }));

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold">Trust Score</p>
        <p className="text-[11px] font-mono text-fg-subtle">by rule</p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }} barSize={12}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5B6472", fontSize: 11, fontFamily: "Plus Jakarta Sans", fontWeight: 600 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(18,20,28,0.04)" }}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3E7ED",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: "Plus Jakarta Sans",
              boxShadow: "0 4px 12px rgba(18,20,28,0.08)",
            }}
            labelStyle={{ color: "#12141C", fontWeight: 700 }}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.eligible ? "#1F7A4D" : "#1D4E89"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-1.5">
        {trustScores
          .filter((t) => t.auto_pilot_eligible)
          .map((t) => (
            <div
              key={t.rule_id}
              className="flex items-center justify-between border border-positive/25 bg-positive/[0.06] rounded-xl px-3 py-2"
            >
              <span className="text-[12px] text-fg">
                <span style={{ color: "var(--color-positive)" }} className="font-bold">
                  {t.label}
                </span>{" "}
                has earned auto-pilot
              </span>
              <button
                onClick={() => onEnableAutopilot(t.rule_id)}
                className="text-[11px] font-bold uppercase tracking-[0.05em] text-positive border border-positive/40 hover:bg-positive/10 px-3 py-1.5 rounded-full transition-colors"
              >
                Enable
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}