import { IconHeart, IconLungs, IconStethoscope, IconActivity } from "../icons";

const NODE_SETS = {
  powerplant: [
    { key: "turbine_temp", label: "Turbine", icon: IconActivity, unit: "°C" },
    { key: "coolant_pressure", label: "Coolant", icon: IconLungs, unit: "psi" },
    { key: "generator_vibration", label: "Generator", icon: IconStethoscope, unit: "mm/s" },
    { key: "_aux", label: "Grid Load", icon: IconHeart, unit: "%" },
  ],
  hospital: [
    { key: "heart_rate", label: "Cardiac", icon: IconHeart, unit: "bpm" },
    { key: "spo2", label: "Pulse Ox", icon: IconLungs, unit: "%" },
    { key: "systolic_bp", label: "BP Cuff", icon: IconStethoscope, unit: "mmHg" },
    { key: "_aux", label: "Respiration", icon: IconActivity, unit: "/min" },
  ],
};

export default function DigitalTwinPanel({ incident, scenario = "powerplant" }) {
  const nodes = NODE_SETS[scenario] || NODE_SETS.powerplant;
  const activeKey = incident?.source;

  return (
    <div className="dash-card px-5 py-5">
      <p className="dash-eyebrow mb-4">Digital Twin</p>
      <div className="grid grid-cols-2 gap-3">
        {nodes.map((n) => {
          const isActive = n.key === activeKey;
          const Icon = n.icon;
          const reading = isActive ? incident.sensor_value : "—";
          return (
            <div
              key={n.key}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 border"
              style={{
                borderColor: isActive ? "var(--color-severity-critical)" : "var(--color-border-subtle)",
                backgroundColor: isActive
                  ? "color-mix(in srgb, var(--color-severity-critical) 6%, transparent)"
                  : "var(--color-surface-raised)",
              }}
            >
              <span style={{ color: isActive ? "var(--color-severity-critical)" : "var(--color-fg-subtle)" }}>
                <Icon width={22} height={22} />
              </span>
              <span className="font-mono text-[13px] font-semibold text-fg tabular-nums">
                {reading}
                {isActive && <span className="text-[10px] text-fg-subtle ml-0.5">{n.unit}</span>}
              </span>
              <span className="text-[10px] uppercase tracking-[0.05em] text-fg-subtle font-semibold">
                {n.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
