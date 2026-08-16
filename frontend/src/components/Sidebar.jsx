import { IconGrid, IconLog, IconSettings, IconUsers, IconSliders } from "../icons";

const ACTIVE_ITEMS = [
  { label: "Dashboard", icon: IconGrid },
  { label: "Audit Log", icon: IconLog },
];

const DISABLED_ITEMS = [
  { label: "Settings", icon: IconSettings },
  { label: "Users & Roles", icon: IconUsers },
  { label: "Configuration", icon: IconSliders },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-surface border-r border-border-subtle min-h-screen shrink-0 flex flex-col">
      <div className="px-5 py-6 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent text-white font-display font-extrabold text-[14px]">
            S
          </span>
          <span className="font-display font-extrabold text-[17px] tracking-[-0.01em] text-fg">
            SENTINEL
          </span>
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-fg-subtle font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" />
          Incident Orchestration
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.14em] text-fg-subtle font-bold">
          Operate
        </p>
        <div className="space-y-1">
          {ACTIVE_ITEMS.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                i === 0 ? "bg-accent text-white shadow-sm" : "text-fg-muted hover:bg-surface-raised hover:text-fg"
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <p className="px-2 mt-6 mb-2 text-[10px] uppercase tracking-[0.14em] text-fg-subtle font-bold">
          Administer
        </p>
        <div className="space-y-1">
          {DISABLED_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-fg-subtle/70 cursor-not-allowed select-none"
              title="Not available in this build"
            >
              <Icon />
              {label}
            </div>
          ))}
        </div>
      </nav>

      <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-fg-subtle">
        <span>build</span>
        <span className="text-fg-muted">0.4.0-demo</span>
      </div>
    </aside>
  );
}