import NavBar from "./NavBar";
import HeroSection from "./HeroSection";
import EnvironmentsSection from "./EnvironmentsSection";
import StorySection from "./StorySection";
import CommandCenterEntry from "./CommandCenterEntry";

export default function LandingPage({ stats, onEnter, onSelectEnvironment }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-ivory)" }}>
      <NavBar onEnterCommandCenter={onEnter} />
      <HeroSection stats={stats} onEnterCommandCenter={onEnter} />
      <EnvironmentsSection onSelectEnvironment={onSelectEnvironment} />
      <StorySection />
      <CommandCenterEntry onEnter={onEnter} />

      {/* Footer */}
      <footer className="border-t border-border-subtle py-10 px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[12px]"
              style={{ background: "linear-gradient(135deg, #B8963E, #D4AF70)" }}
            >
              S
            </div>
            <span className="text-[12px] font-bold uppercase tracking-widest text-fg-subtle">Sentinel</span>
          </div>
          <p className="text-[11px] text-fg-subtle font-mono">
            AI Incident Orchestration · v0.4 · Backend: FastAPI + SQLite
          </p>
        </div>
      </footer>
    </div>
  );
}
