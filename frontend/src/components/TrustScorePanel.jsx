import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TrustScorePanel({ trustScores, onEnableAutopilot }) {
  if (!trustScores) return null;

  const chartData = trustScores.map((t) => ({
    name: t.label,
    score: Math.round(t.score * 100),
    eligible: t.auto_pilot_eligible,
  }));

  return (
    <div className="bg-surface border border-border-subtle rounded-md p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle">Trust Score</p>
        <p className="text-[11px] font-mono text-fg-subtle">by rule</p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }} barSize={10}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8d96ab", fontSize: 11, fontFamily: "IBM Plex Mono" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{
              backgroundColor: "#171c25",
              border: "1px solid #262d3d",
              borderRadius: 6,
              fontSize: 12,
              fontFamily: "IBM Plex Mono",
            }}
            labelStyle={{ color: "#e8eaf0" }}
          />
          <Bar dataKey="score" radius={[0, 3, 3, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.eligible ? "#3fae7c" : "#5e7ce2"} />
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
              className="flex items-center justify-between border border-positive/25 bg-positive/[0.06] rounded-md px-3 py-2"
            >
              <span className="text-[12px] text-fg">
                <span style={{ color: "var(--color-positive)" }} className="font-medium">
                  {t.label}
                </span>{" "}
                has earned auto-pilot
              </span>
              <button
                onClick={() => onEnableAutopilot(t.rule_id)}
                className="text-[11px] font-medium uppercase tracking-[0.05em] text-positive border border-positive/40 hover:bg-positive/10 px-2.5 py-1 rounded transition-colors"
              >
                Enable
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}