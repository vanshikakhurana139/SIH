import { useState, useEffect } from "react";
import { IconBolt } from "../icons";

export default function SystemUptime() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const start = Date.now() - 1000 * 60 * 60 * 24 * 4; // 4 days ago
    const interval = setInterval(() => {
      setUptime(Date.now() - start);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((uptime / 1000 / 60) % 60);

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold">
          System Uptime
        </p>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-positive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-positive"></span>
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-3xl font-extrabold text-fg tabular-nums leading-none">
          {days}<span className="text-sm text-fg-muted font-semibold ml-0.5">d</span>
        </span>
        <span className="font-display text-3xl font-extrabold text-fg tabular-nums leading-none">
          {String(hours).padStart(2, '0')}<span className="text-sm text-fg-muted font-semibold ml-0.5">h</span>
        </span>
        <span className="font-display text-3xl font-extrabold text-fg tabular-nums leading-none">
          {String(minutes).padStart(2, '0')}<span className="text-sm text-fg-muted font-semibold ml-0.5">m</span>
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-fg-muted">
        <IconBolt className="text-accent" width={14} height={14} />
        All clusters operating nominally
      </div>
    </div>
  );
}
