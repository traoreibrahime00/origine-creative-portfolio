import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 30,
        filter: 'blur(10px)',
    },
    in: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
    },
    out: {
        opacity: 0,
        y: -30,
        filter: 'blur(10px)',
    }
};

const pageTransition = {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1] as const,
};

export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
