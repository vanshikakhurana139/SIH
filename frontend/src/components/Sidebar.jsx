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
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-positive"
            style={{ boxShadow: "0 0 8px var(--color-positive)" }}
          />
          <span className="font-mono font-semibold text-[15px] tracking-[0.04em] text-fg">
            SENTINEL
          </span>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
          Incident Orchestration
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
          Operate
        </p>
        <div className="space-y-0.5">
          {ACTIVE_ITEMS.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors ${
                i === 0
                  ? "bg-accent/10 text-fg border border-accent/20"
                  : "text-fg-muted border border-transparent hover:bg-surface-raised hover:text-fg"
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <p className="px-2 mt-6 mb-2 text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
          Administer
        </p>
        <div className="space-y-0.5">
          {DISABLED_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-fg-subtle/60 cursor-not-allowed select-none"
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