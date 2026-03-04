import { motion } from 'framer-motion';
import { PenTool, Megaphone, Laptop, Film, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MagneticWrapper } from '../components/MagneticWrapper';
import { RevealLine, RevealWords } from '../components/TextReveal';
import { useTranslation } from 'react-i18next';

const icons = [Megaphone, PenTool, Laptop, Film, Palette];

export function Services() {
    const { t } = useTranslation();
    const servicesList = t('services.list', { returnObjects: true }) as any[];

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-7 md:px-12 lg:px-20">

                {/* Header */}
                <div className="max-w-3xl mb-24">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-[hsl(var(--accent-red))]">{t('services.headerSubtitle')}</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 sm:mb-8">
                            <RevealWords text={t('services.headerTitle1')} delayOffset={0.2} /> <RevealLine delay={0.4}><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">{t('services.headerTitle2')}</span></RevealLine>
                        </h1>
                        <p className="text-xl text-white/60 leading-relaxed">
                            <RevealWords text={t('services.headerDesc')} delayOffset={0.6} />
                        </p>
                    </motion.div>
                </div>

                {/* Services List */}
                <div className="flex flex-col gap-12 lg:gap-24">
                    {servicesList.map((service, idx) => {
                        const Icon = icons[idx] || Megaphone;
                        const isEven = idx % 2 === 0;
                        return (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
                            >
                                {/* Visual Placeholder */}
                                <div className="w-full lg:w-1/2 aspect-[3/2] sm:aspect-square md:aspect-[4/3] rounded-3xl bg-zinc-900 border border-white/10 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-red))]/10 to-transparent mix-blend-overlay"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className="w-24 h-24 sm:w-32 sm:h-32 text-white/5 transition-transform duration-700 group-hover:scale-110 group-hover:text-white/10 group-hover:rotate-6" strokeWidth={1} />
                                    </div>
                                    {/* Subtle red glow on hover */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[hsl(var(--accent-red))] rounded-full blur-[120px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                                </div>

                                {/* Content */}
                                <div className="w-full lg:w-1/2">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-8 text-[hsl(var(--accent-red))] shadow-[0_0_15px_hsl(var(--accent-red)/0.2)]">
                                        <Icon size={28} />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">{service.title}</h2>
                                    <p className="text-lg text-white/60 mb-10 leading-relaxed">
                                        {service.description}
                                    </p>

                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {service.points.map((point: string) => (
                                            <li key={point} className="flex items-center gap-3 text-white/80">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></div>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-12">
                                        <MagneticWrapper>
                                            <Link to="/contact" className="inline-flex items-center gap-2 group text-sm font-medium uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                                                {t('services.discussService')}
                                                <span className="w-8 h-px bg-white/20 group-hover:bg-white group-hover:w-12 transition-all duration-300"></span>
                                            </Link>
                                        </MagneticWrapper>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </main>
    );
}
