import { useState, useEffect, useCallback } from "react";
import {
  simulateIncident,
  getActiveIncident,
  getIncidents,
  approveAction,
  rejectAction,
  modifyAction,
  undoAction,
  getTrustScores,
  getHealthCheck,
  getStats,
  loadScenario,
  enableAutopilot,
} from "./api/api";

// Landing page
import LandingPage from "./components/landing/LandingPage";

// Command center shell
import CmdHeader from "./components/cmd/CmdHeader";
import CmdSidebar from "./components/cmd/CmdSidebar";
import ProcessIndicator from "./components/cmd/ProcessIndicator";
import { statusToStep } from "./utils/statusUtils";

// Tabs
import OverviewTab   from "./components/cmd/OverviewTab";
import IncidentsTab  from "./components/cmd/IncidentsTab";
import SystemsTab    from "./components/cmd/SystemsTab";
import ReportsTab    from "./components/cmd/ReportsTab";
import AlertsTab     from "./components/cmd/AlertsTab";
import ConfigTab     from "./components/cmd/ConfigTab";

const POLL_MS = 4000;

export default function App() {
  // ─── Navigation state ───────────────────────────────
  const [view, setView]           = useState("landing"); // "landing" | "command"
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Scenario ───────────────────────────────────────
  const [scenario, setScenario]   = useState("powerplant");

  // ─── Data state ─────────────────────────────────────
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidents, setIncidents]           = useState([]);
  const [trustScores, setTrustScores]       = useState([]);
  const [healthCheck, setHealthCheck]       = useState(null);
  const [stats, setStats]                   = useState(null);

  // ─── UI state ───────────────────────────────────────
  const [notice, setNotice]   = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Polling ────────────────────────────────────────
  const refreshAll = useCallback(async () => {
    try {
      const [inc, all, trust, hc, st] = await Promise.all([
        getActiveIncident(),
        getIncidents(),
        getTrustScores(),
        getHealthCheck(),
        getStats(),
      ]);
      setActiveIncident(inc);
      setIncidents(all || []);
      setTrustScores(trust || []);
      setHealthCheck(hc || null);
      setStats(st || null);
      setLoadError("");
    } catch {
      setLoadError("⚠ Unable to reach backend. Make sure the FastAPI server is running on port 8000.");
    }
  }, []);

  useEffect(() => {
    const fetchInitial = async () => {
      await refreshAll();
    };
    fetchInitial();
    const t = setInterval(refreshAll, POLL_MS);
    return () => clearInterval(t);
  }, [refreshAll]);

  // ─── Handlers ───────────────────────────────────────
  function flash(msg) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4000);
  }

  async function handleSimulate(sensor, value) {
    setLoading(true);
    try {
      await simulateIncident(sensor, value);
      await refreshAll();
      flash(`✓ Sensor ${sensor} injected at ${value}. AI diagnosis complete.`);
      setActiveTab("overview");
    } catch (e) {
      flash(`⚠ ${e.detail || "Simulation failed — is the backend running?"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitchScenario(name) {
    if (name === scenario) return;
    setLoading(true);
    try {
      await loadScenario(name);
      setScenario(name);
      await refreshAll();
      flash(`✓ Switched to ${name === "hospital" ? "Hospital" : "Power Plant"} scenario.`);
    } catch (e) {
      flash(`⚠ ${e.detail || "Scenario switch failed."}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(incidentId, confirmed = false) {
    try {
      await approveAction(incidentId, confirmed);
      await refreshAll();
      flash("✓ Action approved and executed.");
    } catch (e) {
      flash(`⚠ ${e.detail || "Approval failed."}`);
    }
  }

  async function handleReject(incidentId) {
    try {
      await rejectAction(incidentId);
      await refreshAll();
      flash("Action rejected.");
    } catch (e) {
      flash(`⚠ ${e.detail || "Rejection failed."}`);
    }
  }

  async function handleModify(incidentId, newAction) {
    try {
      await modifyAction(incidentId, newAction);
      await refreshAll();
      flash("✓ Action modified and re-queued.");
    } catch (e) {
      flash(`⚠ ${e.detail || "Modify failed."}`);
    }
  }

  async function handleUndo(incidentId) {
    try {
      await undoAction(incidentId);
      await refreshAll();
      flash("✓ Action rolled back successfully.");
    } catch (e) {
      flash(`⚠ ${e.detail || "Undo failed."}`);
    }
  }

  async function handleEnableAutopilot(ruleId) {
    try {
      await enableAutopilot(ruleId);
      await refreshAll();
      flash(`✓ Auto-pilot enabled for rule ${ruleId}.`);
    } catch (e) {
      flash(`⚠ ${e.detail || "Auto-pilot enable failed."}`);
    }
  }

  function handleEnterCommandCenter() {
    setView("command");
    setActiveTab("overview");
  }

  function handleSelectEnvironment(env) {
    handleSwitchScenario(env).then(() => {
      setView("command");
      setActiveTab("overview");
    });
  }

  // ─── Compute current process step ───────────────────
  const currentStep = activeIncident ? statusToStep(activeIncident.status) : 1;

  // ─── RENDER: Landing ────────────────────────────────
  if (view === "landing") {
    return (
      <LandingPage
        stats={stats}
        onEnter={handleEnterCommandCenter}
        onSelectEnvironment={handleSelectEnvironment}
      />
    );
  }

  // ─── RENDER: Command Center ──────────────────────────
  const tabProps = {
    activeIncident,
    incidents,
    trustScores,
    healthCheck,
    stats,
    scenario,
    onApprove: handleApprove,
    onReject: handleReject,
    onModify: handleModify,
    onUndo: handleUndo,
    onEnableAutopilot: handleEnableAutopilot,
    notice,
    loadError,
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden" style={{ background: "var(--color-ivory)" }}>
      {/* Top header */}
      <CmdHeader scenario={scenario} onSwitchScenario={handleSwitchScenario} />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CmdSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Loading bar */}
          {loading && (
            <div className="h-0.5 w-full relative overflow-hidden" style={{ background: "rgba(184,150,62,0.15)" }}>
              <div
                className="absolute inset-y-0 left-0 h-full progress-shimmer"
                style={{ background: "linear-gradient(90deg,#B8963E,#D4AF70,#B8963E)", width: "40%", animation: "shimmer-sweep 1.2s ease-in-out infinite" }}
              />
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "overview" && <OverviewTab {...tabProps} />}
            {activeTab === "incidents" && <IncidentsTab incidents={incidents} />}
            {activeTab === "systems" && <SystemsTab incidents={incidents} scenario={scenario} />}
            {activeTab === "reports" && (
              <ReportsTab
                stats={stats}
                incidents={incidents}
                trustScores={trustScores}
                healthCheck={healthCheck}
              />
            )}
            {activeTab === "alerts" && <AlertsTab incidents={incidents} />}
            {activeTab === "config" && (
              <ConfigTab scenario={scenario} onSimulate={handleSimulate} />
            )}
          </div>

          {/* Process indicator strip */}
          <ProcessIndicator activeStep={currentStep} />
        </div>
      </div>
    </div>
  );
}
