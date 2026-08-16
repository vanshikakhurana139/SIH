import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import StatCards from "./components/StatCards";
import ArchitectureStrip from "./components/ArchitectureStrip";
import ActiveIncidentCard from "./components/ActiveIncidentCard";
import RecentIncidentsTable from "./components/RecentIncidentsTable";
import TrustScorePanel from "./components/TrustScorePanel";
import HealthCheckPanel from "./components/HealthCheckPanel";
import DamageMeter from "./components/DamageMeter";
import DigitalTwinMap from "./components/DigitalTwinMap";
import AskSystemChat from "./components/AskSystemChat";
import {
  getActiveIncident,
  getIncidents,
  getTrustScores,
  getHealthCheck,
  getStats,
  simulateIncident,
  approveAction,
  rejectAction,
  modifyAction,
  undoAction,
  enableAutopilot,
  loadScenario,
} from "./api/api";

const SCENARIO_POINTS = {
  powerplant: [
    { label: "Turbine Temp (high)", sensor: "turbine_temp", value: 96.2 },
    { label: "Coolant Pressure (medium)", sensor: "coolant_pressure", value: 25.0 },
    { label: "Generator Vibration (critical)", sensor: "generator_vibration", value: 8.1 },
  ],
  hospital: [
    { label: "Heart Rate (high)", sensor: "heart_rate", value: 135 },
    { label: "SpO2 (critical)", sensor: "spo2", value: 87 },
    { label: "Systolic BP (medium)", sensor: "systolic_bp", value: 85 },
  ],
};

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function TopBar({ onSimulate, scenario, onSwitchScenario }) {
  const time = useClock();
  const points = SCENARIO_POINTS[scenario];
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle">Operations</p>
        <h1 className="text-[17px] font-medium text-fg mt-0.5">
          {scenario === "hospital" ? "Hospital — Ward 4 Monitoring" : "Power Plant — Turbine Bay 3"}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          {["powerplant", "hospital"].map((s) => (
            <button
              key={s}
              onClick={() => onSwitchScenario(s)}
              className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                scenario === s ? "bg-accent text-white" : "text-fg-muted hover:text-fg"
              }`}
            >
              {s === "hospital" ? "Hospital" : "Power Plant"}
            </button>
          ))}
        </div>
        {points.map((p) => (
          <button
            key={p.sensor}
            onClick={() => onSimulate(p.sensor, p.value)}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium text-fg-muted border border-border hover:border-accent hover:text-fg transition-colors"
          >
            Simulate: {p.label}
          </button>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[12px] text-fg-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" style={{ boxShadow: "0 0 6px var(--color-positive)" }} />
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
  const [notice, setNotice] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [scenario, setScenario] = useState("powerplant");

  async function refreshAll() {
    try {
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
      setLoadError(null);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setLoadError("Could not reach the backend. Is uvicorn running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [inc, list, trust, health, statsData] = await Promise.all([
          getActiveIncident(),
          getIncidents(),
          getTrustScores(),
          getHealthCheck(),
          getStats(),
        ]);
        if (!ignore) {
          setActiveIncident(inc);
          setIncidents(list);
          setTrustScores(trust);
          setHealthCheck(health);
          setStats(statsData);
          setLoadError(null);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        if (!ignore) {
          setLoadError("Could not reach the backend. Is uvicorn running on port 8000?");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSwitchScenario(name) {
    await loadScenario(name);
    setScenario(name);
    setActiveIncident(null);
    setNotice(`Switched to ${name === "hospital" ? "Hospital" : "Power Plant"} scenario.`);
    refreshAll();
  }

  async function handleSimulate(sensor, value) {
    setNotice(null);
    try {
      const diagnosed = await simulateIncident(sensor, value);
      setActiveIncident(diagnosed);
      refreshAll();
    } catch (err) {
      setNotice(err.detail || "Reading was within safe range — no incident triggered.");
    }
  }

  async function handleApprove(incidentId, confirmed) {
    const updated = await approveAction(incidentId, confirmed);
    setActiveIncident(updated);
    refreshAll();
  }

  async function handleReject(incidentId) {
    const updated = await rejectAction(incidentId);
    setActiveIncident(updated);
    refreshAll();
  }

  async function handleModify(incidentId, text) {
    const updated = await modifyAction(incidentId, text);
    setActiveIncident(updated);
    refreshAll();
  }

  async function handleUndo(incidentId) {
    const updated = await undoAction(incidentId);
    setActiveIncident(updated);
    refreshAll();
  }

  async function handleEnableAutopilot(ruleId) {
    await enableAutopilot(ruleId);
    refreshAll();
  }
  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onSimulate={handleSimulate} scenario={scenario} onSwitchScenario={handleSwitchScenario} />
        <main className="flex-1 p-6 overflow-y-auto">
          {notice && (
            <div className="mb-4 px-4 py-2 rounded-md bg-surface-raised border border-border-subtle text-[13px] text-fg-muted">
              {notice}
            </div>
          )}
          {loadError && (
            <div className="mb-4 px-4 py-2 rounded-md bg-severity-critical/10 border border-severity-critical/30 text-[13px] text-severity-critical">
              {loadError}
            </div>
          )}
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
                  <ActiveIncidentCard
                    incident={activeIncident}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onModify={handleModify}
                    onUndo={handleUndo}
                  />
                  <RecentIncidentsTable incidents={incidents} />
                </div>
                <div className="space-y-6">
                  <TrustScorePanel trustScores={trustScores} onEnableAutopilot={handleEnableAutopilot} />
                  <HealthCheckPanel healthCheck={healthCheck} />
                  <DamageMeter incident={activeIncident} />
                  <DigitalTwinMap incident={activeIncident} scenario={scenario} />
                  <AskSystemChat incident={activeIncident} />
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