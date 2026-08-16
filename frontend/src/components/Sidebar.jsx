import { IconGrid, IconLog, IconSettings, IconUsers, IconSliders, IconAlertTriangle, IconBolt } from "../icons";

const NAV = [
  { label: "Overview",     icon: IconGrid,          active: true  },
  { label: "Incidents",    icon: IconAlertTriangle,  active: false },
  { label: "Systems",      icon: IconSettings,       active: false },
  { label: "AI Models",    icon: IconBolt,           active: false },
  { label: "Digital Twin", icon: IconUsers,          active: false },
  { label: "Reports",      icon: IconLog,            active: false },
  { label: "Alerts",       icon: IconSliders,        active: false },
  { label: "Config",       icon: IconSettings,       active: false },
];

export default function Sidebar() {
  return (
    <aside className="sidebar-glow w-[72px] min-h-screen shrink-0 flex flex-col items-center py-4 gap-1 z-20">
      {/* Logo */}
      <div
        className="flex items-center justify-center w-11 h-11 rounded-2xl text-white font-display font-extrabold text-[16px] mb-5 shadow-lg"
        style={{ background: "linear-gradient(135deg, #3B5BDB, #748FFC)", boxShadow: "0 4px 16px rgba(59,91,219,0.40)" }}
      >
        S
      </div>

      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            title={label}
            className={`relative flex flex-col items-center justify-center w-full py-2.5 rounded-[14px] transition-all duration-200 group ${
              active
                ? "text-accent"
                : "text-fg-subtle hover:text-fg-muted hover:bg-white/50"
            }`}
            style={active ? {
              background: "linear-gradient(135deg, rgba(59,91,219,0.12), rgba(116,143,252,0.08))",
              boxShadow: "0 2px 8px rgba(59,91,219,0.10)"
            } : {}}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                style={{ background: "linear-gradient(180deg, #3B5BDB, #748FFC)" }}
              />
            )}
            <Icon width={18} height={18} />
            <span className="text-[8.5px] font-bold mt-1 leading-tight tracking-wide">{label}</span>
          </button>
        ))}
      </nav>

      <div className="text-[8px] font-mono text-fg-subtle/40 text-center pb-2">v0.4</div>
    </aside>
  );
}