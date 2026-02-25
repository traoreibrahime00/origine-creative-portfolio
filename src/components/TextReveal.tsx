import { motion } from 'framer-motion';

export function RevealLine({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
    return (
        <span className="inline-block overflow-hidden" style={{ verticalAlign: 'top' }}>
            <motion.span
                className="inline-block"
                initial={{ y: '100%', opacity: 0, rotate: 2 }}
                whileInView={{ y: '0%', opacity: 1, rotate: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                    duration: 0.8,
                    delay: delay,
                    ease: [0.16, 1, 0.3, 1], // Custom awwwards spring-like ease
                }}
            >
                {children}
            </motion.span>
        </span>
    );
}

export function RevealWords({ text, className = "", delayOffset = 0 }: { text: string, className?: string, delayOffset?: number }) {
    const words = text.split(" ");

    return (
        <span className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
            {words.map((word, idx) => (
                <span key={idx} className="inline-block overflow-hidden pb-1" style={{ verticalAlign: 'top' }}>
                    <motion.span
                        className="inline-block"
                        initial={{ y: '100%', opacity: 0 }}
                        whileInView={{ y: '0%', opacity: 1 }}
                        viewport={{ once: true, margin: '0px' }}
                        transition={{
                            duration: 0.8,
                            delay: delayOffset + idx * 0.04,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </span>
    );
}
