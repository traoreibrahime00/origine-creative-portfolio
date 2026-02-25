import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Preloader() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let currentProgress = 0;
        const totalDuration = 1500; // 1.5 seconds loading simulation
        const intervalTime = 30;
        const step = (100 * intervalTime) / totalDuration;

        const interval = setInterval(() => {
            currentProgress += step;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setTimeout(() => setIsVisible(false), 400); // hold for a tiny bit before fading
            }
            setProgress(Math.floor(currentProgress));
        }, intervalTime);

        // Fail-safe to remove overflow hidden from body
        return () => {
            clearInterval(interval);
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Prevent body scroll while preloading
    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 0 }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} // smooth, slide up awwwards style
                    className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center pointer-events-auto"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-4">
                        <div className="overflow-hidden inline-block border-b border-white/20 pb-4 mb-4">
                            <motion.span
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="inline-block text-[hsl(var(--accent-red))] text-xs font-bold tracking-[0.3em] uppercase"
                            >
                                Chargement de l'expérience
                            </motion.span>
                        </div>

                        <div className="text-6xl md:text-8xl lg:text-[9rem] font-bold text-white tracking-tighter flex justify-center items-end" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {progress} <span className="text-2xl md:text-4xl text-[hsl(var(--accent-red))] mb-2 md:mb-6 ml-2">%</span>
                        </div>

                        <div className="w-full max-w-[200px] h-[2px] bg-white/10 mx-auto mt-12 rounded-full overflow-hidden relative">
                            <motion.div
                                className="absolute top-0 left-0 bottom-0 bg-[hsl(var(--accent-red))]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1, ease: "linear" }}
                            />
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-white/30 text-[10px] uppercase tracking-widest"
                        >
                            Origine Creative
                        </motion.span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
