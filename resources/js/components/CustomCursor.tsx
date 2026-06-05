import { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Add class active on hover
        const addActiveHover = () => setIsHovered(true);
        const removeActiveHover = () => setIsHovered(false);

        const attachHoverListeners = () => {
            const targets = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
            targets.forEach((target) => {
                target.addEventListener('mouseenter', addActiveHover);
                target.addEventListener('mouseleave', removeActiveHover);
            });
        };

        attachHoverListeners();

        // Re-attach listeners on DOM mutations
        const observer = new MutationObserver(attachHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            observer.disconnect();
        };
    }, []);

    // Ring delayed follower logic (smooth lag)
    useEffect(() => {
        let frameId: number;
        
        const updateRing = () => {
            setRingPosition((prev) => {
                const dx = position.x - prev.x;
                const dy = position.y - prev.y;
                const ease = 0.15; // smoothness factor
                return {
                    x: prev.x + dx * ease,
                    y: prev.y + dy * ease,
                };
            });
            frameId = requestAnimationFrame(updateRing);
        };

        frameId = requestAnimationFrame(updateRing);
        return () => cancelAnimationFrame(frameId);
    }, [position]);

    if (!isVisible) return null;

    return (
        <div className={`pointer-events-none fixed inset-0 z-[99999] hidden lg:block ${isHovered ? 'cursor-active' : ''}`}>
            <div
                className="custom-cursor-dot"
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
            />
            <div
                className="custom-cursor-ring"
                style={{ left: `${ringPosition.x}px`, top: `${ringPosition.y}px` }}
            />
        </div>
    );
}
