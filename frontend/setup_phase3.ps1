# SENTINEL Phase 3 setup script
# Run this from inside the frontend/ folder

Write-Host "Removing old starter files..."
Remove-Item -Path "src\App.jsx" -ErrorAction SilentlyContinue
Remove-Item -Path "src\App.css" -ErrorAction SilentlyContinue

Write-Host "Creating folders..."
New-Item -ItemType Directory -Force -Path "src\data" | Out-Null
New-Item -ItemType Directory -Force -Path "src\api" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components" | Out-Null

Write-Host "Writing mockData.js..."
@'
// mockData.js
export const mockIncident = {
  id: "inc-8f21a9",
  severity: "high",
  source: "turbine_temp",
  triggered_at: new Date().toISOString(),
  sensor_value: 96.2,
  threshold: 95.0,
  rule_id: "PP-001",
  status: "pending_approval",
  evidence:
    "Sensor turbine_temp read 96.2, exceeding the 95.0 threshold by 1.2. This matches rule PP-001.",
  confidence: 87,
  recommended_action:
    "1. Reduce turbine load to 60%\n2. Increase coolant flow rate to secondary loop\n3. Notify shift engineer",
  rollback_plan: [
    "Restore turbine load to previous setpoint",
    "Return coolant flow rate to normal baseline",
  ],
  reversible: true,
  crystal_ball: {
    if_approved: "82% chance of stabilizing within 10 minutes.",
    if_ignored: "68% chance of emergency shutdown within 25 minutes.",
  },
};

export const mockRecentIncidents = [
  {
    id: "inc-8f21a9",
    severity: "high",
    source: "turbine_temp",
    triggered_at: new Date(Date.now() - 2 * 60000).toISOString(),
    status: "pending_approval",
    confidence: 87,
  },
  {
    id: "inc-3b77c1",
    severity: "medium",
    source: "coolant_pressure",
    triggered_at: new Date(Date.now() - 15 * 60000).toISOString(),
    status: "resolved",
    confidence: 91,
  },
  {
    id: "inc-9e44d0",
    severity: "critical",
    source: "generator_vibration",
    triggered_at: new Date(Date.now() - 40 * 60000).toISOString(),
    status: "executed",
    confidence: 95,
  },
];

export const mockTrustScores = [
  { rule_id: "PP-001", label: "Turbine Overheat", score: 0.75, total_outcomes: 4, auto_pilot_eligible: false },
  { rule_id: "PP-003", label: "Coolant Pressure", score: 1.0, total_outcomes: 3, auto_pilot_eligible: true },
  { rule_id: "PP-002", label: "Generator Vibration", score: 0.5, total_outcomes: 2, auto_pilot_eligible: false },
];

export const mockHealthCheck = {
  resolved: 7,
  failed: 1,
  pending: 1,
};

export const mockStats = {
  activeIncidents: 1,
  resolvedToday: 7,
  avgConfidence: 89,
  autoPilotEnabled: 1,
};
'@ | Out-File -FilePath "src\data\mockData.js" -Encoding utf8

Write-Host "Writing api.js..."
@'
// api.js
import {
  mockIncident,
  mockRecentIncidents,
  mockTrustScores,
  mockHealthCheck,
  mockStats,
} from "../data/mockData";

const FAKE_DELAY = 300;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getActiveIncident() {
  await delay(FAKE_DELAY);
  return mockIncident;
}

export async function getIncidents() {
  await delay(FAKE_DELAY);
  return mockRecentIncidents;
}

export async function getTrustScores() {
  await delay(FAKE_DELAY);
  return mockTrustScores;
}

export async function getHealthCheck() {
  await delay(FAKE_DELAY);
  return mockHealthCheck;
}

export async function getStats() {
  await delay(FAKE_DELAY);
  return mockStats;
}

export async function simulateIncident(sensorData) {
  await delay(FAKE_DELAY);
  console.log("Mock simulateIncident called with:", sensorData);
  return { matched: true, incident: mockIncident };
}

export async function approveAction(incidentId) {
  await delay(FAKE_DELAY);
  console.log("Mock approveAction called for:", incidentId);
  return { ...mockIncident, status: "approved" };
}

export async function rejectAction(incidentId) {
  await delay(FAKE_DELAY);
  console.log("Mock rejectAction called for:", incidentId);
  return { ...mockIncident, status: "rejected" };
}

export async function modifyAction(incidentId, newAction) {
  await delay(FAKE_DELAY);
  console.log("Mock modifyAction called for:", incidentId, newAction);
  return { ...mockIncident, recommended_action: newAction, status: "modified" };
}
'@ | Out-File -FilePath "src\api\api.js" -Encoding utf8

Write-Host "Writing StatCards.jsx..."
@'
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 flex-1 min-w-[150px] border border-slate-700">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

