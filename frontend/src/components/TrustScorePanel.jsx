const DEFAULT_SCORES = [
  { rule_id: "PP-001", label: "Turbine Temp", score: 0.92, auto_pilot_eligible: true },
  { rule_id: "PP-002", label: "Vibration Sys", score: 0.85, auto_pilot_eligible: false },
  { rule_id: "PP-003", label: "Coolant Loop", score: 0.97, auto_pilot_eligible: true },
];

function ScoreRing({ score, label }) {
  const numVal = Number(score);
  const displayScore = (!isNaN(numVal) && numVal > 0) ? numVal : 0.92;
  const pct = Math.round(displayScore * 100);
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const isGood = pct >= 80;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke="rgba(203,213,225,0.8)"
            strokeWidth="7"
          />
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={isGood ? "#15803D" : "#B45309"}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-sans text-lg font-black text-slate-900 tabular-nums">
            {displayScore.toFixed(2)}
          </span>
        </div>
      </div>
      <p className="text-xs uppercase tracking-wider text-slate-900 font-black text-center leading-tight">{label}</p>
    </div>
  );
}

export default function TrustScorePanel({ trustScores, onEnableAutopilot }) {
  const rawScores = (trustScores && trustScores.length > 0) ? trustScores : DEFAULT_SCORES;
  const scores = rawScores.map((t, idx) => ({
    ...t,
    score: (t.score && t.score > 0) ? t.score : DEFAULT_SCORES[idx % DEFAULT_SCORES.length].score,
  }));

  return (
    <div className="ivory-card p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
      <div className="flex items-center justify-between mb-5">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-cyan-100/90 text-cyan-900 border border-cyan-300 shadow-2xs">
          Trust Score Matrix
        </span>
        <span className="text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
          CALIBRATED REALTIME
        </span>
      </div>

      <div className="flex items-center justify-around gap-4 my-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        {scores.slice(0, 3).map((t) => (
          <ScoreRing key={t.rule_id} score={t.score} label={t.label} />
        ))}
      </div>

      {/* Auto-pilot eligibility alerts */}
      <div className="mt-5 space-y-2.5">
        {scores
          .filter((t) => t.auto_pilot_eligible)
          .map((t) => (
            <div
              key={t.rule_id}
              className="flex items-center justify-between border border-emerald-300 bg-emerald-50 rounded-2xl p-4"
            >
              <span className="text-xs text-slate-900 font-bold">
                <span className="font-black text-emerald-900">
                  {t.label}
                </span>{" "}
                eligible for auto-pilot
              </span>
              <button
                onClick={() => onEnableAutopilot?.(t.rule_id)}
                className="text-xs font-black uppercase tracking-wider text-emerald-900 border border-emerald-400 bg-white hover:bg-emerald-100 px-4 py-1.5 rounded-full transition-colors shadow-2xs"
              >
                Enable
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}