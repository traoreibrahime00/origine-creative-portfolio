import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, PenTool, Megaphone, Layout, Film, Globe, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumReveal } from '../components/PremiumReveal';
import { useState, useEffect } from 'react';
import { MagneticWrapper } from '../components/MagneticWrapper';
import { RevealLine, RevealWords } from '../components/TextReveal';
import { ReelCarousel } from '../components/ReelCarousel';
import staticProjects from '../data/projects.json';
import { SEO } from '../components/SEO';
import { useTranslation } from 'react-i18next';

const expertiseIcons = [
    { name: 'Branding', icon: PenTool },
    { name: 'Stratégie', icon: Megaphone },
    { name: 'UI/UX', icon: Layout },
    { name: 'Motion', icon: Film },
    { name: 'Web', icon: Globe },
    { name: 'Identité', icon: Camera },
];

export function Home() {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<any[]>(staticProjects);

    useEffect(() => {

        fetch('/api/projects')
            .then(res => {
                const contentType = res.headers.get("content-type");
                if (res.ok && contentType && contentType.includes("application/json")) {
                    return res.json();
                }
                throw new Error("No JSON");
            })
            .then(data => {
                if (Array.isArray(data)) setProjects(data);
            })
            .catch(err => console.log('Using static projects', err));
    }, []);

    return (
        <main className="min-h-screen text-white selection:bg-[hsl(var(--accent-red))] selection:text-white relative">
            <SEO />
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
                            <span className="uppercase text-xs tracking-[0.2em] font-medium text-[hsl(var(--accent-red))] text-glow">{t('home.heroSubtitle')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-6">
                            <RevealWords text={t('home.heroTitle1')} delayOffset={0.2} />{' '}
                            <RevealLine delay={0.6}>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">{t('home.heroTitle2')}</span>
                            </RevealLine>
                            <br />
                            <RevealWords text={t('home.heroTitle3')} delayOffset={0.8} />
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-10">
                            <RevealWords
                                text={t('home.heroDesc')}
                                delayOffset={0.4}
                            />
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-10">
                            <MagneticWrapper>
                                <Link to="/contact" className="group rounded-full bg-[hsl(var(--accent-red))] text-white px-8 py-4 flex items-center gap-4 w-full sm:w-auto justify-center transition-all hover:bg-red-600 hover:shadow-[0_0_30px_hsl(var(--accent-red)/0.5)]">
                                    <span className="font-semibold">{t('home.heroCta')}</span>
                                    <div className="w-8 h-8 rounded-full bg-white text-[hsl(var(--accent-red))] flex items-center justify-center transition-colors">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </Link>
                            </MagneticWrapper>
                            <MagneticWrapper>
                                <Link to="/projets" className="group rounded-full border border-white/20 bg-white/5 text-white px-8 py-4 w-full sm:w-auto text-center transition-colors hover:bg-white/10 hover:border-white/40">
                                    Explorer nos cas clients
                                </Link>
                            </MagneticWrapper>
                        </div>
                    </motion.div>
                </div>

                {/* Trust Banner (Silent) */}
                <div className="absolute bottom-10 left-0 right-0 w-full flex flex-col items-center opacity-30 select-none hidden md:flex">
                    <p className="text-[10px] tracking-[0.3em] uppercase mb-4 text-white/70">Ils nous ont confié leur vision</p>
                    <div className="flex items-center gap-12 font-display text-2xl">
                        {/* Placeholder aesthetic logos/names */}
                        <span>AGRI BUILD</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        <span>ÉQUINOXE</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        <span>VANGUARD</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        <span>OMNIPRESENCE</span>
                    </div>
                </div>
            </section >

            {/* Expertise Section */}
            < section className="py-24 px-7 md:px-12 lg:px-20 max-w-7xl mx-auto" >
                <div className="flex flex-col items-center text-center mb-20">
                    <div className="inline-flex rounded-full border border-[hsl(var(--accent-red))]/30 bg-[hsl(var(--accent-red))]/10 px-4 py-1.5 uppercase tracking-widest text-[10px] sm:text-xs font-semibold text-[hsl(var(--accent-red))] mb-8">
                        {t('home.expertiseSubtitle')}
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6">{t('home.expertiseTitle')}</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
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
                    {['Identité & Stratégie de Marque', 'Communication Digitale', 'Production Audiovisuelle Premium'].map((category, idx) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link to="/services" className="group flex items-center justify-between border-b border-white/10 pb-6 sm:pb-8 hover:border-[hsl(var(--accent-red))]/50 transition-colors">
                                <h3 className="text-2xl sm:text-4xl md:text-6xl font-medium text-white/50 group-hover:text-white transition-colors tracking-tight">
                                    <span className="text-xs sm:text-sm align-top mr-2 sm:mr-4 text-white/30 group-hover:text-[hsl(var(--accent-red))]">0{idx + 1}</span>
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
            </section >

            {/* Process Section */}
            < section className="py-24 px-7 md:px-12 lg:px-20 max-w-7xl mx-auto border-t border-white/10" >
                <div className="flex flex-col items-center text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Notre Méthodologie</h2>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Une approche rigoureuse pour garantir l'impact et le ROI de chaque initiative créative.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: '1. Immersion & Stratégie', desc: "Analyse de votre écosystème, identification des leviers de croissance et définition d'un positionnement sur-mesure." },
                        { title: '2. Conception Créative', desc: "Traduction de la stratégie en identités visuelles fortes, narratives immersives et design d'expérience." },
                        { title: '3. Déploiement & Impact', desc: "Lancement, amplification digitale et suivi pour assurer une résonance maximale auprès de votre cible premium." },
                    ].map((step, idx) => (
                        <div key={idx} className="p-8 rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden group hover:border-[hsl(var(--accent-red))]/30 transition-colors cursor-pointer">
                            <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-[hsl(var(--accent-red))] transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                            <p className="text-white/60 leading-relaxed text-sm">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section >

            {/* Featured Projects Preview */}
            < section className="py-24 px-7 md:px-12 lg:px-20 max-w-7xl mx-auto relative" >
                <div className="flex items-end justify-between mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-8 bg-white/40"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-white/60">{t('home.projectsSubtitle')}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t('home.projectsTitle')}</h2>
                    </div>
                    <Link to="/projets" className="hidden md:flex items-center gap-2 group text-sm font-medium uppercase tracking-widest hover:text-[hsl(var(--accent-red))] transition-colors">
                        {t('nav.projects')}
                        <ArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.slice(0, 2).map((project) => (
                        <FeaturedProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </section >

            {/* About Preview */}
            < section className="py-24 px-7 md:px-12 lg:px-20 max-w-7xl mx-auto relative overflow-hidden" >
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-square rounded-full border border-white/5 absolute -top-10 -left-10 w-64 h-64"></div>
                        <div className="aspect-square rounded-full border border-white/5 absolute -bottom-10 -right-10 w-80 h-80"></div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-white/40"></div>
                                <span className="uppercase text-xs tracking-widest font-medium text-white/60">Notre Philosophie</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                                Nous créons à <br /> l'intersection de <br /> <span className="text-[hsl(var(--accent-red))] text-glow italic font-display">l'art</span> et de la <span className="text-white/50">stratégie.</span>
                            </h2>
                            <p className="text-base sm:text-lg text-white/60 max-w-md leading-relaxed">
                                Origine Creative puise son inspiration dans l'authenticité de la culture africaine tout en appliquant les standards de design internationaux les plus exigeants.
                            </p>
                            <Link to="/a-propos" className="inline-flex items-center gap-2 group text-sm font-medium uppercase tracking-widest hover:text-[hsl(var(--accent-red))] transition-colors">
                                Découvrir notre approche
                                <ArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative" data-cursor="Glisser">
                        <ReelCarousel />
                    </div>
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-32 relative overflow-hidden flex items-center justify-center min-h-[60vh]" >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-7 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 sm:mb-8"
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
            </section >
        </main >
    );
}

function FeaturedProjectCard({ project }: { project: any }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Create a subtle parallax effect on the Y axis for the image
    const yParallax = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-zinc-900 border border-white/10"
            data-cursor="Découvrir"
        >
            <Link to="/projets" className="absolute inset-0 z-30"></Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-70"></div>

            {project.imageUrl ? (
                <motion.img
                    style={{ y: yParallax, scale: 1.15 }} // Extra scale to prevent seeing edges when parallaxing
                    src={project.imageUrl}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover origin-center"
                />
            ) : (
                <div className="absolute inset-0 bg-[hsl(var(--accent-red))]/5 flex items-center justify-center">
                    <Layout size={64} className="text-white/10 group-hover:text-[hsl(var(--accent-red))]/30 transition-colors" />
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform">
                <div>
                    <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest font-medium mb-3 border border-white/10 text-[hsl(var(--accent-red))]">
                        {project.category}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{project.title}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight />
                </div>
            </div>
        </motion.div>
    );
}
