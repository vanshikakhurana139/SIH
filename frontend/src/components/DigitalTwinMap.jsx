const NODE_SETS = {
  powerplant: [
    { key: "turbine_temp", label: "Turbine", x: 60, y: 60 },
    { key: "coolant_pressure", label: "Coolant Loop", x: 190, y: 60 },
    { key: "generator_vibration", label: "Generator", x: 320, y: 60 },
  ],
  hospital: [
    { key: "heart_rate", label: "Cardiac Monitor", x: 60, y: 60 },
    { key: "spo2", label: "Pulse Ox", x: 190, y: 60 },
    { key: "systolic_bp", label: "BP Cuff", x: 320, y: 60 },
  ],
};

export default function DigitalTwinMap({ incident, scenario = "powerplant" }) {
  const nodes = NODE_SETS[scenario] || NODE_SETS.powerplant;
  const activeKey = incident?.source;

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold mb-3">Digital Twin</p>
      <svg viewBox="0 0 380 120" className="w-full h-28">
        <line x1="60" y1="60" x2="320" y2="60" stroke="var(--color-border)" strokeWidth="2" />
        {nodes.map((n) => {
          const isActive = n.key === activeKey;
          return (
            <g key={n.key}>
              <circle
                cx={n.x}
                cy={n.y}
                r={isActive ? 14 : 10}
                fill={isActive ? "var(--color-severity-critical)" : "var(--color-surface-raised)"}
                stroke={isActive ? "var(--color-severity-critical)" : "var(--color-border)"}
                strokeWidth="2"
              >
                {isActive && (
                  <animate attributeName="r" values="10;16;10" dur="1.2s" repeatCount="indefinite" />
                )}
              </circle>
              <text x={n.x} y={n.y + 30} textAnchor="middle" fontSize="10" fill="var(--color-fg-subtle)">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}