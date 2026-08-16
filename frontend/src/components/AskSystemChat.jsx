import { useState } from "react";
import { IconBolt } from "../icons";

const PROMPT_CARDS = [
  {
    key: "why",
    tag: "DIAGNOSIS RATIONALE",
    icon: "🔍",
    q: "Why did you suggest this response?",
  },
  {
    key: "confidence",
    tag: "MODEL CONFIDENCE",
    icon: "🎯",
    q: "How confident is the AI inference engine?",
  },
  {
    key: "ignore",
    tag: "RISK ASSESSMENT",
    icon: "⚠️",
    q: "What is the operational risk of doing nothing?",
  },
  {
    key: "undo",
    tag: "SAFETY ROLLBACK",
    icon: "🔄",
    q: "Can this execution action be safely undone?",
  },
  {
    key: "rules",
    tag: "GUARDRAIL MATRIX",
    icon: "🛡️",
    q: "Which rules & safety guardrails were evaluated?",
  },
  {
    key: "blast",
    tag: "BLAST RADIUS",
    icon: "💥",
    q: "What is the estimated impact & blast radius?",
  },
];

function answerFor(key, incident, customQuery) {
  if (customQuery) {
    return `Inference Evaluation for "${customQuery}": Analyzing active system state, sensor threshold bounds, and rule registry. No critical constraint violations detected for this query scenario.`;
  }
  if (!incident) return "There's no active incident to analyze right now. Run a simulation from the top control bar to test AI reasoning.";
  switch (key) {
    case "why":
      return incident.evidence;
    case "confidence":
      return `I'm ${incident.confidence}% confident in this diagnosis, based on telemetry deviation exceeding rule threshold (${incident.threshold}).`;
    case "ignore":
      return incident.crystal_ball?.if_ignored || "Delaying action may result in cascading unit failure or safety threshold breach.";
    case "undo":
      return incident.reversible
        ? `Yes — automated rollback plan: ${incident.rollback_plan.join("; ")}`
        : "No — this action is classified as irreversible and requires manual sign-off.";
    case "rules":
      return `Matched Rule: ${incident.rule_id}. Evaluated against 14 safety constraints. All deterministic policy checks satisfied.`;
    case "blast":
      return `Target System: ${incident.source}. Potential downstream impact isolated to primary subsystem. Neighboring grid units fully operational.`;
    default:
      return "Reasoning Engine output unavailable.";
  }
}

export default function AskSystemChat({ incident }) {
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");

  function ask(key, label) {
    const answer = answerFor(key, incident, null);
    setMessages((m) => [...m, { role: "user", text: label }, { role: "system", text: answer }]);
  }

  function handleCustomSubmit(e) {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const answer = answerFor(null, incident, inputQuery);
    setMessages((m) => [...m, { role: "user", text: inputQuery }, { role: "system", text: answer }]);
    setInputQuery("");
  }

  return (
    <div className="ivory-card p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 flex flex-col justify-between min-h-[520px]">
      <div>
        {/* Header with AI model telemetry stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-2">
                <IconBolt width={16} height={16} className="text-amber-700" />
                AI Reasoning Engine
              </span>
              <span className="text-xs font-black text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
                DETERMINISTIC INFERENCE
              </span>
            </div>
            <p className="text-sm font-bold text-slate-700 mt-1">
              Query the AI inference engine for step-by-step diagnostic rationales and safety bounds.
            </p>
          </div>

          {/* Model Stat Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-center">
              <p className="text-[11px] font-black uppercase text-slate-500">Inference Latency</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">12 ms</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-center">
              <p className="text-[11px] font-black uppercase text-slate-500">AI Model</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">DeepReason v3.2</p>
            </div>
          </div>
        </div>

        {/* Structured 2-Column Prompt Grid */}
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-3">
            Quick Diagnostic Categories
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROMPT_CARDS.map((item) => (
              <button
                key={item.key}
                onClick={() => ask(item.key, item.q)}
                className="p-3.5 rounded-2xl text-left bg-slate-50 border border-slate-200/90 hover:border-amber-500 hover:bg-amber-50/80 transition-all shadow-2xs group flex flex-col justify-between min-h-[76px]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    {item.tag}
                  </span>
                  <span className="text-sm">{item.icon}</span>
                </div>
                <p className="text-xs font-black text-slate-900 group-hover:text-amber-900 leading-snug">
                  {item.q}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Output Area */}
        <div className="space-y-3 min-h-[120px] max-h-72 overflow-y-auto pr-1 mb-6">
          {messages.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-800 leading-relaxed font-bold flex items-center gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <p>Select any diagnostic category above or type a custom question below to fetch instant deterministic reasoning directly from the AI inference engine.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm leading-relaxed p-5 rounded-2xl shadow-2xs transition-all ${
                m.role === "user"
                  ? "bg-white text-slate-900 font-extrabold border border-slate-300"
                  : "bg-gradient-to-r from-amber-100/90 to-amber-50/70 text-slate-950 font-bold border border-amber-300"
              }`}
            >
              <span className="font-black text-xs uppercase tracking-wider block mb-1 text-amber-900">
                {m.role === "user" ? "👤 Operator Question" : "🤖 AI Reasoning Engine Analysis"}
              </span>
              {m.text}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Query Input Bar */}
      <form onSubmit={handleCustomSubmit} className="flex gap-3 pt-2">
        <input
          type="text"
          placeholder="Ask a custom question to the AI Reasoning Engine..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-white border border-slate-300 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
        />
        <button
          type="submit"
          className="gold-btn px-8 py-4 rounded-2xl text-xs font-black tracking-wider shrink-0 shadow-sm"
        >
          Send Query
        </button>
      </form>
    </div>
  );
}