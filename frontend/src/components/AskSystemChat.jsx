import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [hovering, setHovering] = useState(false);

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
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-in fade-in duration-300">
          {/* Ask AI Pill Bubble */}
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-black text-slate-900 font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            Ask AI
          </div>

          {/* Floating Robot Avatar Button */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(true)}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-0.5 shadow-xl border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 group"
            >
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                {/* Robot Icon */}
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#F59E0B" strokeWidth="2.2">
                  <rect x="5" y="8" width="14" height="11" rx="3" fill="#F59E0B20" />
                  <path d="M12 2v6M9 4h6" strokeLinecap="round" />
                  <circle cx="9.5" cy="12.5" r="1.5" fill="#F59E0B" />
                  <circle cx="14.5" cy="12.5" r="1.5" fill="#F59E0B" />
                  <path d="M9.5 16h5" strokeLinecap="round" />
                </svg>
              </div>
            </button>

            {/* Hover Tooltip: AI Reasoning Engine */}
            {hovering && (
              <div className="absolute right-0 bottom-16 whitespace-nowrap bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in duration-150 pointer-events-none">
                AI Reasoning Engine
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Chatbot Window (Popover less than half page) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[85vh] bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold shadow-2xs">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="5" y="8" width="14" height="11" rx="3" fill="currentColor" fillOpacity="0.1" />
                  <path d="M12 2v6M9 4h6" strokeLinecap="round" />
                  <circle cx="9.5" cy="12.5" r="1.5" fill="currentColor" />
                  <circle cx="14.5" cy="12.5" r="1.5" fill="currentColor" />
                  <path d="M9.5 16h5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 leading-none">Sentinel AI</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">AI Reasoning Engine & Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-300/80 text-slate-600 hover:text-slate-900 flex items-center justify-center font-black transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
            {/* Greeting Banner */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Hi, There 👋</h4>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                I'm <span className="text-amber-800 font-black">Sentinel AI</span> — your personal automated incident reasoning assistant. Let's analyze live telemetry together.
              </p>
            </div>

            {/* Pre-fed Questions List ("You may try asking") */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
                You may try asking
              </p>

              <div className="space-y-2">
                {PROMPT_CARDS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => ask(item.key, item.q)}
                    className="w-full p-3 rounded-xl text-left bg-white hover:bg-amber-50/80 border border-slate-200/90 hover:border-amber-400 transition-all shadow-2xs group flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-extrabold text-slate-800 group-hover:text-amber-900 leading-snug">
                        {item.q}
                      </span>
                    </div>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-amber-700 shrink-0">
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat History Log */}
            {messages.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200/80">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Reasoning Conversation
                </p>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`text-xs leading-relaxed p-3.5 rounded-2xl shadow-2xs transition-all ${
                      m.role === "user"
                        ? "bg-slate-900 text-white font-bold ml-6"
                        : "bg-white text-slate-900 font-medium border border-slate-200/90 mr-4"
                    }`}
                  >
                    <span className="font-black text-[10px] uppercase tracking-wider block mb-1 opacity-70">
                      {m.role === "user" ? "👤 You" : "🤖 Sentinel AI"}
                    </span>
                    {m.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Input Bar */}
          <form onSubmit={handleCustomSubmit} className="p-3 bg-white border-t border-slate-200/90 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shrink-0 font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}