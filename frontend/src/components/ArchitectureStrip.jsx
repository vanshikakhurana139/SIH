import { IconArrow } from "../icons";

const STEPS = [
  "Sensor Data",
  "Rule Engine",
  "Reasoning Engine",
  "Human Dashboard",
  "Orchestration",
  "Health Check",
];

export default function ArchitectureStrip() {
  return (
    <div className="bg-surface border border-border-subtle rounded-md px-5 py-3.5 mb-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border-subtle bg-surface-raised/60">
              <span className="font-mono text-[10px] text-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[12px] text-fg-muted whitespace-nowrap">{step}</span>
            </div>
            {i < STEPS.length - 1 && <IconArrow className="text-fg-subtle mx-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}