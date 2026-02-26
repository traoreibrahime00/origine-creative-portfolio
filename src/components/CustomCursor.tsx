import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [cursorText, setCursorText] = useState<string | null>(null);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 800, mass: 0.05 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check for specific cursor text data attribute
            const overrideElement = target.closest('[data-cursor]');
            if (overrideElement) {
                setCursorText(overrideElement.getAttribute('data-cursor'));
                setIsHovered(true);
                return;
            } else {
                setCursorText(null);
            }

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
                className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[hsl(var(--accent-red))] pointer-events-none z-[9999] mix-blend-screen hidden md:flex items-center justify-center transition-[width,height,background-color,border-color,box-shadow,color] duration-300 font-bold tracking-widest text-[10px] ${cursorText ? 'w-24 h-24 text-white bg-[hsl(var(--accent-red))] border-transparent shadow-[0_0_30px_hsl(var(--accent-red)/0.5)]' : 'w-8 h-8'}`}
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    scale: isHovered && !cursorText ? 1.8 : 1, // Only scale if it's a normal hover without text
                    backgroundColor: isHovered && !cursorText ? 'rgba(229, 77, 53, 0.4)' : (cursorText ? 'rgba(229, 77, 53, 0.9)' : 'transparent'),
                    boxShadow: isHovered && !cursorText ? '0 0 20px 5px rgba(229, 77, 53, 0.3)' : 'none',
                }}
            >
                {cursorText ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white mix-blend-normal z-10">{cursorText}</motion.span>
                ) : (
                    <div
                        className={`w-1 h-1 bg-[hsl(var(--accent-red))] rounded-full transition-all duration-300 ${isHovered ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
                    />
                )}
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
