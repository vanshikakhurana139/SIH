import { useState, useEffect } from "react";
import { getOperators, setOperatorDuty, getEscalationConfig, updateEscalationConfig, updateOperatorPhone, sendTestPhoneAlert } from "../../api/api";

const SCENARIO_POINTS = {
  powerplant: [
    { label: "Turbine Temp — High Anomalous Reading",       sensor: "turbine_temp",        value: 96.2,  severity: "high" },
    { label: "Coolant Loop Pressure — Medium Drop",         sensor: "coolant_pressure",    value: 25.0,  severity: "medium" },
    { label: "Generator Vibration — Critical Spike",        sensor: "generator_vibration", value: 8.1,   severity: "critical" },
  ],
  hospital: [
    { label: "Cardiac Heart Rate — High Tachycardia",       sensor: "heart_rate",          value: 135,   severity: "high" },
    { label: "Blood Oxygen (SpO₂) — Critical Hypoxia",      sensor: "spo2",                value: 87,    severity: "critical" },
    { label: "Systolic Blood Pressure — Medium Drop",       sensor: "systolic_bp",         value: 85,    severity: "medium" },
  ],
};

const SEV_STYLE = {
  critical: { bg: "rgba(185,28,28,0.08)",   text: "#B91C1C", border: "rgba(185,28,28,0.3)" },
  high:     { bg: "rgba(194,65,12,0.08)",   text: "#C2410C", border: "rgba(194,65,12,0.3)" },
  medium:   { bg: "rgba(180,83,9,0.08)",   text: "#B45309", border: "rgba(180,83,9,0.3)" },
};

