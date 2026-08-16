const PP_SYSTEMS = [
  { name: "Turbine Unit 03",    source: "turbine_temp",        unit: "°C",   nominal: 82, warn: 90, crit: 95,  status: "nominal" },
  { name: "Generator Assembly", source: "generator_vibration", unit: "mm/s", nominal: 2.1, warn: 5, crit: 7.5, status: "nominal" },
  { name: "Coolant System",     source: "coolant_pressure",    unit: "psi",  nominal: 36, warn: 32, crit: 30,  status: "nominal" },
  { name: "Grid Tie Line",      source: "_grid",               unit: "MW",   nominal: 98, warn: 90, crit: 82,  status: "nominal" },
  { name: "Control Room",       source: "_control",            unit: "",     nominal: null, warn: null, crit: null, status: "nominal" },
  { name: "Steam Generator",    source: "_steam",              unit: "bar",  nominal: 7.2, warn: 8, crit: 9.5, status: "nominal" },
];

const HOS_SYSTEMS = [
  { name: "Cardiac ICU",        source: "heart_rate",  unit: "bpm",  nominal: 72,  warn: 100, crit: 130, status: "nominal" },
  { name: "Pulse Oximetry",     source: "spo2",        unit: "%",    nominal: 98,  warn: 94,  crit: 90,  status: "nominal" },
  { name: "Blood Pressure Mon.", source: "systolic_bp", unit: "mmHg", nominal: 120, warn: 140, crit: 160, status: "nominal" },
  { name: "Emergency Dept.",    source: "_er",         unit: "",     nominal: null, warn: null, crit: null, status: "nominal" },
  { name: "Radiology Suite",    source: "_radiology",  unit: "",     nominal: null, warn: null, crit: null, status: "nominal" },
  { name: "ICU Bed Monitor",    source: "_icu",        unit: "",     nominal: null, warn: null, crit: null, status: "nominal" },
];

function SystemCard({ sys, activeSource, incident }) {
  const isActive = sys.source === activeSource;
  const liveVal = isActive ? incident?.sensor_value : null;
  const statusColor = isActive ? "#B84040" : "#2D7A5A";
  const statusLabel = isActive ? "ALERT" : "NOMINAL";

  return (
    <div
      className="ivory-card p-5 transition-all duration-300"
      style={isActive ? { borderColor: "rgba(184,64,64,0.35)", boxShadow: "0 0 0 2px rgba(184,64,64,0.08)" } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] font-bold text-fg">{sys.name}</p>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
          style={{ background: `${statusColor}10`, color: statusColor, borderColor: `${statusColor}28` }}
        >
          {statusLabel}
        </span>
      </div>

      {sys.nominal !== null ? (
        <>
          <div className="flex items-end gap-2 mb-3">
            <span className="font-mono text-[26px] font-black text-fg tabular-nums leading-none" style={{ color: isActive ? "#B84040" : undefined }}>
              {liveVal ?? sys.nominal}
            </span>
            <span className="text-[12px] text-fg-subtle pb-1">{sys.unit}</span>
          </div>
          {/* Mini gauge */}
          <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, ((liveVal ?? sys.nominal) / (sys.crit * 1.1)) * 100)}%`,
                background: isActive ? "#B84040" : "linear-gradient(90deg,#2D7A5A,#3DA870)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[9px] font-mono text-fg-subtle">
            <span>0</span>
            <span>Warn {sys.warn}</span>
            <span>Crit {sys.crit}{sys.unit}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2D7A5A" }} />
          <span className="text-[11px] text-positive font-medium" style={{ color: "#2D7A5A" }}>Operational</span>
        </div>
      )}
    </div>
  );
}

export default function SystemsTab({ incidents, scenario = "powerplant" }) {
  const systems = scenario === "hospital" ? HOS_SYSTEMS : PP_SYSTEMS;
  const latest = [...(incidents || [])].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at))[0];
  const activeSource = latest?.status === "diagnosed" ? latest.source : null;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <p className="dash-eyebrow mb-1">Systems</p>
        <h2 className="font-display text-[32px] text-fg" style={{ letterSpacing: "-0.01em" }}>
          {scenario === "hospital" ? "Hospital Systems" : "Power Plant Systems"}
        </h2>
        <p className="text-[13px] text-fg-muted mt-1">Real-time telemetry and status for all monitored subsystems.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {systems.map((sys) => (
          <SystemCard key={sys.source} sys={sys} activeSource={activeSource} incident={latest} />
        ))}
      </div>
    </div>
  );
}
