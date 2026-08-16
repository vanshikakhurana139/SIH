const SCENARIO_POINTS = {
  powerplant: [
    { label: "Turbine Temp — High Anomalous Reading",       sensor: "turbine_temp",        value: 96.2,  severity: "high" },
    { label: "Coolant Loop Pressure — Medium Drop",         sensor: "coolant_pressure",    value: 25.0,  severity: "medium" },
    { label: "Generator Vibration — Critical Spike",        sensor: "generator_vibration", value: 8.1,   severity: "critical" },
  ],
  hospital: [
    { label: "Cardiac Heart Rate — High Tachycardia",       sensor: "heart_rate",          value: 135,   severity: "high" },
    { label: "Blood Oxygen (SpO₂) — Critical Hypoxia",      sensor: "spo2",                value: 87,    severity: "critical" },
    { label: "Systolic Blood Pressure — Medium Drop",       sensor: "systolic_bp",         value: 85,    severity: "medium" },
  ],
};

const SEV_STYLE = {
  critical: { bg: "rgba(185,28,28,0.08)",   text: "#B91C1C", border: "rgba(185,28,28,0.3)" },
  high:     { bg: "rgba(194,65,12,0.08)",   text: "#C2410C", border: "rgba(194,65,12,0.3)" },
  medium:   { bg: "rgba(180,83,9,0.08)",   text: "#B45309", border: "rgba(180,83,9,0.3)" },
};

export default function ConfigTab({ scenario, onSimulate }) {
  const points = SCENARIO_POINTS[scenario] || SCENARIO_POINTS.powerplant;

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mb-8 max-w-[1700px] mx-auto">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
          Control & Testing
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
          Simulation & Hardware Config
        </h2>
        <p className="text-base font-bold text-slate-600 mt-1">
          Trigger real-time sensor anomalies into the backend to test the deterministic AI reasoning pipeline end-to-end.
        </p>
      </div>

      <div className="max-w-[1700px] mx-auto space-y-8">
        {/* Simulate panel */}
        <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xl font-black text-slate-900">Anomalous Sensor Injector</p>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Active Environment: <span className="font-black text-amber-800 uppercase px-2 py-0.5 bg-amber-100 rounded-md border border-amber-300">{scenario}</span>
              </p>
            </div>
            <span className="text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full">
              INTERACTIVE TESTING
            </span>
          </div>

          <div className="space-y-4">
            {points.map((p) => {
              const c = SEV_STYLE[p.severity] || SEV_STYLE.medium;
              return (
                <button
                  key={p.sensor}
                  id={`simulate-${p.sensor}`}
                  onClick={() => onSimulate(p.sensor, p.value)}
                  className="w-full flex items-center justify-between p-6 rounded-2xl border transition-all duration-200 text-left group hover:shadow-md hover:scale-[1.01]"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: c.text }}
                    />
                    <div>
                      <p className="text-base font-black text-slate-900">{p.label}</p>
                      <p className="text-xs font-bold font-mono text-slate-600 mt-0.5">PAYLOAD: {p.sensor} = {p.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-2xs"
                      style={{ color: c.text, background: `${c.text}18`, borderColor: c.border }}
                    >
                      {p.severity}
                    </span>
                    <span className="gold-btn px-5 py-2.5 rounded-xl text-xs font-black tracking-wider flex items-center gap-2">
                      Inject Payload
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 8h10M8 3l5 5-5 5" />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* System info */}
        <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95">
          <p className="text-xl font-black text-slate-900 mb-6">System Architecture Information</p>
          <div className="space-y-4">
            {[
              { label: "Backend API Server", value: "FastAPI + Uvicorn + SQLite · Port 8000" },
              { label: "Frontend Control Center", value: "React 19 + Vite 8 · Plus Jakarta Sans Design System" },
              { label: "AI Reasoning Pipeline", value: "Deterministic Policy Engine + DeepReason v3.2 Reasoning" },
              { label: "Active Rule Scenario", value: scenario === "hospital" ? "Hospital Medical Suite (HOS-001/002/003)" : "Industrial Power Plant (PP-001/002/003)" },
              { label: "Platform Version", value: "v0.4 · Sentinel Autonomous Orchestration Platform" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
