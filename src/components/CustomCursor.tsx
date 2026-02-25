import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400, mass: 0.1 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                window.getComputedStyle(target).cursor === 'pointer'
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[hsl(var(--accent-red))] pointer-events-none z-[9999] mix-blend-screen hidden md:flex items-center justify-center transition-colors duration-300"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    scale: isHovered ? 1.8 : 1,
                    backgroundColor: isHovered ? 'rgba(229, 77, 53, 0.4)' : 'transparent',
                    boxShadow: isHovered ? '0 0 20px 5px rgba(229, 77, 53, 0.3)' : 'none',
                }}
            >
                <div
                    className={`w-1 h-1 bg-[hsl(var(--accent-red))] rounded-full transition-all duration-300 ${isHovered ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
                />
            </motion.div>
            <style>{`
                @media (pointer: fine) {
                    body, a, button, input, select, textarea, [role="button"], .cursor-pointer { 
                        cursor: none !important; 
                    }
                }
            `}</style>
        </>
    );
}
