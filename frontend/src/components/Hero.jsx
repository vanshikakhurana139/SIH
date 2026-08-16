import { useState, useRef } from "react";
import heroImage from "../assets/hero.png";

export default function Hero({ onEnter }) {
    const [exiting, setExiting] = useState(false);
    const triggered = useRef(false);

    function handleEnter() {
        if (triggered.current) return;
        triggered.current = true;
        setExiting(true);
        setTimeout(onEnter, 550); // let the fade play before swapping to the dashboard
    }

    return (
        <div
            className={`hero-screen ${exiting ? "hero-exiting" : ""}`}
            onWheel={(e) => { if (e.deltaY > 0) handleEnter(); }}
        >
            <div className="hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
            <div className="hero-overlay" />
            <div className="hero-content">
                <p className="hero-eyebrow">AI Incident Orchestration</p>
                <h1 className="hero-title">
                    From signal<br />to decision<br />to action.
                </h1>
                <p className="hero-subtitle">
                    One intelligent command center for detecting, understanding and
                    responding to critical incidents.
                </p>
                <button className="hero-cta" onClick={handleEnter}>
                    Enter Command Center
                </button>
                <p className="hero-scroll-hint">Scroll to explore ↓</p>
            </div>
        </div>
    );
}