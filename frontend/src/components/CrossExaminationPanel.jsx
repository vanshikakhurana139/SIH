import { IconAlertTriangle, IconShield } from "../icons";

const ADVOCATE_COLOR = "#1D4ED8";
const SKEPTIC_COLOR = "#B91C1C";

function Bubble({ label, color, points, icon }) {
  return (
    <div
      className="flex-1 rounded-2xl p-5 border"
      style={{ background: `${color}0D`, borderColor: `${color}35` }}
    >
      <p
        className="text-xs uppercase tracking-widest font-black mb-3 flex items-center gap-2"
        style={{ color }}
      >
        {icon}
        {label}
      </p>
      <ul className="space-y-2.5">
        {points.map((point, i) => (
          <li key={i} className="text-xs sm:text-sm leading-relaxed text-slate-900 font-bold flex items-start gap-2.5">
            <span
              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
              style={{ backgroundColor: color, display: "inline-block" }}
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CrossExaminationPanel({ incident }) {
  if (!incident) return null;

  const hasRun = Array.isArray(incident.advocate_case) && Array.isArray(incident.skeptic_case);
  if (!hasRun) return null;

  const rawConfidence = incident.confidence;
  const consensusConfidence = incident.consensus_confidence;
  const gapIsLower = consensusConfidence < rawConfidence;

  return (
    <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-5">
      <div className="flex items-center justify-between">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs">
          Cross-Examination Analysis
        </span>
        <span className="text-xs font-black text-rose-900 bg-rose-100 border border-rose-300 px-3.5 py-1 rounded-full">
          RED TEAM CONSENSUS
        </span>
      </div>

      {/* Advocate vs Skeptic speech bubbles */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Bubble
          label="Advocate Case"
          color={ADVOCATE_COLOR}
          points={incident.advocate_case}
          icon={<IconShield width={15} height={15} />}
        />
        <Bubble
          label="Skeptic Case"
          color={SKEPTIC_COLOR}
          points={incident.skeptic_case}
          icon={<IconAlertTriangle width={15} height={15} />}
        />
      </div>

      {/* Consensus Confidence Score */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <div className="flex-1 w-full rounded-2xl p-4 bg-slate-50 border border-slate-200">
          <p className="text-xs uppercase tracking-wider font-black text-slate-500 mb-1">Raw Confidence</p>
          <p className="text-xl font-sans font-black text-slate-900">{rawConfidence}%</p>
        </div>
        <div className="flex-1 w-full rounded-2xl p-4 border-2" style={{ background: `${gapIsLower ? SKEPTIC_COLOR : "#15803D"}0F`, borderColor: `${gapIsLower ? SKEPTIC_COLOR : "#15803D"}40` }}>
          <p className="text-xs uppercase tracking-wider font-black mb-1" style={{ color: gapIsLower ? SKEPTIC_COLOR : "#15803D" }}>
            Consensus Confidence
          </p>
          <p className="text-2xl font-sans font-black" style={{ color: gapIsLower ? SKEPTIC_COLOR : "#15803D" }}>
            {consensusConfidence}%
          </p>
        </div>
      </div>

      {/* What would change this verdict */}
      {incident.verdict_line && (
        <p className="text-xs sm:text-sm font-bold text-slate-700 border-l-4 border-amber-500 pl-4 py-1 italic bg-amber-50/60 rounded-r-xl">
          {incident.verdict_line}
        </p>
      )}
    </div>
  );
}