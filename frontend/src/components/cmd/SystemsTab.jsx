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
  const statusColor = isActive ? "#B91C1C" : "#15803D";
  const statusLabel = isActive ? "ALERT" : "NOMINAL";

  return (
    <div
      className="ivory-card p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm bg-white/95 transition-all duration-300 flex flex-col justify-between"
      style={isActive ? { borderColor: "rgba(185,28,28,0.4)", boxShadow: "0 0 0 3px rgba(185,28,28,0.1)" } : {}}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-black text-slate-900">{sys.name}</p>
          <span
            className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs"
            style={{ background: isActive ? "rgba(185,28,28,0.1)" : "rgba(21,128,61,0.1)", color: statusColor, borderColor: `${statusColor}40` }}
          >
            {statusLabel}
          </span>
        </div>

        {sys.nominal !== null ? (
          <>
            <div className="flex items-end gap-2 mb-4">
              <span
                className="font-sans text-3xl font-black text-slate-900 tabular-nums leading-none tracking-tight"
                style={{ color: isActive ? "#B91C1C" : "#0F172A" }}
              >
                {liveVal ?? sys.nominal}
              </span>
              <span className="text-sm font-bold text-slate-600 pb-1">{sys.unit}</span>
            </div>

            {/* Gauge bar */}
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((liveVal ?? sys.nominal) / (sys.crit * 1.1)) * 100)}%`,
                  background: isActive ? "#B91C1C" : "linear-gradient(90deg,#15803D,#22C55E)",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>0</span>
              <span>Warn: {sys.warn}</span>
              <span>Crit: {sys.crit}{sys.unit}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#15803D" }} />
            <span className="text-xs font-black text-emerald-900">Subsystem Fully Operational</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SystemsTab({ incidents, scenario = "powerplant" }) {
  const systems = scenario === "hospital" ? HOS_SYSTEMS : PP_SYSTEMS;
  const latest = [...(incidents || [])].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at))[0];
  const activeSource = latest?.status === "diagnosed" ? latest.source : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mb-8 max-w-[1700px] mx-auto">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
          Hardware Grid
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
          {scenario === "hospital" ? "Hospital Subsystem Grid" : "Power Plant Subsystem Grid"}
        </h2>
        <p className="text-base font-bold text-slate-600 mt-1">
          Real-time telemetry and operational diagnostics for all connected hardware modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1700px] mx-auto">
        {systems.map((sys) => (
          <SystemCard key={sys.source} sys={sys} activeSource={activeSource} incident={latest} />
        ))}
      </div>
    </div>
  );
}
