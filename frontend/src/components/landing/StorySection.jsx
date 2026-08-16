import { useRef, useEffect, useState } from "react";

const STEPS = [
  {
    id: "signal",
    label: "Signal",
    eyebrow: "Step 01",
    heading: "Raw data becomes meaningful signal.",
    body: "Thousands of sensor readings per minute. Temperature, vibration, pressure, power output. Sentinel ingests them all and filters for what matters.",
    metrics: [
      { label: "Turbine Temp", value: "84°C", unit: "", status: "normal" },
      { label: "Vibration", value: "2.4", unit: "mm/s", status: "normal" },
      { label: "Pressure", value: "7.4", unit: "bar", status: "normal" },
      { label: "Power Output", value: "98.7", unit: "MW", status: "normal" },
    ],
    visual: "📡",
  },
  {
    id: "detection",
    label: "Detection",
    eyebrow: "Step 02",
    heading: "Anomalies are caught in milliseconds.",
    body: "The rule engine compares every reading against learned thresholds. When vibration spikes to 8.1 mm/s — 8% above critical threshold — detection fires instantly.",
    metrics: [
      { label: "Turbine Temp", value: "84°C", unit: "", status: "normal" },
      { label: "Vibration", value: "8.1", unit: "mm/s", status: "critical" },
      { label: "Pressure", value: "7.4", unit: "bar", status: "normal" },
      { label: "Power Output", value: "-8.7", unit: "%", status: "warning" },
    ],
    visual: "🔍",
  },
  {
    id: "understanding",
    label: "Understanding",
    eyebrow: "Step 03",
    heading: "Pattern recognition surfaces the root cause.",
    body: "Multiple correlated deviations. The reasoning engine identifies a probable turbine bearing failure with 96.4% confidence. Not just an alert — an explanation.",
    metrics: [
      { label: "Confidence", value: "96.4", unit: "%", status: "gold" },
      { label: "Rule Match", value: "PP-002", unit: "", status: "gold" },
      { label: "Correlated", value: "4", unit: "signals", status: "normal" },
      { label: "Escalation", value: "82", unit: "%", status: "warning" },
    ],
    visual: "🧠",
  },
  {
    id: "decision",
    label: "Decision",
    eyebrow: "Step 04",
    heading: "A precise recommendation, not just an alert.",
    body: "Reduce turbine load by 35% and initiate inspection protocol. Risk reduction: 82%. Recovery window: 12–18 minutes. Estimated exposure avoided: $8,400.",
    metrics: [
      { label: "Risk Reduction", value: "82", unit: "%", status: "positive" },
      { label: "Recovery", value: "12–18", unit: "min", status: "positive" },
      { label: "Exposure Saved", value: "$8,400", unit: "", status: "positive" },
      { label: "Reversible", value: "Yes", unit: "", status: "positive" },
    ],
    visual: "⚡",
  },
  {
    id: "action",
    label: "Action",
    eyebrow: "Step 05",
    heading: "Human approval. AI execution.",
    body: "The operator reviews the recommendation and approves. The system executes with full audit logging. Every action, every decision, immutably recorded.",
    metrics: [
      { label: "Status", value: "Executing", unit: "", status: "gold" },
      { label: "Approved By", value: "Admin", unit: "", status: "normal" },
      { label: "Audit Hash", value: "Verified", unit: "✓", status: "positive" },
      { label: "Reversible", value: "Auto", unit: "rollback", status: "positive" },
    ],
    visual: "✅",
  },
  {
    id: "outcome",
    label: "Outcome",
    eyebrow: "Step 06",
    heading: "Verified resolution. System restored.",
    body: "Post-action health checks confirm system stabilization. 38 checks resolved. Trust score updated. The loop is closed — automatically.",
    metrics: [
      { label: "Status", value: "Resolved", unit: "", status: "positive" },
      { label: "Health Checks", value: "64/100", unit: "", status: "positive" },
      { label: "Downtime", value: "0", unit: "min", status: "positive" },
      { label: "Trust Score", value: "+0.12", unit: "", status: "positive" },
    ],
    visual: "🎯",
  },
];

