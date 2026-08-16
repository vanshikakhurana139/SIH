import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ControlBar from "./components/ControlBar";
import StatCards from "./components/StatCards";
import ArchitectureStrip from "./components/ArchitectureStrip";
import ActiveIncidentCard from "./components/ActiveIncidentCard";
import RecentIncidentsTable from "./components/RecentIncidentsTable";
import TrustScorePanel from "./components/TrustScorePanel";
import DigitalTwinPanel from "./components/DigitalTwinPanel";
import HealthCheckPanel from "./components/HealthCheckPanel";
import DamageMeter from "./components/DamageMeter";
import AskSystemChat from "./components/AskSystemChat";
import SystemUptime from "./components/SystemUptime";
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
  loadScenario,
} from "./api/api";

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

  return (
    <div className="flex h-screen bg-ink overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header scenario={scenario} onSwitchScenario={handleSwitchScenario} />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-8">
            <ControlBar onSimulate={handleSimulate} scenario={scenario} onSwitchScenario={handleSwitchScenario} />
            
            {notice && (
              <div className="mb-6 px-4 py-3 rounded-xl dash-card text-[13px] text-fg-muted border-accent/20 bg-accent/5">{notice}</div>
            )}
            {loadError && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-severity-critical/10 border border-severity-critical/30 text-[13px] text-severity-critical">
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
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <StatCards stats={stats} />
                  </div>
                  <div className="w-[600px] shrink-0">
                    <ArchitectureStrip />
                  </div>
                </div>

                <div className="flex gap-6">
                  {/* Left Column (Main Content) */}
                  <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <ActiveIncidentCard
                      incident={activeIncident}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onModify={handleModify}
                      onUndo={handleUndo}
                    />
                    <RecentIncidentsTable incidents={incidents} />
                  </div>

                  {/* Right Sidebar */}
                  <div className="w-[360px] shrink-0 flex flex-col gap-6">
                    <TrustScorePanel trustScores={trustScores} />
                    <DigitalTwinPanel incident={activeIncident} scenario={scenario} />
                    <HealthCheckPanel healthCheck={healthCheck} />
                    <DamageMeter incident={activeIncident} />
                    <AskSystemChat incident={activeIncident} />
                    <SystemUptime />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
