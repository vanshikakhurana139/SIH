export default function NavBar({ onEnterCommandCenter }) {
  return (
    <nav className="landing-nav" role="navigation">
      <div className="max-w-[1400px] mx-auto px-8 h-[68px] flex items-center justify-between">
        {/* Left — Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-[15px] shrink-0"
            style={{ background: "linear-gradient(135deg, #B8963E, #D4AF70)", boxShadow: "0 3px 12px rgba(184,150,62,0.35)" }}
          >
            S
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-fg">AI Incident Orchestration</p>
          </div>
        </div>

        {/* Center — Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {["Product", "Environments", "Solutions", "Resources", "Company"].map((item) => (
            <button
              key={item}
              className="text-[13px] font-medium text-fg-muted hover:text-fg transition-colors flex items-center gap-1"
            >
              {item}
              {["Product", "Solutions", "Resources", "Company"].includes(item) && (
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
                  <path d="M2 4l4 4 4-4" />
                </svg>
              )}
            </button>
          ))}
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
