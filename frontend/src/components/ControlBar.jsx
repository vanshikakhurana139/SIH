const SCENARIO_POINTS = {
  powerplant: [
    { label: "Turbine Temp (high)", sensor: "turbine_temp", value: 96.2 },
    { label: "Coolant Pressure (medium)", sensor: "coolant_pressure", value: 25.0 },
    { label: "Generator Vibration (critical)", sensor: "generator_vibration", value: 8.1 },
  ],
  hospital: [
    { label: "Heart Rate (high)", sensor: "heart_rate", value: 135 },
    { label: "SpO2 (critical)", sensor: "spo2", value: 87 },
    { label: "Systolic BP (medium)", sensor: "systolic_bp", value: 85 },
  ],
};

export default function ControlBar({ onSimulate, scenario, onSwitchScenario }) {
  const points = SCENARIO_POINTS[scenario];
  return (
    <div className="mb-6 bg-surface-raised border border-border-subtle rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-fg-subtle">
        Simulate Sensor
      </span>
      <div className="w-px h-4 bg-border-subtle" />
      {points.map((p) => (
        <button
          key={p.sensor}
          onClick={() => onSimulate(p.sensor, p.value)}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-fg-muted bg-surface border border-border hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
        >
          ⚡ {p.label}
        </button>
      ))}
    </div>
  );
}
