const STEPS = [
  { id: "signal",        num: "01", label: "Signal Telemetry", sub: "All channels active" },
  { id: "detection",     num: "02", label: "Anomaly Detection", sub: "Threshold check" },
  { id: "understanding", num: "03", label: "AI Reasoning",    sub: "Pattern match" },
  { id: "decision",      num: "04", label: "Action Decision",  sub: "Policy recommendation" },
  { id: "action",        num: "05", label: "Orchestration",   sub: "Execution pipeline" },
  { id: "outcome",       num: "06", label: "Health Verification", sub: "Recovery monitoring" },
];

export default function ProcessIndicator({ activeStep = 1 }) {
  return (
    <div
      className="flex items-center border-t border-slate-200/90 px-8 py-4 bg-white/95 backdrop-blur-md overflow-x-auto shrink-0 shadow-lg"
      style={{ minHeight: 76 }}
    >
      <div className="flex items-center gap-2 max-w-[1700px] mx-auto w-full justify-between">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isDone   = stepNum < activeStep;
          const isActive = stepNum === activeStep;

          return (
            <div key={step.id} className="flex items-center shrink-0">
              {/* Step Badge */}
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 border ${
                  isActive
                    ? "bg-amber-500/10 border-amber-500/40 shadow-sm scale-[1.02]"
                    : isDone
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-slate-50/80 border-slate-200/70"
                }`}
              >
                {/* Step indicator icon/number */}
                {isDone ? (
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black shrink-0 shadow-xs">
                    ✓
                  </span>
                ) : (
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold font-mono shrink-0 ${
                      isActive
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step.num}
                  </span>
                )}

                <div>
                  <p
                    className={`text-xs font-extrabold uppercase tracking-widest leading-tight ${
                      isActive
                        ? "text-amber-800"
                        : isDone
                          ? "text-emerald-800"
                          : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono font-semibold leading-tight mt-0.5">{step.sub}</p>
                </div>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="relative mx-3 flex items-center shrink-0">
                  <div
                    className="w-12 sm:w-16 h-0.5 rounded-full"
                    style={{ background: isDone ? "rgba(45,122,90,0.5)" : "rgba(226,232,240,0.9)" }}
                  />
                  <svg viewBox="0 0 8 8" width="8" height="8" fill="none" style={{ position: "absolute", right: -4 }}>
                    <path d="M1 4h6M4 1l3 3-3 3" stroke={isDone ? "#2D7A5A" : "#94A3B8"} strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
