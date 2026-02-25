import { motion } from 'framer-motion';
import { ArrowUpRight, PenTool, Megaphone, Layout, Film, Globe, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumReveal } from '../components/PremiumReveal';
import { MagneticWrapper } from '../components/MagneticWrapper';

const expertiseIcons = [
    { name: 'Branding', icon: PenTool },
    { name: 'Stratégie', icon: Megaphone },
    { name: 'UI/UX', icon: Layout },
    { name: 'Motion', icon: Film },
    { name: 'Web', icon: Globe },
    { name: 'Identité', icon: Camera },
];

export function Home() {
    return (
        <main className="min-h-screen text-white selection:bg-[hsl(var(--accent-red))] selection:text-white relative">
            <PremiumReveal />
            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Abstract shapes / gradients for hero background if video not found */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/50 via-zinc-900/30 to-black/50 pointer-events-none">
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[hsl(var(--accent-red))]/20 rounded-full blur-[128px]"></div>
                    <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[hsl(var(--accent-red))]/10 rounded-full blur-[128px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl w-full px-7 md:px-12 lg:px-20 mx-auto mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                            <span className="uppercase text-xs tracking-[0.2em] font-medium text-[hsl(var(--accent-red))] text-glow">Agence créative africaine</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-6">
                            Nous créons des marques qui <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">marquent.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-10">
                            Origine Creative. L'agence africaine spécialisée en stratégie de marque, identité visuelle, communication digitale et motion design.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-10">
                            <MagneticWrapper>
                                <Link to="/projets" className="group rounded-full bg-white text-black px-8 py-4 flex items-center gap-4 w-full sm:w-auto justify-center transition-all hover:bg-[hsl(var(--accent-red))] hover:text-white hover:shadow-[0_0_30px_hsl(var(--accent-red)/0.5)]">
                                    <span className="font-semibold">Voir nos projets</span>
                                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center transition-colors">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </Link>
                            </MagneticWrapper>
                            <MagneticWrapper>
                                <Link to="/a-propos" className="group rounded-full border border-white/20 bg-white/5 text-white px-8 py-4 w-full sm:w-auto text-center transition-colors hover:bg-white/10 hover:border-white/40">
                                    Découvrir l'agence
                                </Link>
                            </MagneticWrapper>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Expertise Section */}
            <section className="py-24 px-7 md:px-12 lg:px-20 max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center mb-20">
                    <div className="inline-flex rounded-full border border-[hsl(var(--accent-red))]/30 bg-[hsl(var(--accent-red))]/10 px-4 py-1.5 uppercase tracking-widest text-[10px] sm:text-xs font-semibold text-[hsl(var(--accent-red))] mb-8">
                        Notre Expertise
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Stratégie. Design. Impact.</h2>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Nous allions réflexion stratégique et excellence créative pour construire des identités mémorables qui résonnent avec leur époque.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
                    {expertiseIcons.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm flex flex-col items-center gap-4 hover:border-[hsl(var(--accent-red))]/30 hover:bg-white/[0.04] transition-all cursor-pointer"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[hsl(var(--accent-red))] rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                    <Icon className="text-white/50 group-hover:text-[hsl(var(--accent-red))] transition-colors relative z-10" size={32} strokeWidth={1.5} />
                                </div>
                                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{item.name}</span>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-6">
                    {['Branding', 'Communication Digitale', 'Direction Artistique'].map((category, idx) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link to="/services" className="group flex items-center justify-between border-b border-white/10 pb-8 hover:border-[hsl(var(--accent-red))]/50 transition-colors">
                                <h3 className="text-4xl md:text-6xl font-medium text-white/50 group-hover:text-white transition-colors tracking-tight">
                                    <span className="text-sm align-top mr-4 text-white/30 group-hover:text-[hsl(var(--accent-red))]">0{idx + 1}</span>
                                    {category}
                                </h3>
                                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-[hsl(var(--accent-red))] border-none text-white">
                                    <ArrowUpRight size={24} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <MagneticWrapper>
                        <Link to="/services" className="inline-flex rounded-full border border-white/20 px-8 py-3 text-sm font-medium hover:bg-white hover:text-black transition-colors">
                            Explorer nos services
                        </Link>
                    </MagneticWrapper>
                </motion.div>
            </section>

            {/* Featured Projects Preview */}
            <section className="py-24 px-7 md:px-12 lg:px-20 max-w-7xl mx-auto relative">
                <div className="flex items-end justify-between mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-8 bg-white/40"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-white/60">Sélection</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Derniers projets</h2>
                    </div>
                    <Link to="/projets" className="hidden md:flex items-center gap-2 group text-sm font-medium uppercase tracking-widest hover:text-[hsl(var(--accent-red))] transition-colors">
                        Voir tout
                        <ArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map((item) => (
                        <motion.div
                            key={item}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-zinc-900 border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-70"></div>
                            {/* Optional image placeholder */}
                            <div className="absolute inset-0 bg-[hsl(var(--accent-red))]/5 transition-transform duration-700 group-hover:scale-105 flex items-center justify-center">
                                <Layout size={64} className="text-white/10 group-hover:text-[hsl(var(--accent-red))]/30 transition-colors" />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform">
                                <div>
                                    <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest font-medium mb-3 border border-white/10 text-[hsl(var(--accent-red))]">
                                        Identité
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight">Projet Équinoxe</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* About Preview */}
            <section className="py-24 px-7 md:px-12 lg:px-20 max-w-7xl mx-auto relative overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-square rounded-full border border-white/5 absolute -top-10 -left-10 w-64 h-64"></div>
                        <div className="aspect-square rounded-full border border-white/5 absolute -bottom-10 -right-10 w-80 h-80"></div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-white/40"></div>
                                <span className="uppercase text-xs tracking-widest font-medium text-white/60">Notre Philosophie</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                                Nous créons à <br /> l'intersection de <br /> <span className="text-[hsl(var(--accent-red))] text-glow italic font-serif">l'art</span> et de la <span className="text-white/50">stratégie.</span>
                            </h2>
                            <p className="text-lg text-white/60 max-w-md leading-relaxed">
                                Origine Creative puise son inspiration dans l'authenticité de la culture africaine tout en appliquant les standards de design internationaux les plus exigeants.
                            </p>
                            <Link to="/a-propos" className="inline-flex items-center gap-2 group text-sm font-medium uppercase tracking-widest hover:text-[hsl(var(--accent-red))] transition-colors">
                                Découvrir notre approche
                                <ArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                        <div className="w-full max-w-md aspect-[4/5] rounded-[3rem] bg-zinc-900 border border-white/10 relative overflow-hidden shadow-2xl shadow-black">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                            {/* Abstract shape placeholders instead of actual images */}
                            <div className="absolute top-10 right-10 w-32 h-32 bg-[hsl(var(--accent-red))] rounded-full blur-[80px] opacity-30"></div>
                            <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-[100px] opacity-10"></div>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-white/20 p-8 text-center">
                                <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-[hsl(var(--accent-red))] font-serif italic text-4xl">O</span>
                                </div>
                                <p className="tracking-widest uppercase text-xs">shape-1.png / shape-2.png / shape-3.png</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden flex items-center justify-center min-h-[60vh]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-7 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
                    >
                        Prêt à donner vie à votre <span className="text-[hsl(var(--accent-red))] text-glow">vision ?</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-white/60 mb-12 max-w-2xl mx-auto"
                    >
                        Contactez-nous pour discuter de votre prochain projet et découvrir comment nous pouvons vous aider à atteindre vos objectifs.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center"
                    >
                        <MagneticWrapper>
                            <Link to="/contact" className="inline-flex items-center gap-4 bg-[hsl(var(--accent-red))] text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-[0_0_40px_hsl(var(--accent-red)/0.6)] hover:scale-105 transition-all">
                                Démarrer un projet
                                <div className="bg-white text-[hsl(var(--accent-red))] w-10 h-10 rounded-full flex items-center justify-center pl-0.5 pt-0.5">
                                    <ArrowUpRight strokeWidth={3} />
                                </div>
                            </Link>
                        </MagneticWrapper>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
