const PLANT_PHOTO = "https://images.unsplash.com/photo-1539185441755-769473a23570?w=900&q=80&fit=crop";
const HOSPITAL_PHOTO = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80&fit=crop";

function PlantIsometric() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full opacity-90">
      <g stroke="rgba(184,150,62,0.55)" strokeWidth="1" fill="none">
        <polygon points="50,80 110,50 170,80 110,110" fill="rgba(184,150,62,0.07)" />
        <polygon points="110,50 170,80 170,60 110,30" fill="rgba(184,150,62,0.05)" />
        <polygon points="50,80 110,110 110,90 50,60" fill="rgba(184,150,62,0.04)" />
        <line x1="110" y1="30" x2="110" y2="10" strokeDasharray="3 3" />
        <line x1="90" y1="35" x2="90" y2="15" strokeDasharray="3 3" />
        <line x1="130" y1="35" x2="130" y2="15" strokeDasharray="3 3" />
        <circle cx="110" cy="80" r="8" fill="rgba(184,150,62,0.15)" stroke="rgba(184,150,62,0.7)" strokeWidth="1.5">
          <animate attributeName="r" values="8;11;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="70" cy="85" r="5" fill="rgba(255,255,255,0.5)" stroke="rgba(180,160,120,0.5)" />
        <circle cx="150" cy="75" r="5" fill="rgba(255,255,255,0.5)" stroke="rgba(180,160,120,0.5)" />
        <line x1="70" y1="85" x2="110" y2="80" strokeDasharray="3 3" />
        <line x1="110" y1="80" x2="150" y2="75" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

function HospitalIsometric() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full opacity-90">
      <g stroke="rgba(45,122,90,0.5)" strokeWidth="1" fill="none">
        <rect x="55" y="55" width="110" height="70" rx="4" fill="rgba(45,122,90,0.06)" />
        <rect x="75" y="40" width="70" height="20" rx="3" fill="rgba(45,122,90,0.05)" />
        <line x1="110" y1="35" x2="110" y2="15" strokeDasharray="3 3" />
        <circle cx="80" cy="90" r="6" fill="rgba(45,122,90,0.12)" stroke="rgba(45,122,90,0.6)">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="140" cy="90" r="6" fill="rgba(45,122,90,0.12)" stroke="rgba(45,122,90,0.6)">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="110" cy="110" r="6" fill="rgba(45,122,90,0.12)" stroke="rgba(45,122,90,0.6)">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <path d="M103 90h14M110 83v14" stroke="rgba(45,122,90,0.8)" strokeWidth="1.5" />
        <line x1="80" y1="90" x2="110" y2="90" strokeDasharray="3 3" />
        <line x1="110" y1="90" x2="140" y2="90" strokeDasharray="3 3" />
        <line x1="110" y1="90" x2="110" y2="110" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

function EnvironmentCard({ title, subtitle, photo, isometric: Isometric, accent, onClick, id }) {
  return (
    <div
      className="env-card cursor-pointer group flex-1"
      onClick={onClick}
      id={id}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Photo */}
      <div className="overflow-hidden h-[200px] relative">
        <img
          src={photo}
          alt={title}
          className="env-card-photo"
          loading="lazy"
        />
        {/* Isometric overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-full h-full p-6">
            <Isometric />
          </div>
        </div>
        {/* Gradient bottom */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="font-bold text-[17px] text-fg mb-0.5">{title}</p>
        <p className="text-[12px] text-fg-subtle mb-5">{subtitle}</p>
        <button
          className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
          style={{ color: accent }}
        >
          Explore {title}
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M8 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function EnvironmentsSection({ onSelectEnvironment }) {
  return (
    <section className="py-28 bg-ivory" id="environments">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header row */}
        <div className="flex items-start justify-between mb-16 gap-12">
          <div className="max-w-[360px]">
            <h2 className="font-display text-[42px] leading-tight text-fg" style={{ letterSpacing: "-0.01em" }}>
              One intelligence layer.<br />
              Every critical<br />
              environment.
            </h2>
          </div>
          <div className="max-w-[320px] pt-2">
            <p className="text-[15px] text-fg-muted leading-relaxed">
              Different environments. Same intelligence. Choose an environment to explore the Sentinel experience.
            </p>
          </div>
        </div>

        {/* Environment cards */}
        <div className="flex gap-6">
          <EnvironmentCard
            id="env-card-powerplant"
            title="Power Plant"
            subtitle="Industrial Infrastructure"
            photo={PLANT_PHOTO}
            isometric={PlantIsometric}
            accent="#B8963E"
            onClick={() => onSelectEnvironment("powerplant")}
          />
          <EnvironmentCard
            id="env-card-hospital"
            title="Hospital"
            subtitle="Healthcare Infrastructure"
            photo={HOSPITAL_PHOTO}
            isometric={HospitalIsometric}
            accent="#2D7A5A"
            onClick={() => onSelectEnvironment("hospital")}
          />
        </div>
      </div>
    </section>
  );
}
