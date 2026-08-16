import { useState } from "react";
import { IconBolt } from "../icons";

const QUESTIONS = [
  { q: "Why did you suggest this?", key: "why" },
  { q: "How confident are you?", key: "confidence" },
  { q: "What if I do nothing?", key: "ignore" },
  { q: "Can this be undone?", key: "undo" },
];

function answerFor(key, incident) {
  if (!incident) return "There's no active incident to analyze right now. Run a simulation above to test AI reasoning.";
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
    default:
      return "Reasoning Engine output unavailable.";
  }
}

export default function AskSystemChat({ incident }) {
  const [messages, setMessages] = useState([]);

  function ask(key, label) {
    const answer = answerFor(key, incident);
    setMessages((m) => [...m, { role: "user", text: label }, { role: "system", text: answer }]);
  }

  return (
    <div className="dash-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10.5px] uppercase tracking-widest text-fg-subtle font-extrabold flex items-center gap-1.5">
          <IconBolt width={13} height={13} className="text-accent" />
          Ask Reasoning Engine
        </p>
        <span className="text-[9.5px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full font-bold border border-accent/20">
          Zero-Latency AI
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {QUESTIONS.map((item) => (
          <button
            key={item.key}
            onClick={() => ask(item.key, item.q)}
            className="px-3 py-1.5 rounded-xl text-[11.5px] font-bold text-fg-muted bg-white/70 border border-white/90 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all shadow-2xs"
          >
            {item.q}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="bg-white/40 border border-white/70 rounded-xl p-3 text-[11.5px] text-fg-subtle leading-relaxed font-medium">
            💡 Select any query above to fetch instant deterministic reasoning directly from the AI Inference Engine.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-[12px] leading-relaxed p-3 rounded-xl shadow-2xs transition-all ${
              m.role === "user"
                ? "bg-white/90 text-fg-muted font-bold border border-white"
                : "bg-gradient-to-r from-accent/10 to-accent-light/10 text-fg font-medium border border-accent/25"
            }`}
          >
            <span className="font-extrabold text-[10px] uppercase tracking-wider block mb-0.5 text-accent">
              {m.role === "user" ? "You" : "🤖 Reasoning Engine"}
            </span>
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}