import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import Reveal from "./components/Reveal";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ControlBar from "./components/ControlBar";
import StatCards from "./components/StatCards";
import ArchitectureStrip, { statusToStep } from "./components/ArchitectureStrip";
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
  const [entered, setEntered] = useState(false);

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

  if (!entered) {
    return <Hero onEnter={() => setEntered(true)} />;
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
                    <Reveal delay={0}>
                      <StatCards stats={stats} />
                    </Reveal>
                  </div>
                  <div className="w-[600px] shrink-0">
                    <Reveal delay={80}>
                      <ArchitectureStrip activeStep={statusToStep(activeIncident?.status)} />
                    </Reveal>
                  </div>
                </div>

                <div className="flex gap-6">
                  {/* Left Column (Main Content) */}
                  <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <Reveal delay={120}>
                      <ActiveIncidentCard
                        incident={activeIncident}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onModify={handleModify}
                        onUndo={handleUndo}
                      />
                    </Reveal>
                    <Reveal delay={180}>
                      <RecentIncidentsTable incidents={incidents} />
                    </Reveal>
                  </div>

                  {/* Right Sidebar */}
                  <div className="w-[360px] shrink-0 flex flex-col gap-6">
                    <Reveal delay={160}>
                      <TrustScorePanel trustScores={trustScores} />
                    </Reveal>
                    <Reveal delay={220}>
                      <DigitalTwinPanel incident={activeIncident} scenario={scenario} />
                    </Reveal>
                    <Reveal delay={280}>
                      <HealthCheckPanel healthCheck={healthCheck} />
                    </Reveal>
                    <Reveal delay={340}>
                      <DamageMeter incident={activeIncident} />
                    </Reveal>
                    <Reveal delay={400}>
                      <AskSystemChat incident={activeIncident} />
                    </Reveal>
                    <Reveal delay={460}>
                      <SystemUptime />
                    </Reveal>
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
