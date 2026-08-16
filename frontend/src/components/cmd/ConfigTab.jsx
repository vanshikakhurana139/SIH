const SCENARIO_POINTS = {
  powerplant: [
    { label: "Turbine Temp — High",              sensor: "turbine_temp",        value: 96.2,  severity: "high" },
    { label: "Coolant Pressure — Medium",        sensor: "coolant_pressure",    value: 25.0,  severity: "medium" },
    { label: "Generator Vibration — Critical",   sensor: "generator_vibration", value: 8.1,   severity: "critical" },
  ],
  hospital: [
    { label: "Heart Rate — High",                sensor: "heart_rate",          value: 135,   severity: "high" },
    { label: "SpO₂ — Critical",                  sensor: "spo2",                value: 87,    severity: "critical" },
    { label: "Systolic BP — Medium",             sensor: "systolic_bp",         value: 85,    severity: "medium" },
  ],
};

const SEV_STYLE = {
  critical: { bg: "rgba(184,64,64,0.08)",   text: "#B84040",  border: "rgba(184,64,64,0.22)" },
  high:     { bg: "rgba(192,86,42,0.08)",   text: "#C0562A",  border: "rgba(192,86,42,0.22)" },
  medium:   { bg: "rgba(176,123,46,0.08)",  text: "#B07B2E",  border: "rgba(176,123,46,0.22)" },
};

export default function ConfigTab({ scenario, onSimulate }) {
  const points = SCENARIO_POINTS[scenario] || SCENARIO_POINTS.powerplant;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <p className="dash-eyebrow mb-1">Configuration</p>
        <h2 className="font-display text-[32px] text-fg" style={{ letterSpacing: "-0.01em" }}>Simulation & Config</h2>
        <p className="text-[13px] text-fg-muted mt-1">Trigger sensor simulations to test the full AI incident workflow end-to-end.</p>
      </div>

      {/* Simulate panel */}
      <div className="ivory-card p-6 mb-6">
        <p className="text-[14px] font-bold text-fg mb-1">Sensor Simulation</p>
        <p className="text-[12px] text-fg-subtle mb-5">
          Inject an anomalous sensor reading into the backend to trigger the AI diagnosis pipeline.
          Current environment: <span className="font-bold text-gold capitalize" style={{ color: "var(--color-gold)" }}>{scenario}</span>
        </p>

        <div className="space-y-3">
          {points.map((p) => {
            const c = SEV_STYLE[p.severity] || SEV_STYLE.medium;
            return (
              <button
                key={p.sensor}
                id={`simulate-${p.sensor}`}
                onClick={() => onSimulate(p.sensor, p.value)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 text-left group hover:shadow-md"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: c.text }}
                  />
                  <div>
                    <p className="text-[13px] font-bold text-fg">{p.label}</p>
                    <p className="text-[11px] font-mono text-fg-subtle">{p.sensor} → {p.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{ color: c.text, background: `${c.text}18`, borderColor: c.border }}
                  >
                    {p.severity}
                  </span>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: c.text }}>
                    <path d="M3 8h10M8 3l5 5-5 5" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System info */}
      <div className="ivory-card p-6">
        <p className="text-[14px] font-bold text-fg mb-4">System Information</p>
        <div className="space-y-3">
          {[
            { label: "Backend",      value: "FastAPI + SQLite · Port 8000" },
            { label: "Frontend",     value: "React + Vite · Port 5177" },
            { label: "AI Engine",    value: "Rule-based + LLM Reasoning" },
            { label: "Scenario",     value: scenario === "hospital" ? "Hospital (HOS-001/002/003)" : "Power Plant (PP-001/002/003)" },
            { label: "Version",      value: "v0.4 · Sentinel AI Platform" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
              <span className="text-[12px] font-semibold text-fg-subtle">{label}</span>
              <span className="text-[12px] font-mono text-fg">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
