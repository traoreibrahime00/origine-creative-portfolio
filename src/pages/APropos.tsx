import { motion } from 'framer-motion';
import { RevealLine, RevealWords } from '../components/TextReveal';
import { useTranslation } from 'react-i18next';

export function APropos() {
    const { t } = useTranslation();

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-7 md:px-12 lg:px-20">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-[hsl(var(--accent-red))]">{t('about.headerSubtitle')}</span>
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight mb-6 sm:mb-8">
                            <RevealWords text={t('about.headerTitle1')} delayOffset={0.2} /> <RevealLine delay={0.4}><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">{t('about.headerTitle2')}</span></RevealLine><br />
                            <RevealWords text={t('about.headerTitle3')} delayOffset={0.6} />
                        </h1>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                    {/* Visual Side */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-[3/4] rounded-[2.5rem] bg-zinc-900 border border-white/10 relative overflow-hidden group">
                            {/* Abstract shapes representing African identity / creativity */}
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[hsl(var(--accent-red))] rounded-full blur-[100px] opacity-40"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-[120px] opacity-10"></div>

                            {/* Pattern placeholder */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent">
                                <p className="text-white/60 text-sm font-medium tracking-widest uppercase">Est. 2026 — Afrique</p>
                            </div>
                        </div>
                    </div>

                    {/* Text Side */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">
                            <RevealWords text={t('about.visionTitle')} delayOffset={0.2} />
                        </h2>

                        <div className="space-y-6 text-lg text-white/70 leading-relaxed font-light">
                            <p>
                                <RevealWords text={t('about.visionText1')} delayOffset={0.4} />
                            </p>
                            <p>
                                <strong className="text-white font-medium">{t('about.visionText2Bold')}</strong>{t('about.visionText2')}
                            </p>
                            <p>
                                {t('about.visionText3')}
                            </p>
                            <blockquote className="border-l-2 border-[hsl(var(--accent-red))] pl-6 mt-10 mb-4 py-2 opacity-90">
                                <p className="text-xl md:text-2xl font-display italic text-white/90 mb-4">{t('about.quoteText')}</p>
                                <footer className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--accent-red))]">{t('about.quoteAuthor')}</footer>
                            </blockquote>
                        </div>

                        <div className="mt-16 pt-16 border-t border-white/10">
                            <h3 className="text-xl font-medium mb-8 uppercase tracking-widest text-white/40 text-sm">{t('about.valuesTitle')}</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> {t('about.value1Title')}
                                    </h4>
                                    <p className="text-white/60 text-sm">{t('about.value1Desc')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> {t('about.value2Title')}
                                    </h4>
                                    <p className="text-white/60 text-sm">{t('about.value2Desc')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> {t('about.value3Title')}
                                    </h4>
                                    <p className="text-white/60 text-sm">{t('about.value3Desc')}</p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> {t('about.value4Title')}
                                    </h4>
                                    <p className="text-white/60 text-sm">{t('about.value4Desc')}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
