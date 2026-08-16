function ScoreRing({ score, label }) {
  const pct = Math.round((score || 0) * 100);
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const isGood = pct >= 80;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth="5"
          />
          <circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke={isGood ? "var(--color-positive)" : "var(--color-accent)"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[13px] font-extrabold text-fg tabular-nums">{pct > 0 ? `${(score || 0).toFixed(2)}` : "—"}</span>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-fg-subtle font-semibold text-center leading-tight">{label}</p>
    </div>
  );
}

export default function TrustScorePanel({ trustScores, onEnableAutopilot }) {
  if (!trustScores || trustScores.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold mb-3">Trust Score</p>
        <p className="text-[12px] text-fg-subtle">No trust scores available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold">Trust Score</p>
        <p className="text-[10px] font-mono text-fg-subtle bg-surface-raised px-2 py-0.5 rounded-full border border-border-subtle">by data source</p>
      </div>

      <div className="flex items-center justify-around gap-2">
        {trustScores.slice(0, 3).map((t) => (
          <ScoreRing key={t.rule_id} score={t.score} label={t.label} />
        ))}
      </div>

      <div className="mt-4 space-y-1.5">
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
                eligible for auto-pilot
              </span>
              <button
                onClick={() => onEnableAutopilot?.(t.rule_id)}
                className="text-[10px] font-bold uppercase tracking-[0.05em] text-positive border border-positive/40 hover:bg-positive/10 px-2.5 py-1 rounded-full transition-colors"
              >
                Enable
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}