const STAGES = [
  { key: "sensor", label: "Sensor Data", x: 30, y: 70 },
  { key: "rule", label: "Rule Engine", x: 30, y: 20 },
  { key: "reason", label: "Reasoning", x: 110, y: 45 },
  { key: "human", label: "Human Review", x: 190, y: 20 },
  { key: "orch", label: "Orchestration", x: 190, y: 70 },
  { key: "health", label: "Health Check", x: 270, y: 45 },
];

const STATUS_TO_STAGE = {
  pending_rule_match: "rule",
  diagnosed: "reason",
  pending_approval: "human",
  approved: "orch",
  modified: "orch",
  rejected: "human",
  resolved: "health",
  failed: "health",
  undone: "health",
};

export default function PipelineDiagram({ incident }) {
  const activeKey = incident ? STATUS_TO_STAGE[incident.status] || "sensor" : null;

  return (
    <div className="dash-card px-5 py-5">
      <p className="dash-eyebrow mb-4">Pipeline Stepper</p>
      <svg viewBox="0 0 300 100" className="w-full h-[168px]">
        <line x1="30" y1="70" x2="30" y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="30" y1="20" x2="110" y2="45" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="30" y1="70" x2="110" y2="45" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="110" y1="45" x2="190" y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="110" y1="45" x2="190" y2="70" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="190" y1="20" x2="270" y2="45" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="190" y1="70" x2="270" y2="45" stroke="var(--color-border)" strokeWidth="1.5" />

        {STAGES.map((s) => {
          const isActive = s.key === activeKey;
          return (
            <g key={s.key}>
              <rect
                x={s.x - 12}
                y={s.y - 9}
                width="24"
                height="18"
                rx="4"
                fill={isActive ? "var(--color-accent)" : "var(--color-surface)"}
                stroke={isActive ? "var(--color-accent)" : "var(--color-border-strong)"}
                strokeWidth="1.5"
              />
              <rect
                x={s.x - 8}
                y={s.y - 5}
                width="16"
                height="3.2"
                rx="1"
                fill={isActive ? "white" : "var(--color-border-strong)"}
                opacity="0.9"
              />
              <rect
                x={s.x - 8}
                y={s.y + 1}
                width="10"
                height="3.2"
                rx="1"
                fill={isActive ? "white" : "var(--color-border-strong)"}
                opacity="0.7"
              />
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-2">
        {STAGES.map((s) => (
          <span
            key={s.key}
            className="text-[10px] font-mono truncate"
            style={{ color: s.key === activeKey ? "var(--color-accent)" : "var(--color-fg-subtle)" }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
