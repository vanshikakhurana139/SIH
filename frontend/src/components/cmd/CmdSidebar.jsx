function IconCommandCentre({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconIncidents({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconAlerts({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconSystems({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

function IconReports({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconConfig({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function CmdSidebar({ activeTab, onTabChange, incidents = [], onOpenOperator }) {
  const activeCount = incidents.filter((i) => i.status !== "resolved" && i.status !== "rejected" && i.status !== "undone").length || 2;
  const alertCount = Math.min(incidents.length || 6, 6);

  const sections = [
    {
      title: "OPERATIONS",
      items: [
        { id: "incidents", label: "Incidents", Icon: IconIncidents, badge: activeCount },
        { id: "alerts", label: "Alerts", Icon: IconAlerts, badge: alertCount },
      ],
    },
    {
      title: "ASSETS",
      items: [
        { id: "systems", label: "Systems", Icon: IconSystems },
      ],
    },
    {
      title: "INSIGHTS",
      items: [
        { id: "reports", label: "Reports", Icon: IconReports },
      ],
    },
    {
      title: "CONFIG",
      items: [
        { id: "config", label: "Configuration", Icon: IconConfig },
      ],
    },
  ];

  return (
    <aside
      className="cmd-sidebar p-3.5 flex flex-col justify-between select-none"
      role="navigation"
      aria-label="Command Center Navigation"
    >
      <div>
        {/* Top Highlight: Command Centre Card */}
        <button
          onClick={() => onTabChange("overview")}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all text-left mb-5 cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#F3EAD8] border-[#DECBA4] text-[#1E293B] shadow-2xs"
              : "bg-white/70 border-slate-200 text-slate-700 hover:bg-[#F3EAD8]/50"
          }`}
        >
          <span className="text-[#B8860B] shrink-0">
            <IconCommandCentre size={19} />
          </span>
          <span className="text-sm font-extrabold tracking-tight text-[#1E293B]">
            Command Centre
          </span>
        </button>

        {/* Navigation Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#475569]/80 px-3 mb-1.5">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ id, label, Icon, badge }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onTabChange(id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        active
                          ? "bg-[#EFE6D5] text-[#0F172A] font-black"
                          : "text-[#334155] hover:bg-black/5 font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 ${active ? "text-[#B8860B]" : "text-[#475569]"}`}>
                          <Icon size={17} />
                        </span>
                        <span className="text-sm truncate">
                          {label}
                        </span>
                      </div>

                      {badge !== undefined && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[#E8DEC8] text-[#4A3B2C] border border-[#D9CEB4]">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile / Operator Box */}
      <div className="pt-4 border-t border-slate-200/80">
        <button
          onClick={onOpenOperator}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-2xs bg-[#B8860B]">
              OP
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 leading-tight truncate">Operator</p>
              <p className="text-[10px] font-mono font-bold text-slate-500 truncate mt-0.5">Control Room 1</p>
            </div>
          </div>
          <span className="text-slate-400 group-hover:text-amber-700 transition-colors text-xs pr-1 font-bold">
            →
          </span>
        </button>
      </div>
    </aside>
  );
}
