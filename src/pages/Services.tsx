import { motion } from 'framer-motion';
import { PenTool, Megaphone, Laptop, Film, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
    {
        title: 'Stratégie de Marque',
        description: "Nous définissons le positionnement, l'architecture et la voix de votre marque pour créer un socle solide et différenciant sur votre marché.",
        icon: Megaphone,
        points: ['Audit & Analyse', 'Positionnement', 'Plateforme de marque', 'Naming'],
    },
    {
        title: 'Identité Visuelle',
        description: 'Création de systèmes graphiques uniques et mémorables qui traduisent visuellement l\'essence de votre marque sur tous les supports.',
        icon: PenTool,
        points: ['Création de logo', 'Charte graphique', 'Typographie & Couleurs', 'Brand Guidelines'],
    },
    {
        title: 'Communication Digitale',
        description: 'Une présence en ligne performante avec des expériences digitales sur mesure, pensées pour vos utilisateurs et vos objectifs.',
        icon: Laptop,
        points: ['Sites Web sur-mesure', 'UI/UX Design', 'Stratégie Social Media', 'Content Management'],
    },
    {
        title: 'Motion Design',
        description: 'Donnez vie à votre marque à travers l\'animation. Des vidéos explicatives aux contenus sociaux engageants.',
        icon: Film,
        points: ['Animation 2D/3D', 'Vidéos promotionnelles', 'Brand Intro', 'Lottie Animations'],
    },
    {
        title: 'Direction Artistique',
        description: 'La garantie d\'une cohérence visuelle absolue sur l\'ensemble de vos campagnes et de vos supports de communication.',
        icon: Palette,
        points: ['Shooting Photo', 'Campagnes Publicitaires', 'Scénographie', 'Édition & Print'],
    }
];

export function Services() {
    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-7 md:px-12 lg:px-20">

                {/* Header */}
                <div className="max-w-3xl mb-24">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-[hsl(var(--accent-red))]">Expertise</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
                            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">Services</span>
                        </h1>
                        <p className="text-xl text-white/60 leading-relaxed">
                            Nous accompagnons nos clients à chaque étape de leur développement en déployant un savoir-faire pluridisciplinaire.
                        </p>
                    </motion.div>
                </div>

                {/* Services List */}
                <div className="flex flex-col gap-12 lg:gap-24">
                    {services.map((service, idx) => {
                        const Icon = service.icon;
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
                                <div className="w-full lg:w-1/2 aspect-square md:aspect-[4/3] rounded-3xl bg-zinc-900 border border-white/10 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-red))]/10 to-transparent mix-blend-overlay"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className="w-32 h-32 text-white/5 transition-transform duration-700 group-hover:scale-110 group-hover:text-white/10 group-hover:rotate-6" strokeWidth={1} />
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
                                        {service.points.map((point) => (
                                            <li key={point} className="flex items-center gap-3 text-white/80">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-red))] text-glow"></div>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-12">
                                        <Link to="/contact" className="inline-flex items-center gap-2 group text-sm font-medium uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                                            Discuter de ce service
                                            <span className="w-8 h-px bg-white/20 group-hover:bg-white group-hover:w-12 transition-all duration-300"></span>
                                        </Link>
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
