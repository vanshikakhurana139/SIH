import { useState } from "react";

const QUESTIONS = [
  { q: "Why did you suggest this?", key: "why" },
  { q: "How confident are you?", key: "confidence" },
  { q: "What if I do nothing?", key: "ignore" },
  { q: "Can this be undone?", key: "undo" },
];

function answerFor(key, incident) {
  if (!incident) return "There's no active incident to discuss right now.";
  switch (key) {
    case "why":
      return incident.evidence;
    case "confidence":
      return `I'm ${incident.confidence}% confident in this diagnosis, based on how far the reading is past threshold and this rule's track record.`;
    case "ignore":
      return incident.crystal_ball?.if_ignored || "No projection available.";
    case "undo":
      return incident.reversible
        ? `Yes - rollback plan: ${incident.rollback_plan.join("; ")}`
        : "No - this action is classified irreversible and requires manual sign-off.";
    default:
      return "I don't have an answer for that yet.";
  }
}

export default function AskSystemChat({ incident }) {
  const [messages, setMessages] = useState([]);

  function ask(key, label) {
    const answer = answerFor(key, incident);
    setMessages((m) => [...m, { role: "user", text: label }, { role: "system", text: answer }]);
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold mb-3">Ask the System</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {QUESTIONS.map((item) => (
          <button
            key={item.key}
            onClick={() => ask(item.key, item.q)}
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold text-fg-muted border border-border hover:border-accent hover:text-fg transition-colors"
          >
            {item.q}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-[12px] text-fg-subtle">
            Ask a question above - answers pull straight from the Reasoning Engine, zero API cost.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-[13px] leading-relaxed px-3 py-2 rounded-xl ${
              m.role === "user" ? "bg-surface-raised text-fg-muted" : "bg-accent/10 text-fg border border-accent/20"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}