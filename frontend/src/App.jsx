import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import StatCards from "./components/StatCards";
import ArchitectureStrip from "./components/ArchitectureStrip";
import ActiveIncidentCard from "./components/ActiveIncidentCard";
import RecentIncidentsTable from "./components/RecentIncidentsTable";
import TrustScorePanel from "./components/TrustScorePanel";
import HealthCheckPanel from "./components/HealthCheckPanel";
import {
  getActiveIncident,
  getIncidents,
  getTrustScores,
  getHealthCheck,
  getStats,
} from "./api/api";

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function TopBar() {
  const time = useClock();
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle">Operations</p>
        <h1 className="text-[17px] font-medium text-fg mt-0.5">Power Plant — Turbine Bay 3</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-fg-muted">
          <span
            className="w-1.5 h-1.5 rounded-full bg-positive"
            style={{ boxShadow: "0 0 6px var(--color-positive)" }}
          />
          Live
        </span>
        <span className="font-mono text-[12px] text-fg-subtle tabular-nums">
          {time.toLocaleTimeString([], { hour12: false })}
        </span>
      </div>
    </div>
  );
}

function App() {
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [trustScores, setTrustScores] = useState([]);
  const [healthCheck, setHealthCheck] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const [inc, list, trust, health, statsData] = await Promise.all([
        getActiveIncident(),
        getIncidents(),
        getTrustScores(),
        getHealthCheck(),
        getStats(),
      ]);
      setActiveIncident(inc);
      setIncidents(list);
      setTrustScores(trust);
      setHealthCheck(health);
      setStats(statsData);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-[13px] text-fg-subtle font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Loading dashboard…
            </div>
          ) : (
            <>
              <StatCards stats={stats} />
              <ArchitectureStrip />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <ActiveIncidentCard incident={activeIncident} />
                  <RecentIncidentsTable incidents={incidents} />
                </div>
                <div className="space-y-6">
                  <TrustScorePanel trustScores={trustScores} />
                  <HealthCheckPanel healthCheck={healthCheck} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;