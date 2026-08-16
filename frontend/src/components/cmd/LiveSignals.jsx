const PP_SENSORS = [
  { key: "turbine_temp",        label: "Turbine Temperature", unit: "°C",   nominal: 82, warn: 90, crit: 95, min: 78, max: 96.2, freq: "500 Hz", stability: "99.2%" },
  { key: "generator_vibration", label: "Generator Vibration", unit: "mm/s", nominal: 2,  warn: 5,  crit: 7.5, min: 1.8, max: 8.1,  freq: "1 kHz",  stability: "98.7%" },
  { key: "coolant_pressure",    label: "Coolant Loop Pressure", unit: "psi",  nominal: 35, warn: 32, crit: 30, min: 24.8, max: 36.5, freq: "250 Hz", stability: "99.8%" },
  { key: "_power",              label: "Power Grid Output",   unit: "MW",   nominal: 99, warn: 95, crit: 88, min: 87.5, max: 102, freq: "100 Hz", stability: "99.9%" },
];

const HOS_SENSORS = [
  { key: "heart_rate",  label: "Cardiac Heart Rate", unit: "bpm",  nominal: 72,  warn: 100, crit: 130, min: 65, max: 135, freq: "250 Hz", stability: "98.5%" },
  { key: "spo2",        label: "Blood Oxygen (SpO₂)", unit: "%",    nominal: 98,  warn: 94,  crit: 90, min: 87, max: 99,   freq: "100 Hz", stability: "99.4%" },
  { key: "systolic_bp", label: "Systolic Blood Pressure", unit: "mmHg", nominal: 120, warn: 140, crit: 160, min: 85, max: 155, freq: "50 Hz",  stability: "99.1%" },
  { key: "_resp",       label: "Respiration Frequency", unit: "/min", nominal: 16,  warn: 24,  crit: 30, min: 14, max: 28,  freq: "50 Hz",  stability: "99.7%" },
];

function MiniSparkline({ color }) {
  const pts = [22, 20, 24, 18, 21, 19, 23, 17, 20, 16, 22, 19, 21];
  const max = Math.max(...pts), min = Math.min(...pts);
  const range = max - min || 1;
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * 120},${36 - ((v - min) / range) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 120 36" className="w-32 h-9" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LiveSignals({ incident, scenario = "powerplant" }) {
  const sensors = scenario === "hospital" ? HOS_SENSORS : PP_SENSORS;
  const activeKey = incident?.source;

  return (
    <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-100/90 text-blue-900 border border-blue-300 shadow-2xs">
              Live Sensor Telemetry
            </span>
            <span className="text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              4 ACTIVE CHANNELS
            </span>
          </div>
          <p className="text-sm font-bold text-slate-700 mt-1">
            Continuous real-time sensor streams and automated variance diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-emerald-50 border border-emerald-300 px-4.5 py-2.5 rounded-2xl">
          <span className="live-dot w-3 h-3 rounded-full" style={{ backgroundColor: "#15803D", display: "inline-block" }} />
          <span className="text-xs font-black text-emerald-900 tracking-wider">STREAMING @ 1,000 HZ</span>
        </div>
      </div>

      {/* Sensor List */}
      <div className="space-y-4">
        {sensors.map((s) => {
          const isActive = s.key === activeKey;
          const liveVal = isActive ? incident.sensor_value : null;
          const isCrit  = isActive && liveVal >= s.crit;
          const isWarn  = isActive && liveVal >= s.warn && !isCrit;
          const statusColor = isCrit ? "#B91C1C" : isWarn ? "#B45309" : "#15803D";

          return (
            <div
              key={s.key}
              className="p-5 sm:p-6 rounded-2xl transition-all border shadow-2xs"
              style={{
                background: isActive ? "rgba(184,150,62,0.08)" : "rgba(248,250,252,0.95)",
                borderColor: isActive ? "rgba(184,150,62,0.40)" : "rgba(203,213,225,0.9)",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Sensor Name + Badges */}
                <div className="flex items-center gap-4">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-black text-slate-900">{s.label}</span>
                      <span className="text-xs font-black text-slate-700 px-2.5 py-0.5 bg-slate-200/90 rounded-md border border-slate-300">
                        {s.freq}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      Nominal Target: <span className="text-slate-900 font-extrabold">{s.nominal}{s.unit}</span> • Range: <span className="text-slate-900 font-extrabold">{s.min}–{s.max}{s.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Graph + Live Value */}
                <div className="flex items-center gap-6">
                  <MiniSparkline color={isActive ? (isCrit ? "#B91C1C" : "#B45309") : "#B8963E"} />
                  <div className="text-right min-w-[120px]">
                    <span
                      className="font-sans text-2xl font-black tracking-tight"
                      style={{ color: isActive ? statusColor : "#0F172A" }}
                    >
                      {liveVal ?? s.nominal}
                      <span className="text-sm font-bold ml-1 text-slate-600">{s.unit}</span>
                    </span>
                    <p className="text-xs font-extrabold mt-0.5" style={{ color: statusColor }}>
                      {isActive
                        ? (isCrit ? "⚠ Critical Deviation" : isWarn ? "⚠ Warning Zone" : "● Active Reading")
                        : `● Nominal (${s.stability})`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Telemetry Metrics Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
        {[
          { label: "Signal Integrity", value: "99.85%", sub: "0 dropped packets" },
          { label: "Noise Variance", value: "0.012 σ", sub: "Bandpass filtered" },
          { label: "Sampling Rate", value: "1.2 kS/sec", sub: "Zero-latency buffer" },
          { label: "Anomaly Index", value: incident ? "HIGH (0.87)" : "NOMINAL (0.02)", sub: "AI model evaluation" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs uppercase tracking-wider font-black text-slate-500">{label}</p>
            <p className="text-lg font-black text-slate-900 mt-1">{value}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
