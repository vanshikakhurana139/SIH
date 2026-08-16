import { IconAlertTriangle, IconShield } from "../icons";

// Advocate = blue, Skeptic = red — matches the palette already used for
// severity colors elsewhere (StatusLight.jsx) so this panel feels native
// to the rest of the dashboard, not bolted on.
const ADVOCATE_COLOR = "#2D6A9E";
const SKEPTIC_COLOR = "#B84040";

function Bubble({ label, color, points, icon }) {
    return (
        <div
            className="flex-1 rounded-2xl p-4 border"
            style={{ background: `${color}0A`, borderColor: `${color}30` }}
        >
            <p
                className="text-[10.5px] uppercase tracking-widest font-extrabold mb-3 flex items-center gap-1.5"
                style={{ color }}
            >
                {icon}
                {label}
            </p>
            <ul className="space-y-2">
                {points.map((point, i) => (
                    <li key={i} className="text-[12.5px] leading-relaxed text-fg font-medium flex items-start gap-2">
                        <span
                            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
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

    // Only render once cross-examination has actually run for this incident —
    // stays invisible for incidents diagnosed before Phase 1 was wired in.
    const hasRun =
        Array.isArray(incident.advocate_case) && Array.isArray(incident.skeptic_case);
    if (!hasRun) return null;

    const rawConfidence = incident.confidence;
    const consensusConfidence = incident.consensus_confidence;
    const gapIsLower = consensusConfidence < rawConfidence;

    return (
        <div className="dash-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <p className="dash-eyebrow">Cross-Examination</p>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: "#B8963E", background: "rgba(184,150,62,0.08)", borderColor: "rgba(184,150,62,0.22)" }}>
                    RED TEAM
                </span>
            </div>

            {/* Advocate vs Skeptic speech bubbles */}
            <div className="flex gap-3">
                <Bubble
                    label="Advocate"
                    color={ADVOCATE_COLOR}
                    points={incident.advocate_case}
                    icon={<IconShield width={13} height={13} />}
                />
                <Bubble
                    label="Skeptic"
                    color={SKEPTIC_COLOR}
                    points={incident.skeptic_case}
                    icon={<IconAlertTriangle width={13} height={13} />}
                />
            </div>

            {/* Consensus Confidence Score, shown next to (not replacing) the raw score */}
            <div className="flex items-center gap-4 pt-1">
                <div className="flex-1 rounded-xl px-3.5 py-2.5" style={{ background: "rgba(26,22,18,0.03)", border: "1px solid rgba(180,160,120,0.10)" }}>
                    <p className="text-[9.5px] uppercase tracking-wider font-bold text-fg-subtle mb-0.5">Raw Confidence</p>
                    <p className="text-[15px] font-mono font-bold text-fg-muted">{rawConfidence}%</p>
                </div>
                <div className="flex-1 rounded-xl px-3.5 py-2.5 border-2" style={{ background: `${gapIsLower ? SKEPTIC_COLOR : "#2D7A5A"}0F`, borderColor: `${gapIsLower ? SKEPTIC_COLOR : "#2D7A5A"}40` }}>
                    <p className="text-[9.5px] uppercase tracking-wider font-extrabold mb-0.5" style={{ color: gapIsLower ? SKEPTIC_COLOR : "#2D7A5A" }}>
                        Consensus Confidence
                    </p>
                    <p className="text-[17px] font-mono font-black" style={{ color: gapIsLower ? SKEPTIC_COLOR : "#2D7A5A" }}>
                        {consensusConfidence}%
                    </p>
                </div>
            </div>

            {/* What would change this verdict */}
            {incident.verdict_line && (
                <p className="text-[11.5px] italic text-fg-muted border-l-2 pl-3" style={{ borderColor: "rgba(184,150,62,0.4)" }}>
                    {incident.verdict_line}
                </p>
            )}
        </div>
    );
}