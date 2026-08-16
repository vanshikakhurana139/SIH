import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to any element, and a boolean that flips to true
 * the first time that element scrolls into view. No animation library —
 * just the browser's native IntersectionObserver.
 */
export function useScrollReveal(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(node); // animate in once, don't repeat on scroll-back
                }
            },
            { threshold }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, visible];
}