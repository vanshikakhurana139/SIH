const SEV_COLOR = {
  critical: { text: "#B91C1C", bg: "rgba(185,28,28,0.1)", border: "rgba(185,28,28,0.3)" },
  high:     { text: "#C2410C", bg: "rgba(194,65,12,0.1)", border: "rgba(194,65,12,0.3)" },
  medium:   { text: "#B45309", bg: "rgba(180,83,9,0.1)", border: "rgba(180,83,9,0.3)" },
  low:      { text: "#1D4ED8", bg: "rgba(29,78,216,0.1)", border: "rgba(29,78,216,0.3)" },
};

function AlertRow({ incident }) {
  const c = SEV_COLOR[incident.severity] || SEV_COLOR.medium;
  const isActive = incident.status === "diagnosed" || incident.status === "pending_approval";
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-5 border-t border-slate-200 hover:bg-slate-50/80 transition-colors">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: c.text, animation: isActive ? "pulse-ring 1.8s ease-out infinite" : "none" }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span
              className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs"
              style={{ background: c.bg, color: c.text, borderColor: c.border }}
            >
              {incident.severity?.toUpperCase()} SEVERITY
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">RULE: {incident.rule_id}</span>
          </div>
          <p className="text-base font-black text-slate-900 truncate">
            {incident.source?.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())} — Critical Threshold Exceeded
          </p>
          <p className="text-xs font-bold text-slate-600 mt-1 truncate max-w-3xl">{incident.evidence}</p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-black font-sans text-slate-700 tabular-nums">
          {new Date(incident.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
        <span
          className={`text-xs font-black px-3 py-1 rounded-full border inline-block mt-1 ${
            isActive ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-emerald-100 text-emerald-900 border-emerald-300"
          }`}
        >
          {isActive ? "● Active Alert" : "✓ Resolved"}
        </span>
      </div>
    </div>
  );
}

export default function AlertsTab({ incidents }) {
  const sorted = [...(incidents || [])].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));
  const active   = sorted.filter((i) => i.status === "diagnosed" || i.status === "pending_approval");
  const resolved = sorted.filter((i) => i.status !== "diagnosed" && i.status !== "pending_approval");

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mb-8 max-w-[1700px] mx-auto">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
          Safety Notifications
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
          Realtime Alert Feed
        </h2>
        <p className="text-base font-bold text-slate-600 mt-1">
          {active.length > 0
            ? `${active.length} active high-priority alert${active.length > 1 ? "s" : ""} requiring operator sign-off.`
            : "No active alerts. All monitored subsystems are nominal."}
        </p>
      </div>

      <div className="max-w-[1700px] mx-auto space-y-8">
        {/* Active alerts */}
        {active.length > 0 && (
          <div className="ivory-card rounded-3xl border border-rose-300 shadow-sm bg-white/95 overflow-hidden">
            <div className="px-8 py-5 border-b border-rose-200 flex items-center justify-between bg-rose-50/80">
              <div className="flex items-center gap-3">
                <span className="live-dot w-3 h-3 rounded-full" style={{ backgroundColor: "#B91C1C", display: "inline-block" }} />
                <span className="text-xs font-black uppercase tracking-widest text-rose-900">Active High-Priority Alerts</span>
              </div>
              <span className="text-xs font-black text-rose-900 bg-white border border-rose-300 px-3.5 py-1 rounded-full">
                {active.length} PENDING
              </span>
            </div>
            {active.map((inc) => <AlertRow key={inc.id} incident={inc} />)}
          </div>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <div className="ivory-card rounded-3xl border border-slate-200 shadow-sm bg-white/95 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#15803D", display: "inline-block" }} />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-900">Resolved & Archived Alerts</span>
              </div>
              <span className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-3.5 py-1 rounded-full">
                {resolved.length} CLOSED
              </span>
            </div>
            {resolved.slice(0, 8).map((inc) => <AlertRow key={inc.id} incident={inc} />)}
          </div>
        )}

        {sorted.length === 0 && (
          <div className="ivory-card p-12 sm:p-16 text-center rounded-3xl border border-slate-200 shadow-sm bg-white/95">
            <span className="text-4xl">🟢</span>
            <h3 className="text-xl font-black text-slate-900 mt-3">No Alerts Recorded</h3>
            <p className="text-sm font-bold text-slate-600 mt-1 max-w-md mx-auto">
              Simulate a sensor reading deviation from the Config tab to trigger your first real-time alert notification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
