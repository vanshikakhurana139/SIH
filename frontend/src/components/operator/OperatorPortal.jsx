import { useState, useEffect } from "react";
import logoImg from "../../assets/logo.png";
import {
  getScenarios,
  getScenarioRules,
  uploadScenarioRules,
  addNewScenario,
  loadScenario,
  deleteScenario,
} from "../../api/api";

const PRELOADED_DEFAULTS = {
  powerplant: [
    {
      rule_id: "PP-001",
      sensor: "turbine_temp",
      operator: ">",
      threshold: 95.0,
      severity: "high",
      suggested_actions: [
        "Reduce turbine load to 60%",
        "Increase coolant flow rate to secondary loop",
        "Notify shift engineer"
      ],
      rollback_steps: [
        "Restore turbine load to previous setpoint",
        "Return coolant flow rate to normal baseline"
      ],
      reversible: true,
      risk_factors: [
        "Sensor may be reading a transient spike, not a sustained rise",
        "Reducing turbine load can itself trigger a brief vibration transient"
      ]
    },
    {
      rule_id: "PP-002",
      sensor: "generator_vibration",
      operator: ">",
      threshold: 7.5,
      severity: "critical",
      suggested_actions: [
        "Emergency shutdown of generator unit",
        "Lock out generator for physical inspection"
      ],
      rollback_steps: [
        "Cannot be rolled back automatically — requires manual inspection sign-off"
      ],
      reversible: false,
      risk_factors: [
        "Emergency shutdown carries its own restart risk on aging bearings"
      ]
    },
    {
      rule_id: "PP-003",
      sensor: "coolant_pressure",
      operator: "<",
      threshold: 30.0,
      severity: "medium",
      suggested_actions: [
        "Activate backup coolant pump",
        "Check for leaks in primary coolant line"
      ],
      rollback_steps: [
        "Deactivate backup coolant pump once primary is restored"
      ],
      reversible: true,
      risk_factors: [
        "Backup pump activation draws from a shared reserve tank"
      ]
    }
  ],
  hospital: [
    {
      rule_id: "HOSP-001",
      sensor: "heart_rate",
      operator: ">",
      threshold: 130.0,
      severity: "high",
      suggested_actions: [
        "Alert attending nurse immediately",
        "Initiate continuous ECG monitoring",
        "Prepare beta-blocker per protocol, pending physician order"
      ],
      rollback_steps: [
        "Discontinue continuous ECG monitoring once vitals stabilize",
        "Cancel pending medication order if not administered"
      ],
      reversible: true,
      risk_factors: [
        "Elevated heart rate can be caused by patient anxiety or movement artifact"
      ]
    },
    {
      rule_id: "HOSP-002",
      sensor: "spo2",
      operator: "<",
      threshold: 90.0,
      severity: "critical",
      suggested_actions: [
        "Administer supplemental oxygen immediately",
        "Page rapid response team"
      ],
      rollback_steps: [
        "Cannot be rolled back automatically — requires physician sign-off"
      ],
      reversible: false,
      risk_factors: [
        "Pulse oximeter readings are unreliable on patients with poor peripheral circulation"
      ]
    },
    {
      rule_id: "HOSP-003",
      sensor: "systolic_bp",
      operator: "<",
      threshold: 90.0,
      severity: "medium",
      suggested_actions: [
        "Increase IV fluid rate",
        "Recheck blood pressure in 5 minutes"
      ],
      rollback_steps: [
        "Return IV fluid rate to baseline once BP normalizes"
      ],
      reversible: true,
      risk_factors: [
        "Low blood pressure readings can result from incorrect cuff sizing"
      ]
    }
  ]
};

