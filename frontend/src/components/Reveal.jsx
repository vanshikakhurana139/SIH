import { useScrollReveal } from "../hooks/useScrollReveal";

/**
 * Wrap any existing component with <Reveal> to make it fade/rise into view
 * on scroll. Doesn't touch the wrapped component's own logic or props.
 */
export default function Reveal({ children, delay = 0, className = "" }) {
    const [ref, visible] = useScrollReveal();

    return (
        <div
            ref={ref}
            className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
            style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
        >
            {children}
        </div>
    );
}