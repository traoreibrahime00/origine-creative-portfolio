import { motion } from 'framer-motion';

export function APropos() {
    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-7 md:px-12 lg:px-20">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-[hsl(var(--accent-red))]">Notre ADN</span>
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight mb-8">
                            L'origine des <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">grandes marques</span> commence ici.
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
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">Notre Vision</h2>

                        <div className="space-y-6 text-lg text-white/70 leading-relaxed font-light">
                            <p>
                                Née de la volonté de repenser la communication sur le continent africain, Origine Creative s'impose comme le partenaire stratégique des marques ambitieuses.
                            </p>
                            <p>
                                <strong className="text-white font-medium">Nous croyons fermement que chaque marque a une histoire unique à raconter.</strong> Notre mission est de déceler cette essence subtile — cette origine — et de la traduire en expériences visuelles et narratives mémorables.
                            </p>
                            <p>
                                Alliant une compréhension profonde des contextes culturels locaux à une exigence qualitative internationale, notre approche pluridisciplinaire fusionne stratégie pointue, design d'avant-garde et technologies de pointe.
                            </p>
                        </div>

                        <div className="mt-16 pt-16 border-t border-white/10">
                            <h3 className="text-xl font-medium mb-8 uppercase tracking-widest text-white/40 text-sm">Nos Valeurs</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> Excellence
                                    </h4>
                                    <p className="text-white/60 text-sm">Une exigence absolue dans chaque détail, de la réflexion stratégique au livrable final.</p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> Audace
                                    </h4>
                                    <p className="text-white/60 text-sm">Oser bousculer les codes établis pour créer des concepts véritablement innovants.</p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> Impact
                                    </h4>
                                    <p className="text-white/60 text-sm">Des solutions conçues pour générer des résultats tangibles et durables.</p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></span> Authenticité
                                    </h4>
                                    <p className="text-white/60 text-sm">Des marques ancrées dans la réalité, qui communiquent avec sincérité.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
