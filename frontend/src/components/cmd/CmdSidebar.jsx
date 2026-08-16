import { useState } from "react";

function IconOverview({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconIncidents({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}
function IconSystems({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9z" />
    </svg>
  );
}
function IconReports({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}
function IconAlerts({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
function IconConfig({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V14M4 10V3M12 21v-8M12 9V3M20 21v-4M20 13V3" />
      <circle cx="4" cy="12" r="2" />
      <circle cx="12" cy="11" r="2" />
      <circle cx="20" cy="15" r="2" />
    </svg>
  );
}

const NAV = [
  { id: "overview",   label: "Overview",   Icon: IconOverview },
  { id: "incidents",  label: "Incidents",  Icon: IconIncidents },
  { id: "systems",    label: "Systems",    Icon: IconSystems },
  { id: "reports",    label: "Reports",    Icon: IconReports },
  { id: "alerts",     label: "Alerts",     Icon: IconAlerts },
  { id: "config",     label: "Config",     Icon: IconConfig },
];

export default function CmdSidebar({ activeTab, onTabChange }) {
  const [hovered, setHovered] = useState(false);

  return (
    <aside
      className="cmd-sidebar relative bg-white/95 border-r border-slate-200 shadow-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="navigation"
      aria-label="Command Center Navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 mb-4 shrink-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md"
          style={{ background: "linear-gradient(135deg, #B8963E, #D4AF70)", minWidth: "40px" }}
        >
          S
        </div>
        <div
          className="whitespace-nowrap overflow-hidden"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s ease 0.05s" }}
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-900 leading-tight">Sentinel</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">Command Platform</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col flex-1 px-2.5 space-y-1">
        {NAV.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              id={`sidebar-${id}`}
              onClick={() => onTabChange(id)}
              title={label}
              className={`cmd-sidebar-item relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                active
                  ? "bg-amber-100/90 text-amber-900 font-black shadow-2xs border border-amber-300"
                  : "text-slate-700 hover:bg-slate-100 font-extrabold"
              }`}
            >
              {active && <span className="sidebar-indicator" />}
              <Icon size={20} />
              <span
                className="whitespace-nowrap overflow-hidden text-sm"
                style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s ease" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Version */}
      <div
        className="px-4 pb-5 whitespace-nowrap overflow-hidden"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s ease" }}
      >
        <p className="text-xs font-black font-mono text-slate-500">v0.4 · Sentinel AI</p>
      </div>
    </aside>
  );
}
