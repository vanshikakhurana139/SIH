export default function CommandCenterEntry({ onEnter }) {
  return (
    <section
      id="entry"
      className="py-40 flex flex-col items-center justify-center text-center relative overflow-hidden"
      style={{ background: "var(--color-ivory)" }}
    >
      {/* Decorative background rings */}
      <div
        className="absolute rounded-full border border-border-subtle pointer-events-none"
        style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />
      <div
        className="absolute rounded-full border border-border-subtle pointer-events-none opacity-50"
        style={{ width: 900, height: 900, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />
      <div
        className="absolute rounded-full border border-border-subtle pointer-events-none opacity-25"
        style={{ width: 1200, height: 1200, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />

      <div className="relative z-10 max-w-[640px]">
        <p className="eyebrow mb-6">Operational Interface</p>
        <h2 className="font-display text-[56px] leading-[1.05] text-fg mb-6" style={{ letterSpacing: "-0.015em" }}>
          One system.<br />
          Every signal.<br />
          Every decision.
        </h2>
        <p className="text-[16px] text-fg-muted leading-relaxed mb-12">
          Enter the operational command center. Real data. Real incidents. Real intelligence.
        </p>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onEnter}
            id="entry-cta"
            className="gold-btn px-10 py-4 text-[13px] font-bold tracking-[0.06em] uppercase flex items-center gap-3"
          >
            Enter Command Center
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M8 3l5 5-5 5" />
            </svg>
          </button>
          <p className="text-[11px] text-fg-subtle font-mono">
            Live backend data · Real-time AI · Full workflow
          </p>
        </div>
      </div>
    </section>
  );
}