function MetricChip({ label, value, unit, status }) {
  const colors = {
    normal: { bg: "rgba(26,22,18,0.04)", text: "#5C5043", border: "rgba(180,160,120,0.15)" },
    critical: { bg: "rgba(184,64,64,0.08)", text: "#B84040", border: "rgba(184,64,64,0.22)" },
    warning: { bg: "rgba(176,123,46,0.08)", text: "#B07B2E", border: "rgba(176,123,46,0.22)" },
    gold: { bg: "rgba(184,150,62,0.08)", text: "#B8963E", border: "rgba(184,150,62,0.22)" },
    positive: { bg: "rgba(45,122,90,0.08)", text: "#2D7A5A", border: "rgba(45,122,90,0.22)" },
  };
  const c = colors[status] || colors.normal;
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--color-fg-subtle)" }}>{label}</p>
      <p className="font-mono text-[15px] font-bold" style={{ color: c.text }}>
        {value}{unit && <span className="text-[11px] ml-1 font-normal" style={{ color: "var(--color-fg-subtle)" }}>{unit}</span>}
      </p>
    </div>
  );
}

function StoryStep({ step, index, isVisible }) {
  const isEven = index % 2 === 0;
  return (
    <div
      className={`story-section flex ${isEven ? "flex-row" : "flex-row-reverse"} items-center gap-16 reveal ${isVisible ? "reveal-visible" : ""}`}
      style={{ transitionDelay: "0.1s" }}
    >
      {/* Text side */}
      <div className="flex-1 max-w-[480px]">
        <p className="eyebrow mb-3">{step.eyebrow}</p>
        <h3 className="font-display text-[38px] leading-tight text-fg mb-4" style={{ letterSpacing: "-0.01em" }}>
          {step.heading}
        </h3>
        <p className="text-[15px] text-fg-muted leading-relaxed mb-8">{step.body}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle bg-white/70 text-[12px] font-bold text-fg-muted">
          <span className="w-2 h-2 rounded-full" style={{ background: step.id === "detection" ? "#B84040" : step.id === "outcome" ? "#2D7A5A" : "#B8963E" }} />
          {step.label}
        </div>
      </div>

      {/* Visual side */}
      <div className="flex-1 max-w-[520px]">
        <div className="ivory-card p-8">
          <div className="text-[48px] mb-6 text-center">{step.visual}</div>
          <div className="grid grid-cols-2 gap-3">
            {step.metrics.map((m) => (
              <MetricChip key={m.label} {...m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorySection() {
  const refs = useRef([]);
  const [visible, setVisible] = useState({});

  useEffect(() => {
    const observers = refs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible((v) => ({ ...v, [i]: true }));
          }
        },
        { threshold: 0.2 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section id="story" className="py-24 bg-ivory-dark" style={{ background: "var(--color-ivory-dark)" }}>
      <div className="max-w-[1100px] mx-auto px-8">
        <div className="text-center mb-20">
          <p className="eyebrow mb-4">The Intelligence Loop</p>
          <h2 className="font-display text-[48px] text-fg leading-tight" style={{ letterSpacing: "-0.01em" }}>
            From first signal<br />to verified outcome.
          </h2>
        </div>

        {/* Process connector */}
        <div className="flex items-center justify-center gap-2 mb-20 overflow-x-auto py-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border-subtle text-[10px] font-bold uppercase tracking-wider text-fg-subtle">
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <svg viewBox="0 0 16 8" width="20" height="10" fill="none">
                  <path d="M0 4h12M9 1l3 3-3 3" stroke="rgba(180,160,120,0.4)" strokeWidth="1.2" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-32">
          {STEPS.map((step, i) => (
            <div key={step.id} ref={(el) => (refs.current[i] = el)}>
              <StoryStep step={step} index={i} isVisible={!!visible[i]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