export default function OperatorPortal({ currentScenario, onSwitchScenario, onExit }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioRules, setScenarioRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [jsonInput, setJsonInput] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [activeTab, setActiveTab] = useState("file"); // "file" | "editor" | "view"
  
  // Add new scenario modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScName, setNewScName] = useState("");
  const [newScId, setNewScId] = useState("");
  const [newScIcon, setNewScIcon] = useState("⚡");
  const [newScDesc, setNewScDesc] = useState("");
  const [newScJson, setNewScJson] = useState(JSON.stringify(PRELOADED_DEFAULTS.powerplant, null, 2));

  useEffect(() => {
    fetchScenariosList();
  }, []);

  async function fetchScenariosList() {
    try {
      const data = await getScenarios();
      setScenarios(data);
    } catch {
      // Fallback defaults if offline
      setScenarios([
        {
          id: "powerplant",
          name: "Power Plant",
          icon: "⚡",
          description: "Turbine Temperature, Generator Vibration & Coolant Pressure Safety Rules",
          file: "rules_powerplant.json",
          rules_count: 3,
          is_active: currentScenario === "powerplant",
        },
        {
          id: "hospital",
          name: "Hospital ICU",
          icon: "🏥",
          description: "Cardiac Heart Rate, SpO2 Hypoxia & Systolic Blood Pressure Rules",
          file: "rules_hospital.json",
          rules_count: 3,
          is_active: currentScenario === "hospital",
        },
      ]);
    }
  }

  const showFlash = (message, type = "success") => {
    setNotice({ type, message });
    setTimeout(() => setNotice({ type: "", message: "" }), 5000);
  };

  const handleOpenScenario = async (sc) => {
    setSelectedScenario(sc);
    setLoadingRules(true);
    setUploadFile(null);
    try {
      const rules = await getScenarioRules(sc.id);
      const activeRules = rules && rules.length ? rules : (PRELOADED_DEFAULTS[sc.id] || []);
      setScenarioRules(activeRules);
      setJsonInput(JSON.stringify(activeRules, null, 2));
    } catch {
      const fallback = PRELOADED_DEFAULTS[sc.id] || [];
      setScenarioRules(fallback);
      setJsonInput(JSON.stringify(fallback, null, 2));
    } finally {
      setLoadingRules(false);
    }
  };

  const handleActivateScenario = async (scId) => {
    try {
      await loadScenario(scId);
      await onSwitchScenario(scId);
      await fetchScenariosList();
      showFlash(`✓ Active scenario set to ${scId.toUpperCase()}! Engine rules re-aligned.`);
    } catch (e) {
      showFlash(`⚠ Activation failed: ${e.detail || e.message}`, "error");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      showFlash("⚠ Please select a valid .json file.", "error");
      return;
    }
    setUploadFile(file);

    // Also read and populate JSON input preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        setJsonInput(JSON.stringify(parsed, null, 2));
      } catch {
        showFlash("⚠ Selected file contains invalid JSON text.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitFileUpload = async () => {
    if (!selectedScenario) return;
    if (!uploadFile && !jsonInput.trim()) {
      showFlash("⚠ Please select a JSON file or paste JSON rule code.", "error");
      return;
    }

    try {
      let fileToUpload = uploadFile;
      if (!fileToUpload) {
        // Create blob file from editor text
        const blob = new Blob([jsonInput], { type: "application/json" });
        fileToUpload = new File([blob], `rules_${selectedScenario.id}.json`, { type: "application/json" });
      }

      const res = await uploadScenarioRules(selectedScenario.id, fileToUpload);
      showFlash(`✓ ${res.message || "Rule file uploaded and updated successfully!"}`);
      
      // Update state
      const parsed = JSON.parse(jsonInput);
      setScenarioRules(parsed);
      await handleActivateScenario(selectedScenario.id);
      await fetchScenariosList();
    } catch (err) {
      showFlash(`⚠ Rule Upload failed: ${err.detail || err.message}`, "error");
    }
  };

  const handleCreateNewScenario = async (e) => {
    e.preventDefault();
    if (!newScName.trim()) {
      showFlash("⚠ Scenario Name is required.", "error");
      return;
    }

    const scId = (newScId || newScName).toLowerCase().trim().replace(/[^a-z0-9]/g, "_");

    let parsedRules = [];
    try {
      parsedRules = JSON.parse(newScJson);
      if (!Array.isArray(parsedRules)) {
        throw new Error("JSON must be an array of rule objects");
      }
    } catch (err) {
      showFlash(`⚠ Invalid Rule JSON format: ${err.message}`, "error");
      return;
    }

    try {
      const payload = {
        id: scId,
        name: newScName,
        icon: newScIcon,
        description: newScDesc || `${newScName} Custom Operational Rules`,
        rules: parsedRules,
      };

      const res = await addNewScenario(payload);
      showFlash(`✓ ${res.message}`);
      setShowAddModal(false);
      await onSwitchScenario(scId);
      await fetchScenariosList();
    } catch (err) {
      showFlash(`⚠ Failed to create scenario: ${err.detail || err.message}`, "error");
    }
  };

  const handleDeleteScenario = async (scId, scName) => {
    if (scId === "powerplant" || scId === "hospital") {
      showFlash("⚠ Default scenarios (Power Plant & Hospital) cannot be deleted.", "error");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete scenario '${scName || scId}'? This will remove its rule file.`)) {
      return;
    }

    try {
      const res = await deleteScenario(scId);
      showFlash(`✓ ${res.message || "Scenario deleted successfully."}`);
      if (selectedScenario?.id === scId) {
        setSelectedScenario(null);
      }
      if (currentScenario === scId) {
        await onSwitchScenario("powerplant");
      }
      await fetchScenariosList();
    } catch (err) {
      showFlash(`⚠ Deletion failed: ${err.detail || err.message}`, "error");
    }
  };

  const handleDownloadRules = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonInput);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rules_${selectedScenario?.id || "custom"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden text-slate-900 font-sans" style={{ background: "#EFECE6" }}>
      {/* Top Navigation Header */}
      <header className="flex items-center justify-between px-6 sm:px-8 py-4 bg-white/95 border-b border-slate-200/90 shadow-2xs shrink-0 z-30">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="Sentinel Logo" className="w-9 h-9 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs object-contain" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">Sentinel Operator Portal</h1>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300/80">
                Rule Engine Admin
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Dynamic Operational Policy & Scenario Rule Manager (No Login Required)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold font-mono shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            OPERATOR BACKEND READY
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            ← Exit to Command Center
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-[1600px] w-full mx-auto space-y-8">
        {/* Flash Message Banner */}
        {notice.message && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all duration-300 ${
              notice.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            <span>{notice.message}</span>
            <button onClick={() => setNotice({ type: "", message: "" })} className="text-xs opacity-70 hover:opacity-100 font-mono">
              ✕ CLOSE
            </button>
          </div>
        )}

        {/* Section Title */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Scenario to Manage Rules</h3>
          <p className="text-xs font-bold text-slate-600 mt-1">
            Click any scenario card below to inspect pre-loaded rules, upload an updated `.json` file, or add a custom domain scenario.
          </p>
        </div>

        {/* Big Scenario Action Buttons / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Power Plant Card */}
          {(() => {
            const sc = scenarios.find((s) => s.id === "powerplant") || {
              id: "powerplant",
              name: "Power Plant",
              icon: "⚡",
              description: "Turbine Temperature, Generator Vibration & Coolant Pressure Safety Rules",
              rules_count: 3,
            };
            const isActive = currentScenario === "powerplant";
            return (
              <div
                key="powerplant"
                className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                  isActive
                    ? "bg-white border-2 border-amber-500 shadow-md"
                    : "bg-white/90 border border-slate-300/80 hover:border-amber-400 hover:bg-white hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      ⚡
                    </div>
                    {isActive ? (
                      <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                        ● Active System
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateScenario("powerplant")}
                        className="px-3.5 py-1 rounded-full bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-700 border border-slate-300/80 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Activate Scenario
                      </button>
                    )}
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Power Plant</h4>
                  <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                    Industrial power generation unit. Pre-loaded with turbine temperature, generator vibration, and coolant pressure safeguard rules (`rules_powerplant.json`).
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg">
                    3 Existing Rules Loaded
                  </span>
                  <button
                    onClick={() => handleOpenScenario(sc)}
                    className="gold-btn px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer text-white shadow-xs hover:shadow-sm"
                  >
                    Manage & Upload JSON
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 8h10M8 3l5 5-5 5" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Hospital ICU Card */}
          {(() => {
            const sc = scenarios.find((s) => s.id === "hospital") || {
              id: "hospital",
              name: "Hospital ICU",
              icon: "🏥",
              description: "Cardiac Heart Rate, SpO2 Hypoxia & Systolic Blood Pressure Rules",
              rules_count: 3,
            };
            const isActive = currentScenario === "hospital";
            return (
              <div
                key="hospital"
                className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                  isActive
                    ? "bg-white border-2 border-amber-500 shadow-md"
                    : "bg-white/90 border border-slate-300/80 hover:border-amber-400 hover:bg-white hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      🏥
                    </div>
                    {isActive ? (
                      <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                        ● Active System
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateScenario("hospital")}
                        className="px-3.5 py-1 rounded-full bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-700 border border-slate-300/80 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Activate Scenario
                      </button>
                    )}
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Hospital ICU</h4>
                  <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                    Critical care patient monitor. Pre-loaded with tachycardia heart rate, hypoxemia SpO2, and blood pressure safeguard rules (`rules_hospital.json`).
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-cyan-900 bg-cyan-100 border border-cyan-300 px-3 py-1 rounded-lg">
                    3 Existing Rules Loaded
                  </span>
                  <button
                    onClick={() => handleOpenScenario(sc)}
                    className="gold-btn px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer text-white shadow-xs hover:shadow-sm"
                  >
                    Manage & Upload JSON
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 8h10M8 3l5 5-5 5" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Add Another Scenario Card */}
          <div
            onClick={() => setShowAddModal(true)}
            className="p-7 rounded-3xl border-2 border-dashed border-slate-300/90 hover:border-amber-500 bg-white/70 hover:bg-white transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:shadow-md"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100/60 border border-amber-300/80 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform text-amber-800 mb-4">
                ➕
              </div>

              <h4 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-amber-800 transition-colors">
                Add Another Scenario
              </h4>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Register a new domain scenario (e.g. Smart Water Grid, Autonomous Data Center, Supply Chain) and upload its custom rule JSON file.
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300/80">
                Custom JSON Domain
              </span>
              <span className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs">
                + Create New
              </span>
            </div>
          </div>
        </div>

        {/* Custom Dynamic Scenarios List (If any extra scenarios exist) */}
        {scenarios.filter((s) => s.id !== "powerplant" && s.id !== "hospital").length > 0 && (
          <div className="space-y-4 pt-4">
            <h4 className="text-lg font-black text-slate-900">Custom Operator Scenarios</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scenarios
                .filter((s) => s.id !== "powerplant" && s.id !== "hospital")
                .map((sc) => (
                  <div
                    key={sc.id}
                    className="p-6 rounded-3xl border border-slate-300/80 bg-white hover:border-amber-500 transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{sc.icon || "⚙️"}</span>
                        <div className="flex items-center gap-2">
                          {currentScenario === sc.id && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold uppercase">
                              Active
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScenario(sc.id, sc.name);
                            }}
                            title="Delete Scenario"
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                          >
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h5 className="text-lg font-black text-slate-900">{sc.name}</h5>
                      <p className="text-xs text-slate-600 mt-1">{sc.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-mono text-amber-900 font-extrabold bg-amber-100 px-2.5 py-1 rounded-md">{sc.rules_count || 0} Rules</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenScenario(sc)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-extrabold cursor-pointer"
                        >
                          Manage Rules
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Scenario Rule File Inspector & Uploader Drawer / Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#FAF9F6] border border-slate-300 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-200">{selectedScenario.icon || "⚙️"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{selectedScenario.name} Rule Manager</h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-extrabold">
                      {selectedScenario.file}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">Upload a new `.json` rule file or inspect existing rule definitions</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedScenario.id !== "powerplant" && selectedScenario.id !== "hospital" && (
                  <button
                    onClick={() => handleDeleteScenario(selectedScenario.id, selectedScenario.name)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-10" />
                    </svg>
                    Delete Scenario
                  </button>
                )}
                <button
                  onClick={handleDownloadRules}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 2v9M4 8l4 4 4-4M2 14h12" />
                  </svg>
                  Download JSON
                </button>
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold border border-slate-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Sub-Header Tabs */}
            <div className="px-6 py-3 bg-white/80 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {[
                  { id: "file", label: "📁 Upload Rule File (.json)" },
                  { id: "editor", label: "📝 JSON Code Editor" },
                  { id: "view", label: `👁 Active Rules (${scenarioRules.length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === t.id
                        ? "bg-amber-700 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {currentScenario === selectedScenario.id ? (
                <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 font-mono bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  Active System Ruleset
                </span>
              ) : (
                <button
                  onClick={() => handleActivateScenario(selectedScenario.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Set as Active System
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingRules ? (
                <div className="p-12 text-center text-slate-600 font-mono">Loading scenario rule definitions...</div>
              ) : activeTab === "file" ? (
                /* Tab 1: Upload Rule File */
                <div className="space-y-6">
                  <div className="p-8 border-2 border-dashed border-amber-300 rounded-3xl bg-amber-50/60 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-3xl text-amber-800">
                      📄
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Upload Rules File for {selectedScenario.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">Select an actual `.json` file containing the rule array</p>
                    </div>

                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="json-file-input"
                    />
                    <label
                      htmlFor="json-file-input"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Browse & Select JSON File
                    </label>

                    {uploadFile && (
                      <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-mono font-bold inline-block border border-emerald-300">
                        ✓ Selected File: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>

                  {/* Schema guidelines */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-300/80 text-xs space-y-2">
                    <p className="font-extrabold text-amber-900 uppercase tracking-wider">JSON Rule Format Specs:</p>
                    <p className="text-slate-700 font-mono">
                      Must be a JSON Array containing objects with: <br />
                      <code className="text-amber-800 font-bold">
                        ["rule_id", "sensor", "operator" (&gt;, &lt;, ==), "threshold", "severity", "suggested_actions", "rollback_steps", "reversible", "risk_factors"]
                      </code>
                    </p>
                  </div>

                  <button
                    onClick={handleSubmitFileUpload}
                    className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Upload & Apply Rules to Scenario
                  </button>
                </div>
              ) : activeTab === "editor" ? (
                /* Tab 2: Code Editor */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase text-slate-600">Edit JSON Rules Array</label>
                    <button
                      onClick={() => {
                        try {
                          const p = JSON.parse(jsonInput);
                          setJsonInput(JSON.stringify(p, null, 2));
                          showFlash("✓ Valid JSON format!");
                        } catch (err) {
                          showFlash(`⚠ Invalid JSON: ${err.message}`, "error");
                        }
                      }}
                      className="text-xs font-extrabold text-amber-800 hover:underline cursor-pointer"
                    >
                      Format & Validate JSON
                    </button>
                  </div>

                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={16}
                    className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 leading-relaxed shadow-inner"
                  />

                  <button
                    onClick={handleSubmitFileUpload}
                    className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Save & Activate JSON Rules
                  </button>
                </div>
              ) : (
                /* Tab 3: Active Rules List Cards */
                <div className="space-y-4">
                  {scenarioRules.map((rule, idx) => (
                    <div key={rule.rule_id || idx} className="p-5 rounded-2xl bg-white border border-slate-300/80 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-black">
                            {rule.rule_id}
                          </span>
                          <span className="text-sm font-black text-slate-900">{rule.sensor}</span>
                        </div>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                            rule.severity === "critical"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : rule.severity === "high"
                              ? "bg-orange-100 text-orange-800 border border-orange-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-amber-900">
                        IF <span className="text-slate-900 font-black">{rule.sensor}</span> {rule.operator} {rule.threshold} THEN TRIGGER INCIDENT
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">Suggested Actions:</p>
                          <ul className="list-disc list-inside text-slate-800 mt-1 space-y-1">
                            {rule.suggested_actions?.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">Rollback Steps:</p>
                          <ul className="list-disc list-inside text-slate-800 mt-1 space-y-1">
                            {rule.rollback_steps?.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Scenario Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] border border-slate-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Create New Industry Scenario</h3>
                <p className="text-xs text-slate-600">Define scenario details and attach custom JSON rule set</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center border border-slate-300 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewScenario} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase">Scenario Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart Water Grid"
                    value={newScName}
                    onChange={(e) => setNewScName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase">Icon Emoji</label>
                  <input
                    type="text"
                    value={newScIcon}
                    onChange={(e) => setNewScIcon(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-center focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 uppercase">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Water pump pressure and reservoir tank monitoring safeguards"
                  value={newScDesc}
                  onChange={(e) => setNewScDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 uppercase">Initial Rule JSON File Content</label>
                <textarea
                  value={newScJson}
                  onChange={(e) => setNewScJson(e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-black text-sm uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                Create Scenario & Load Rules
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