export default function ConfigTab({ scenario, onSimulate }) {
  const points = SCENARIO_POINTS[scenario] || SCENARIO_POINTS.powerplant;

  // Escalation & Operators state
  const [operators, setOperators] = useState([]);
  const [slaSeconds, setSlaSeconds] = useState(20);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [configNotice, setConfigNotice] = useState("");

  // Edit Phone & Test Alert modal
  const [editingOperator, setEditingOperator] = useState(null);
  const [newPhone, setNewPhone] = useState("");
  const [testingChannel, setTestingChannel] = useState("sms");

  useEffect(() => {
    loadEscalationData();
  }, []);

  async function loadEscalationData() {
    try {
      const [opsData, slaData] = await Promise.all([
        getOperators().catch(() => []),
        getEscalationConfig().catch(() => ({ sla_seconds: 20 })),
      ]);
      if (opsData.length > 0) setOperators(opsData);
      if (slaData && slaData.sla_seconds) setSlaSeconds(slaData.sla_seconds);
    } catch {
      // Offline fallback defaults
    }
  }

  async function handleToggleDuty(opId, currentDuty) {
    try {
      setLoadingConfig(true);
      await setOperatorDuty(opId, !currentDuty);
      await loadEscalationData();
      setConfigNotice(`Updated duty roster status for operator.`);
      setTimeout(() => setConfigNotice(""), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfig(false);
    }
  }

  async function handleSavePhone() {
    if (!editingOperator || !newPhone.trim()) return;
    try {
      setLoadingConfig(true);
      await updateOperatorPhone(editingOperator.id, newPhone.trim());
      await loadEscalationData();
      setConfigNotice(`Phone number updated for ${editingOperator.name} to ${newPhone.trim()}`);
      setEditingOperator(null);
      setTimeout(() => setConfigNotice(""), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfig(false);
    }
  }

  async function handleSendTestDispatch(op, channel) {
    try {
      setLoadingConfig(true);
      const res = await sendTestPhoneAlert(
        op.phone,
        op.name,
        channel,
        `🚨 [SENTINEL LIVE ALERT] Real-time test dispatched to ${op.name}. Hardware telemetry nominal.`
      );
      if (res?.result?.provider === "fast2sms") {
        setConfigNotice(`✓ Fast2SMS carrier responded: ${typeof res.result.response === "string" ? res.result.response : "SMS Sent Successfully"}`);
      } else {
        setConfigNotice(`✓ Sent ${channel.toUpperCase()} dispatch to ${op.name} at ${op.phone} (Gateway: ${res?.result?.provider || "simulator"})`);
      }
      setTimeout(() => setConfigNotice(""), 6000);
    } catch (e) {
      console.error(e);
      setConfigNotice(`⚠ Error sending dispatch: ${e.message || "Failed"}`);
    } finally {
      setLoadingConfig(false);
    }
  }

  async function handleSaveSla(seconds) {
    try {
      setLoadingConfig(true);
      setSlaSeconds(seconds);
      await updateEscalationConfig(seconds);
      setConfigNotice(`Escalation SLA threshold set to ${seconds} seconds.`);
      setTimeout(() => setConfigNotice(""), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfig(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mb-8 max-w-[1700px] mx-auto">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
          Control & Testing
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
          Simulation & Hardware Config
        </h2>
        <p className="text-base font-bold text-slate-600 mt-1">
          Trigger real-time sensor anomalies into the backend to test the deterministic AI reasoning pipeline end-to-end.
        </p>
      </div>

      <div className="max-w-[1700px] mx-auto space-y-8">
        {/* Flash banner */}
        {configNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center justify-between shadow-xs">
            <span>✓ {configNotice}</span>
            <button onClick={() => setConfigNotice("")} className="opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Simulate panel */}
        <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xl font-black text-slate-900">Anomalous Sensor Injector</p>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Active Environment: <span className="font-black text-amber-800 uppercase px-2 py-0.5 bg-amber-100 rounded-md border border-amber-300">{scenario}</span>
              </p>
            </div>
            <span className="text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full">
              INTERACTIVE TESTING
            </span>
          </div>

          <div className="space-y-4">
            {points.map((p) => {
              const c = SEV_STYLE[p.severity] || SEV_STYLE.medium;
              return (
                <button
                  key={p.sensor}
                  id={`simulate-${p.sensor}`}
                  onClick={() => onSimulate(p.sensor, p.value)}
                  className="w-full flex items-center justify-between p-6 rounded-2xl border transition-all duration-200 text-left group hover:shadow-md hover:scale-[1.01] cursor-pointer"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: c.text }}
                    />
                    <div>
                      <p className="text-base font-black text-slate-900">{p.label}</p>
                      <p className="text-xs font-bold font-mono text-slate-600 mt-0.5">PAYLOAD: {p.sensor} = {p.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-2xs"
                      style={{ color: c.text, background: `${c.text}18`, borderColor: c.border }}
                    >
                      {p.severity}
                    </span>
                    <span className="gold-btn px-5 py-2.5 rounded-xl text-xs font-black tracking-wider flex items-center gap-2">
                      Trigger Incident
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 8h10M8 3l5 5-5 5" />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Escalation & SLA Matrix Controller */}
        <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <p className="text-xl font-black text-slate-900">Incident Escalation & SLA Protocol</p>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                  2-Tier Auto-Escalation
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Unresolved incidents automatically escalate from the active shift operator to the Operations Head when the SLA timeout breaches.
              </p>
            </div>

            {/* Quick SLA Presets */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 px-2">SLA Timer:</span>
              {[
                { label: "20s (Demo Pitch)", val: 20 },
                { label: "60s (1 Min)", val: 60 },
                { label: "180s (3 Min Std)", val: 180 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  disabled={loadingConfig}
                  onClick={() => handleSaveSla(preset.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    slaSeconds === preset.val
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Operator Duty Table & Toggles */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Operator / Executive</th>
                  <th className="p-3.5">Tier & Role</th>
                  <th className="p-3.5">Shift Window</th>
                  <th className="p-3.5">Notification Channel</th>
                  <th className="p-3.5 text-right">Duty Status & Manual Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {operators.map((op) => {
                  const isOpsHead = op.role === "ops_head";
                  return (
                    <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="text-base">{op.icon}</span>
                        <p className="font-black text-slate-900">{op.name}</p>
                      </td>
                      <td className="p-3.5 font-mono">
                        {isOpsHead ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 border border-purple-200 text-purple-900 font-extrabold uppercase text-[10px]">
                            Tier 2 · Ops Head
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-900 font-extrabold uppercase text-[10px]">
                            Tier 1 · Shift Operator
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 font-bold">{op.shift_time}</td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-700 font-semibold">{op.contact_email}</span>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                              📱 SMS
                            </span>
                            <span className="text-slate-900 font-black">{op.phone || "+1 (555) 0199"}</span>
                            <button
                              onClick={() => {
                                setEditingOperator(op);
                                setNewPhone(op.phone || "");
                              }}
                              className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-extrabold cursor-pointer transition-colors"
                            >
                              Edit Phone
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              disabled={loadingConfig}
                              onClick={() => handleSendTestDispatch(op, "sms")}
                              className="px-2.5 py-1 rounded bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-900 text-[10px] font-black transition-all cursor-pointer shadow-2xs"
                            >
                              Send Alert
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          disabled={loadingConfig}
                          onClick={() => handleToggleDuty(op.id, op.on_duty)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            op.on_duty
                              ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                          }`}
                        >
                          {op.on_duty ? "● ON DUTY" : "OFF DUTY"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* System info */}
        <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95">
          <p className="text-xl font-black text-slate-900 mb-6">System Architecture Information</p>
          <div className="space-y-4">
            {[
              { label: "Backend API Server", value: "FastAPI + Uvicorn + SQLite · Port 8000" },
              { label: "Frontend Control Center", value: "React 19 + Vite 8 · Plus Jakarta Sans Design System" },
              { label: "AI Reasoning Pipeline", value: "Deterministic Policy Engine + DeepReason v3.2 Reasoning" },
              { label: "Active Rule Scenario", value: scenario === "hospital" ? "Hospital Medical Suite (HOS-001/002/003)" : "Industrial Power Plant (PP-001/002/003)" },
              { label: "Escalation Watcher", value: `Active Background Task · SLA Timeout: ${slaSeconds}s` },
              { label: "Platform Version", value: "v0.4 · Sentinel Autonomous Orchestration Platform" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Phone Modal */}
      {editingOperator && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-amber-50 rounded-2xl border border-amber-200">{editingOperator.icon}</span>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Update Phone Number</h3>
                  <p className="text-xs text-slate-500 font-medium">{editingOperator.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingOperator(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile / WhatsApp Number (with Country Code)
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210 or +1 (555) 234-8901"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Both direct SMS anomaly alerts and WhatsApp notifications will be dispatched to this phone.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center gap-2">
                <span>📱</span>
                <span>Active on-duty shift operators receive real-time SMS & WhatsApp alerts immediately on sensor breach.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setEditingOperator(null)}
                className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={loadingConfig || !newPhone.trim()}
                onClick={handleSavePhone}
                className="gold-btn px-5 py-2 rounded-xl text-xs font-black tracking-wide"
              >
                Save Phone Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
