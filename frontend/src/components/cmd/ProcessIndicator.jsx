const STEPS = [
  { id: "signal",      label: "Signal",      sub: "All signals received" },
  { id: "detection",   label: "Detection",   sub: "Anomaly detected" },
  { id: "understanding", label: "Understanding", sub: "Pattern recognized" },
  { id: "decision",    label: "Decision",    sub: "Action recommended" },
  { id: "action",      label: "Action",      sub: "Pending execution" },
  { id: "outcome",     label: "Outcome",     sub: "Waiting for results" },
];

const STATUS_TO_STEP = {
  diagnosed:         3,
  approved:          4,
  resolved:          6,
  failed:            6,
  rejected:          4,
  undone:            4,
};

export function statusToStep(status) {
  return STATUS_TO_STEP[status] ?? 1;
}

export default function ProcessIndicator({ activeStep = 1 }) {
  return (
    <div
      className="flex items-center border-t border-border-subtle px-6 py-3 bg-white/80 backdrop-blur-md overflow-x-auto"
      style={{ minHeight: 56 }}
    >
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isDone   = stepNum < activeStep;
        const isActive = stepNum === activeStep;

        return (
          <div key={step.id} className="flex items-center shrink-0">
            {/* Step */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-gold/10 border border-gold/30"
                : isDone
                  ? "bg-positive/8"
                  : ""
            }`} style={isActive ? { background: "rgba(184,150,62,0.10)", borderColor: "rgba(184,150,62,0.30)" } : {}}>
              {/* Icon */}
              {isDone ? (
                <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                  <circle cx="6" cy="6" r="5.5" fill="rgba(45,122,90,0.15)" stroke="rgba(45,122,90,0.5)" strokeWidth="0.8" />
                  <path d="M3.5 6l1.8 1.8L8 4.5" stroke="#2D7A5A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: isActive
                      ? "radial-gradient(circle, #D4AF70, #B8963E)"
                      : "rgba(180,160,120,0.3)",
                  }}
                />
              )}
              <div>
                <p
                  className="text-[9.5px] font-bold uppercase tracking-widest leading-none"
                  style={{ color: isActive ? "var(--color-gold)" : isDone ? "var(--color-positive)" : "var(--color-fg-subtle)" }}
                >
                  {step.label}
                </p>
                <p className="text-[8.5px] text-fg-subtle/60 leading-none mt-0.5 font-mono">{step.sub}</p>
              </div>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="relative mx-1 flex items-center">
                <div
                  className="w-10 h-px"
                  style={{ background: isDone ? "rgba(45,122,90,0.4)" : "rgba(180,160,120,0.2)" }}
                />
                <svg viewBox="0 0 8 8" width="7" height="7" fill="none" style={{ position: "absolute", right: -4 }}>
                  <path d="M1 4h6M4 1l3 3-3 3" stroke={isDone ? "rgba(45,122,90,0.5)" : "rgba(180,160,120,0.25)"} strokeWidth="1" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
