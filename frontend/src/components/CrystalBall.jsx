// Prop/file name kept as `crystalBall` for continuity with the rest of
// the codebase and schema — the on-screen label is "Projected Outcome"
// since the interface should describe what it does, not what it's called
// internally.

export default function CrystalBall({ crystalBall }) {
  if (!crystalBall) return null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle mb-2">
        Projected Outcome
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div
          className="bg-surface-raised border border-border-subtle border-l-2 rounded-md p-3"
          style={{ borderLeftColor: "var(--color-positive)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1"
            style={{ color: "var(--color-positive)" }}
          >
            If Approved
          </p>
          <p className="text-[13px] text-fg-muted leading-relaxed">{crystalBall.if_approved}</p>
        </div>
        <div
          className="bg-surface-raised border border-border-subtle border-l-2 rounded-md p-3"
          style={{ borderLeftColor: "var(--color-severity-critical)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1"
            style={{ color: "var(--color-severity-critical)" }}
          >
            If No Action
          </p>
          <p className="text-[13px] text-fg-muted leading-relaxed">{crystalBall.if_ignored}</p>
        </div>
      </div>
    </div>
  );
}