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
  manualEscalateIncident,
  resetActiveIncidents,
} from "./api/api";

// Landing page
import LandingPage from "./components/landing/LandingPage";

// Operator portal
import OperatorPortal from "./components/operator/OperatorPortal";

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
  const [view, setView]           = useState("landing"); // "landing" | "command" | "operator"
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Scenario ───────────────────────────────────────
  const [scenario, setScenario]   = useState("powerplant");

  // ─── Data state ─────────────────────────────────────
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidents, setIncidents]           = useState([]);
  const [trustScores, setTrustScores]       = useState([]);
  const [healthCheck, setHealthCheck]       = useState(null);
  const [stats, setStats]                   = useState(null);

  // ─── Shift Operator State ──────────────────────────
  const [activeShiftOperator, setActiveShiftOperator] = useState(() => {
    return localStorage.getItem("sentinel_active_operator") || "Marcus Vance";
  });

  const handleSelectOperator = (operatorName) => {
    setActiveShiftOperator(operatorName);
    localStorage.setItem("sentinel_active_operator", operatorName);
  };

  // ─── UI state ───────────────────────────────────────
  const [notice, setNotice]   = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Browser Push & Toast Notification Tracking ─────
  const prevIncidentRef = useCallback((prev, current) => {
    if (!current) return;
    // 1. Check if newly triggered incident
    if (!prev || prev.id !== current.id) {
      flash(`🚨 New Incident Alert: ${current.source?.replace(/_/g, " ")} (${current.severity?.toUpperCase()}) assigned to ${current.assigned_operator_name || "Shift Operator"}`);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("🚨 SENTINEL: Incident Assigned", {
            body: `${current.severity?.toUpperCase()} Anomaly: ${current.source}. Assigned to ${current.assigned_operator_name || "Shift Operator"}.`,
            icon: "/favicon.ico",
          });
        } catch (err) {
          console.error("Browser notification error:", err);
        }
      }
    }
    // 2. Check if escalated to Ops Head
    else if (prev && prev.id === current.id && prev.escalation_level === 0 && current.escalation_level === 1) {
      flash(`🚨 SLA BREACH: Incident escalated to Operations Head (${current.assigned_operator_name})!`);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("🚨 SLA BREACH: Escalated to Operations Head", {
            body: `Incident ${current.source} exceeded SLA and was escalated to ${current.assigned_operator_name}.`,
            icon: "/favicon.ico",
          });
        } catch (err) {
          console.error("Browser notification error:", err);
        }
      }
    }
  }, []);

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
      setActiveIncident((prev) => {
        prevIncidentRef(prev, inc);
        return inc;
      });
      setIncidents(all || []);
      setTrustScores(trust || []);
      setHealthCheck(hc || null);
      setStats(st || null);
      setLoadError("");
    } catch {
      setLoadError("⚠ Unable to reach backend. Make sure the FastAPI server is running on port 8000.");
    }
  }, [prevIncidentRef]);

  useEffect(() => {
    // Request browser notification permission once
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const fetchInitial = async () => {
      try {
        await resetActiveIncidents().catch(() => {});
        await loadScenario(scenario);
      } catch (err) {
        console.error("Initial scenario load:", err);
      }
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
      // Ensure the active scenario's rules are loaded in the backend rule engine before simulate
      await loadScenario(scenario);
      await simulateIncident(sensor, value);
      await refreshAll();
      flash(`✓ Sensor ${sensor} injected at ${value}. AI diagnosis complete.`);
      setView("command");
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

  function handleOpenOperator() {
    setView("operator");
  }

  function handleSelectEnvironment(env) {
    handleSwitchScenario(env).then(() => {
      setView("command");
      setActiveTab("overview");
    });
  }

  // ─── Compute current process step ───────────────────
  const currentStep = activeIncident ? statusToStep(activeIncident.status) : 1;

  async function handleManualEscalate(incidentId) {
    try {
      await manualEscalateIncident(incidentId);
      await refreshAll();
      flash("🚨 Incident manually escalated to Operations Head.");
    } catch (e) {
      flash(`⚠ ${e.detail || "Manual escalation failed."}`);
    }
  }

  // ─── RENDER: Operator Portal ────────────────────────
  if (view === "operator") {
    return (
      <OperatorPortal
        currentScenario={scenario}
        onSwitchScenario={async (newSc) => {
          setScenario(newSc);
          await refreshAll();
        }}
        activeShiftOperator={activeShiftOperator}
        onSelectOperator={handleSelectOperator}
        onExit={() => setView("command")}
      />
    );
  }

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
    activeShiftOperator,
    onApprove: handleApprove,
    onReject: handleReject,
    onModify: handleModify,
    onUndo: handleUndo,
    onEnableAutopilot: handleEnableAutopilot,
    onManualEscalate: handleManualEscalate,
    notice,
    loadError,
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden" style={{ background: "var(--color-ivory)" }}>
      {/* Top header */}
      <CmdHeader
        scenario={scenario}
        onSwitchScenario={handleSwitchScenario}
        onOpenOperator={handleOpenOperator}
        activeIncident={activeIncident}
        activeShiftOperator={activeShiftOperator}
      />


      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CmdSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          incidents={incidents}
          onOpenOperator={handleOpenOperator}
          activeShiftOperator={activeShiftOperator}
        />

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
              <ConfigTab
                scenario={scenario}
                onSimulate={async (sensor, value) => {
                  setActiveTab("overview");
                  await handleSimulate(sensor, value);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
