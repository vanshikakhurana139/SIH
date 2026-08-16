const PP_SENSORS = [
  { key: "turbine_temp",        label: "Temperature",   unit: "°C",   nominal: 82, warn: 90, crit: 95 },
  { key: "generator_vibration", label: "Vibration",     unit: "mm/s", nominal: 2,  warn: 5,  crit: 7.5 },
  { key: "coolant_pressure",    label: "Pressure",      unit: "psi",  nominal: 35, warn: 32, crit: 30 },
  { key: "_power",              label: "Power Output",  unit: "MW",   nominal: 99, warn: 95, crit: 88 },
];

const HOS_SENSORS = [
  { key: "heart_rate",  label: "Heart Rate",    unit: "bpm",  nominal: 72,  warn: 100, crit: 130 },
  { key: "spo2",        label: "SpO₂",          unit: "%",    nominal: 98,  warn: 94,  crit: 90 },
  { key: "systolic_bp", label: "Systolic BP",   unit: "mmHg", nominal: 120, warn: 140, crit: 160 },
  { key: "_resp",       label: "Respiration",   unit: "/min", nominal: 16,  warn: 24,  crit: 30 },
];

function MiniSparkline({ color }) {
  const pts = [22, 20, 24, 18, 21, 19, 23, 17, 20, 16];
  const max = Math.max(...pts), min = Math.min(...pts);
  const range = max - min || 1;
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * 80},${30 - ((v - min) / range) * 22}`).join(" ");
  return (
    <svg viewBox="0 0 80 30" className="w-16 h-6" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LiveSignals({ incident, scenario = "powerplant" }) {
  const sensors = scenario === "hospital" ? HOS_SENSORS : PP_SENSORS;
  const activeKey = incident?.source;

  return (
    <div className="ivory-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="dash-eyebrow">Live Signals</p>
        <div className="flex items-center gap-1.5">
          <span className="live-dot w-2 h-2 rounded-full" style={{ backgroundColor: "#2D7A5A", display: "inline-block" }} />
          <span className="text-[10px] font-mono font-bold text-positive" style={{ color: "#2D7A5A" }}>STREAMING</span>
        </div>
      </div>

      <div className="space-y-2">
        {sensors.map((s) => {
          const isActive = s.key === activeKey;
          const liveVal = isActive ? incident.sensor_value : null;
          const isCrit  = isActive && liveVal >= s.crit;
          const isWarn  = isActive && liveVal >= s.warn && !isCrit;
          const statusColor = isCrit ? "#B84040" : isWarn ? "#B07B2E" : "#2D7A5A";

          return (
            <div
              key={s.key}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-all"
              style={{
                background: isActive ? "rgba(184,150,62,0.05)" : "rgba(26,22,18,0.02)",
                border: `1px solid ${isActive ? "rgba(184,150,62,0.18)" : "rgba(180,160,120,0.10)"}`,
              }}
            >
              {/* Label + status */}
              <div className="flex items-center gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="text-[12px] font-medium text-fg-muted">{s.label}</span>
              </div>

              {/* Value */}
              <div className="flex items-center gap-4">
                <MiniSparkline color={isActive ? (isCrit ? "#B84040" : "#B07B2E") : "#B8963E"} />
                <div className="text-right min-w-[70px]">
                  <span
                    className="font-mono text-[14px] font-bold"
                    style={{ color: isActive ? statusColor : "var(--color-fg-muted)" }}
                  >
                    {liveVal ?? s.nominal}
                    <span className="text-[10px] font-normal ml-0.5" style={{ color: "var(--color-fg-subtle)" }}>{s.unit}</span>
                  </span>
                  {isActive && (
                    <p className="text-[9px] font-mono" style={{ color: statusColor }}>
                      {isCrit ? "Above Threshold" : isWarn ? "Warning Zone" : "Nominal"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
