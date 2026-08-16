import { IconArrow } from "../icons";

const STEPS = [
  { num: 1, label: "Sensor Data", sub: "Streaming" },
  { num: 2, label: "Rule Engine", sub: "Evaluating" },
  { num: 3, label: "Reasoning Engine", sub: "Analyzing" },
  { num: 4, label: "Human Dashboard", sub: "Presenting" },
  { num: 5, label: "Orchestration", sub: "Executing" },
  { num: 6, label: "Health Check", sub: "Monitoring" },
];

export default function ArchitectureStrip({ activeStep = 3 }) {
  return (
    <div className="dash-card p-4 rounded-2xl">
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
        {STEPS.map((step, i) => {
          const isActive = step.num === activeStep;
          const isDone = step.num < activeStep;
          return (
            <div key={step.num} className="flex items-center gap-1.5 shrink-0">
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all duration-300 border ${
                  isActive
                    ? "bg-gradient-to-r from-accent to-accent-light border-accent text-white shadow-md shadow-accent/25 scale-[1.03]"
                    : isDone
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-800"
                    : "bg-white/50 border-white/80 text-fg-muted hover:bg-white/80"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black shrink-0 ${
                    isActive
                      ? "bg-white/25 text-white"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  {isDone ? "✓" : step.num}
                </span>
                <div>
                  <p className={`text-[11px] font-extrabold whitespace-nowrap leading-tight ${isActive ? "text-white" : "text-fg"}`}>
                    {step.label}
                  </p>
                  <p className={`text-[9px] font-semibold leading-tight ${isActive ? "text-white/80" : isDone ? "text-emerald-600" : "text-fg-subtle"}`}>
                    {step.sub}
                  </p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <IconArrow
                  width={13}
                  height={13}
                  className={`shrink-0 mx-0.5 ${isActive ? "text-accent animate-pulse" : isDone ? "text-emerald-500" : "text-fg-subtle/30"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}