export default function StatCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex gap-4 flex-wrap mb-6">
      <StatCard label="Active Incidents" value={stats.activeIncidents} accent="text-red-400" />
      <StatCard label="Resolved Today" value={stats.resolvedToday} accent="text-green-400" />
      <StatCard label="Avg Confidence" value={`${stats.avgConfidence}%`} accent="text-blue-400" />
      <StatCard label="Auto-Pilot Enabled" value={stats.autoPilotEnabled} accent="text-purple-400" />
    </div>
  );
}
'@ | Out-File -FilePath "src\components\StatCards.jsx" -Encoding utf8

Write-Host "Writing EvidencePanel.jsx..."
@'
function severityColor(severity) {
  switch (severity) {
    case "critical":
      return "bg-red-600";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    default:
      return "bg-blue-500";
  }
}

export default function EvidencePanel({ incident }) {
  if (!incident) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs font-semibold text-white uppercase ${severityColor(incident.severity)}`}>
          {incident.severity}
        </span>
        <span className="text-slate-400 text-sm">Rule: {incident.rule_id}</span>
        {!incident.reversible && (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-900 text-red-200">
            IRREVERSIBLE
          </span>
        )}
      </div>

      <div>
        <p className="text-slate-400 text-xs uppercase mb-1">Evidence</p>
        <p className="text-slate-100">{incident.evidence}</p>
      </div>

      <div>
        <p className="text-slate-400 text-xs uppercase mb-1">Confidence</p>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${incident.confidence}%` }}
          />
        </div>
        <p className="text-slate-300 text-sm mt-1">{incident.confidence}%</p>
      </div>

      <div>
        <p className="text-slate-400 text-xs uppercase mb-1">Recommended Action</p>
        <pre className="text-slate-100 whitespace-pre-wrap font-sans text-sm bg-slate-900 rounded-lg p-3">
          {incident.recommended_action}
        </pre>
      </div>

      <div>
        <p className="text-slate-400 text-xs uppercase mb-1">Rollback Plan</p>
        <ul className="list-disc list-inside text-slate-100 text-sm space-y-1">
          {incident.rollback_plan.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src\components\EvidencePanel.jsx" -Encoding utf8

Write-Host "Writing CrystalBall.jsx..."
@'
export default function CrystalBall({ crystalBall }) {
  if (!crystalBall) return null;

  return (
    <div>
      <p className="text-slate-400 text-xs uppercase mb-2">Crystal Ball</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-950 border border-green-700 rounded-lg p-3">
          <p className="text-green-400 text-xs font-semibold mb-1">IF APPROVED</p>
          <p className="text-slate-100 text-sm">{crystalBall.if_approved}</p>
        </div>
        <div className="bg-red-950 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-xs font-semibold mb-1">IF IGNORED</p>
          <p className="text-slate-100 text-sm">{crystalBall.if_ignored}</p>
        </div>
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src\components\CrystalBall.jsx" -Encoding utf8

Write-Host "Writing ActiveIncidentCard.jsx..."
@'
import { useState } from "react";
import EvidencePanel from "./EvidencePanel";
import CrystalBall from "./CrystalBall";

export default function ActiveIncidentCard({ incident }) {
  const [status, setStatus] = useState(incident?.status || "pending_approval");
  const [showModify, setShowModify] = useState(false);
  const [modifiedAction, setModifiedAction] = useState(incident?.recommended_action || "");
  const [confirmedOnce, setConfirmedOnce] = useState(false);

  if (!incident) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <p className="text-slate-400">No active incident.</p>
      </div>
    );
  }

  const needsExtraConfirm = incident.severity === "high" || incident.severity === "critical" || !incident.reversible;

  function handleApprove() {
    if (needsExtraConfirm && !confirmedOnce) {
      setConfirmedOnce(true);
      return;
    }
    setStatus("approved");
  }

  function handleReject() {
    setStatus("rejected");
  }

  function handleModifySubmit() {
    setStatus("modified");
    setShowModify(false);
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Active Incident</h2>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-200 uppercase">
          {status}
        </span>
      </div>

      <EvidencePanel incident={incident} />
      <CrystalBall crystalBall={incident.crystal_ball} />

      {status === "pending_approval" && !showModify && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleApprove}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition"
          >
            {needsExtraConfirm && !confirmedOnce ? "Confirm Approve (irreversible/high-risk)" : "Approve"}
          </button>
          <button
            onClick={handleReject}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg transition"
          >
            Reject
          </button>
          <button
            onClick={() => setShowModify(true)}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 rounded-lg transition"
          >
            Modify
          </button>
        </div>
      )}

      {showModify && (
        <div className="space-y-2 pt-2">
          <textarea
            className="w-full bg-slate-900 text-slate-100 rounded-lg p-3 text-sm"
            rows={4}
            value={modifiedAction}
            onChange={(e) => setModifiedAction(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={handleModifySubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition"
            >
              Submit Modified Action
            </button>
            <button
              onClick={() => setShowModify(false)}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status !== "pending_approval" && (
        <div
          className={`rounded-lg p-3 text-sm font-semibold ${
            status === "approved" || status === "modified"
              ? "bg-green-950 text-green-300"
              : "bg-red-950 text-red-300"
          }`}
        >
          Decision recorded: {status.toUpperCase()}
        </div>
      )}
    </div>
  );
}
'@ | Out-File -FilePath "src\components\ActiveIncidentCard.jsx" -Encoding utf8

Write-Host "Writing RecentIncidentsTable.jsx..."
@'
function statusColor(status) {
  switch (status) {
    case "resolved":
      return "text-green-400";
    case "executed":
      return "text-blue-400";
    case "failed":
      return "text-red-400";
    default:
      return "text-yellow-400";
  }
}

export default function RecentIncidentsTable({ incidents }) {
  if (!incidents || incidents.length === 0) {
    return <p className="text-slate-400">No recent incidents.</p>;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-lg font-bold text-white mb-4">Recent Incidents</h2>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="pb-2">Source</th>
            <th className="pb-2">Severity</th>
            <th className="pb-2">Confidence</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id} className="border-b border-slate-800 text-slate-200">
              <td className="py-2">{inc.source}</td>
              <td className="py-2 capitalize">{inc.severity}</td>
              <td className="py-2">{inc.confidence}%</td>
              <td className={`py-2 capitalize font-semibold ${statusColor(inc.status)}`}>
                {inc.status}
              </td>
              <td className="py-2 text-slate-400">
                {new Date(inc.triggered_at).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
'@ | Out-File -FilePath "src\components\RecentIncidentsTable.jsx" -Encoding utf8

Write-Host "Writing TrustScorePanel.jsx..."
@'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TrustScorePanel({ trustScores }) {
  if (!trustScores) return null;

  const chartData = trustScores.map((t) => ({
    name: t.label,
    score: Math.round(t.score * 100),
    eligible: t.auto_pilot_eligible,
  }));

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-lg font-bold text-white mb-4">Trust Score</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
          <YAxis type="category" dataKey="name" width={140} stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.eligible ? "#22c55e" : "#3b82f6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-1">
        {trustScores
          .filter((t) => t.auto_pilot_eligible)
          .map((t) => (
            <div
              key={t.rule_id}
              className="flex items-center justify-between bg-green-950 border border-green-700 rounded-lg px-3 py-2"
            >
              <span className="text-green-300 text-sm">{t.label} has earned Auto-Pilot</span>
              <button className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-full transition">
                Enable Auto-Pilot
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src\components\TrustScorePanel.jsx" -Encoding utf8

Write-Host "Writing HealthCheckPanel.jsx..."
@'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const COLORS = { resolved: "#22c55e", failed: "#ef4444", pending: "#eab308" };

export default function HealthCheckPanel({ healthCheck }) {
  if (!healthCheck) return null;

  const data = [
    { name: "Resolved", value: healthCheck.resolved, key: "resolved" },
    { name: "Failed", value: healthCheck.failed, key: "failed" },
    { name: "Pending", value: healthCheck.pending, key: "pending" },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-lg font-bold text-white mb-4">Post-Action Health Check</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
'@ | Out-File -FilePath "src\components\HealthCheckPanel.jsx" -Encoding utf8

Write-Host "Writing ArchitectureStrip.jsx..."
@'
const STEPS = [
  "Sensor Data",
  "Rule Engine",
  "Reasoning Engine",
  "Human Dashboard",
  "Orchestration",
  "Health Check",
];

export default function ArchitectureStrip() {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-2 bg-slate-700 rounded-lg text-slate-200 text-xs font-medium whitespace-nowrap">
              {step}
            </div>
            {i < STEPS.length - 1 && <span className="text-slate-500">-&gt;</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src\components\ArchitectureStrip.jsx" -Encoding utf8

Write-Host "Writing Sidebar.jsx..."
@'
const ACTIVE_ITEMS = [
  { label: "Dashboard", icon: "🖥️" },
  { label: "Audit Log", icon: "📜" },
];

const DISABLED_ITEMS = [
  { label: "Settings", icon: "⚙️" },
  { label: "Users & Roles", icon: "👥" },
  { label: "Configuration", icon: "🔧" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 min-h-screen p-4 shrink-0">
      <h1 className="text-white font-bold text-xl mb-8 px-2">SENTINEL</h1>
      <nav className="space-y-1">
        {ACTIVE_ITEMS.map((item) => (
          <button
            key={item.label}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition flex items-center gap-2"
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="pt-4 mt-4 border-t border-slate-800">
          {DISABLED_ITEMS.map((item) => (
            <div
              key={item.label}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-600 flex items-center gap-2 cursor-not-allowed select-none"
              title="Not available in this build"
            >
              <span className="opacity-50">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
'@ | Out-File -FilePath "src\components\Sidebar.jsx" -Encoding utf8

Write-Host "Writing App.jsx..."
@'
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
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-white mb-1">
          Incident Orchestration Dashboard
        </h1>
        <p className="text-slate-400 mb-6">
          Autonomous detection, human-verified response.
        </p>

        {loading ? (
          <p className="text-slate-400">Loading dashboard...</p>
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
  );
}

export default App;
'@ | Out-File -FilePath "src\App.jsx" -Encoding utf8

Write-Host ""
Write-Host "DONE. All Phase 3 files created." -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Yellow
