import { useState, useRef, useEffect } from "react";

const POWERPLANT_NODES = [
  { id: "turbine_temp",        label: "Turbine 03",  x: 50,  y: 38, r: 20, symbol: "⚙" },
  { id: "coolant_pressure",    label: "Coolant Sys", x: 22,  y: 55, r: 14, symbol: "🌡" },
  { id: "generator_vibration", label: "Generator",   x: 74,  y: 60, r: 14, symbol: "⚡" },
  { id: "_grid",               label: "Grid Tie",    x: 50,  y: 75, r: 10, symbol: "◈" },
  { id: "_control",            label: "Control Rm",  x: 18,  y: 32, r: 10, symbol: "⊕" },
  { id: "_steam",              label: "Steam Gen",   x: 78,  y: 28, r: 10, symbol: "♨" },
];

const HOSPITAL_NODES = [
  { id: "heart_rate",  label: "Cardiac ICU",   x: 50, y: 30, r: 20, symbol: "♥" },
  { id: "spo2",        label: "Pulse Ox",      x: 22, y: 55, r: 14, symbol: "🫁" },
  { id: "systolic_bp", label: "BP Monitor",    x: 74, y: 52, r: 14, symbol: "⊕" },
  { id: "_er",         label: "Emergency",     x: 50, y: 70, r: 10, symbol: "+" },
  { id: "_radiology",  label: "Radiology",     x: 18, y: 38, r: 10, symbol: "○" },
  { id: "_icu",        label: "ICU Beds",      x: 80, y: 32, r: 10, symbol: "■" },
];

const PHOTO = {
  powerplant: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&q=75&fit=crop",
  hospital:   "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=75&fit=crop",
};

function NodeTooltip({ node, incident }) {
  const isActive = incident?.source === node.id;
  return (
    <div className="telemetry-badge min-w-[130px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-fg-subtle mb-1">{node.label}</p>
      {isActive ? (
        <>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="live-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#B84040", display: "inline-block" }} />
            <span className="text-[10px] font-mono font-bold text-critical" style={{ color: "#B84040" }}>ALERT</span>
          </div>
          <p className="text-[13px] font-bold font-mono text-fg">{incident.sensor_value} <span className="text-[10px] text-fg-subtle font-normal">live</span></p>
          <p className="text-[10px] text-fg-subtle">Threshold: {incident.threshold}</p>
        </>
      ) : (
        <p className="text-[12px] font-mono text-positive font-semibold" style={{ color: "#2D7A5A" }}>● Nominal</p>
      )}
    </div>
  );
}

export default function Environment3D({ scenario = "powerplant", incident }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const nodes = scenario === "hospital" ? HOSPITAL_NODES : POWERPLANT_NODES;
  const photo = PHOTO[scenario];
  const activeSource = incident?.source;

  function handleMouseDown(e) {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }
  function handleMouseMove(e) {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setRotation((r) => ({
      x: Math.max(-15, Math.min(15, r.x - dy * 0.3)),
      y: Math.max(-20, Math.min(20, r.y + dx * 0.3)),
    }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }
  function handleMouseUp() {
    isDraggingRef.current = false;
    setIsDragging(false);
  }

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className="ivory-card overflow-hidden relative rounded-3xl border border-slate-200/80 shadow-sm" style={{ minHeight: 480 }}>
      {/* 3D Scene */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
        style={{ minHeight: 480 }}
      >
        {/* Photo background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out"
          style={{
            backgroundImage: `url(${photo})`,
            transform: `scale(${zoom * 1.05})`,
            filter: "brightness(0.92) contrast(1.05) saturate(0.85)",
          }}
        />

        {/* Warm overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(250,248,244,0.55) 0%, rgba(250,248,244,0.20) 50%, rgba(250,248,244,0.45) 100%)" }}
        />

        {/* 3D perspective scene */}
        <div
          className="absolute inset-0"
          style={{
            perspective: "900px",
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? "none" : "transform 0.5s ease",
          }}
        >
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {nodes.slice(1).map((node) => (
              <line
                key={node.id}
                x1={nodes[0].x} y1={nodes[0].y}
                x2={node.x} y2={node.y}
                stroke={activeSource === node.id ? "rgba(184,150,62,0.6)" : "rgba(184,150,62,0.25)"}
                strokeWidth="0.4"
                strokeDasharray="2 2"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="2s" repeatCount="indefinite" />
              </line>
            ))}
            {/* Pulse circles for active node */}
            {nodes.filter(n => n.id === activeSource).map(n => (
              <circle key={n.id + "-pulse"} cx={n.x} cy={n.y} r={n.r / 10 + 5} fill="none" stroke="rgba(184,150,62,0.4)" strokeWidth="0.5">
                <animate attributeName="r" values={`${n.r/10 + 2};${n.r/10 + 8};${n.r/10 + 2}`} dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
              </circle>
            ))}
          </svg>

          {/* Node circles (absolute positioned via % coordinates) */}
          {nodes.map((node) => {
            const isActive = node.id === activeSource;
            const isHovered = hoveredNode === node.id;
            return (
              <div
                key={node.id}
                className="absolute env-node"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Circle */}
                <div
                  className="flex items-center justify-center rounded-full transition-all duration-200 border"
                  style={{
                    width: node.r * 2,
                    height: node.r * 2,
                    background: isActive
                      ? "rgba(184,64,64,0.18)"
                      : isHovered
                        ? "rgba(184,150,62,0.18)"
                        : "rgba(255,255,255,0.70)",
                    borderColor: isActive
                      ? "rgba(184,64,64,0.65)"
                      : isHovered
                        ? "rgba(184,150,62,0.65)"
                        : "rgba(255,255,255,0.80)",
                    boxShadow: isActive
                      ? "0 0 0 4px rgba(184,64,64,0.15)"
                      : isHovered
                        ? "0 0 0 4px rgba(184,150,62,0.15)"
                        : "0 2px 8px rgba(26,22,18,0.12)",
                    backdropFilter: "blur(4px)",
                    fontSize: Math.max(10, node.r * 0.8),
                  }}
                >
                  {node.symbol}
                </div>

                {/* Label */}
                <p
                  className="absolute top-full mt-1 left-1/2 text-[8.5px] font-bold font-mono whitespace-nowrap"
                  style={{
                    transform: "translateX(-50%)",
                    color: isActive ? "#B84040" : isHovered ? "#B8963E" : "rgba(255,255,255,0.85)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  {node.label}
                </p>

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute pointer-events-none z-20"
                    style={{
                      bottom: "calc(100% + 10px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <NodeTooltip node={node} incident={incident} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <p className="text-[9px] text-fg-subtle/50 font-mono text-center py-1.5 border-t border-border-subtle">
        DRAG TO ROTATE · HOVER FOR TELEMETRY
      </p>
    </div>
  );
}
