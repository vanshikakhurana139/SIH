import logoImg from "../../assets/logo.png";

export default function NavBar({ onEnterCommandCenter }) {
  return (
    <nav className="landing-nav" role="navigation">
      <div className="max-w-[1400px] mx-auto px-8 h-[68px] flex items-center justify-between">
        {/* Left — Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Sentinel Logo"
            className="w-9 h-9 rounded-xl shrink-0 shadow-xs object-contain bg-white"
            style={{ boxShadow: "0 3px 12px rgba(184,150,62,0.35)" }}
          />
          <div className="leading-tight">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-fg">Autonomous Incident Orchestration</p>
          </div>
        </div>


        {/* Right — CTA */}
        <button
          onClick={onEnterCommandCenter}
          className="gold-btn px-5 py-2.5 text-[12px] font-bold tracking-wide flex items-center gap-2"
          id="nav-enter-cmd"
        >
          Enter Command Center
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M8 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
