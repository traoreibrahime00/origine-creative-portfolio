import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { MagneticWrapper } from '../components/MagneticWrapper';

export function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--accent-red))]/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="relative z-10 text-center px-7">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none font-display">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="-mt-8 sm:-mt-12"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        Page introuvable
                    </h2>
                    <p className="text-white/60 text-lg max-w-md mx-auto mb-10">
                        La page que vous recherchez n'existe pas ou a été déplacée.
                    </p>

                    <MagneticWrapper>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-4 bg-[hsl(var(--accent-red))] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_hsl(var(--accent-red)/0.5)] hover:scale-105 transition-all"
                        >
                            Retour à l'accueil
                            <div className="bg-white text-[hsl(var(--accent-red))] w-8 h-8 rounded-full flex items-center justify-center">
                                <ArrowUpRight size={18} />
                            </div>
                        </Link>
                    </MagneticWrapper>
                </motion.div>
            </div>
        </main>
    );
}
