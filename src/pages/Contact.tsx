import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, MapPin, Phone, Instagram, Linkedin, Dribbble as Behance, MessageCircle } from 'lucide-react';
import { RevealLine, RevealWords } from '../components/TextReveal';
import { MagneticWrapper } from '../components/MagneticWrapper';

export function Contact() {
    return (
        <main className="min-h-screen pt-32 pb-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[hsl(var(--accent-red))]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-7 md:px-12 lg:px-20 relative z-10">

                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Info Side */}
                    <div className="w-full lg:w-5/12">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                                <span className="uppercase text-xs tracking-widest font-medium text-[hsl(var(--accent-red))]">Contact</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
                                <RevealWords text="Prêt à" delayOffset={0.2} /> <RevealLine delay={0.4}><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">créer?</span></RevealLine>
                            </h1>

                            <p className="text-xl text-white/60 mb-12">
                                <RevealWords text="Discutons de votre projet, de vos objectifs et voyons comment nous pouvons collaborer." delayOffset={0.6} />
                            </p>

                            <div className="space-y-8 mb-16">
                                <div className="flex items-start gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-[hsl(var(--accent-red))] group-hover:border-transparent transition-all">
                                        <Mail size={20} className="text-white/60 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-1">Email</h4>
                                        <a href="mailto:Traore@originecreative.com" className="text-xl font-medium group-hover:text-[hsl(var(--accent-red))] transition-colors">Traore@originecreative.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-[hsl(var(--accent-red))] group-hover:border-transparent transition-all">
                                        <Phone size={20} className="text-white/60 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-1">Téléphone</h4>
                                        <p className="text-xl font-medium group-hover:text-[hsl(var(--accent-red))] transition-colors">+2225 307 49 06 55 94</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                                        <MapPin size={20} className="text-white/60" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-1">Studio</h4>
                                        <p className="text-xl font-medium leading-relaxed">
                                            Abidjan, Cote d'ivoire<br />
                                            <span className="text-base text-white/60">Disponible géographiquement sur tout le continent.</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <a
                                        href="https://wa.me/2250749065594"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-4 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all"
                                    >
                                        <MessageCircle size={24} />
                                        Discuter sur WhatsApp
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-4">Réseaux Sociaux</h4>
                                <div className="flex gap-4">
                                    <MagneticWrapper>
                                        <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                            <Instagram size={20} />
                                        </a>
                                    </MagneticWrapper>
                                    <MagneticWrapper>
                                        <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                            <Linkedin size={20} />
                                        </a>
                                    </MagneticWrapper>
                                    <MagneticWrapper>
                                        <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                            <Behance size={20} />
                                        </a>
                                    </MagneticWrapper>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Form Side */}
                    <div className="w-full lg:w-7/12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl"
                        >
                            <form className="flex flex-col gap-6" action="https://formspree.io/f/mdalyybw" method="POST">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="name" className="text-sm font-medium text-white/60 pl-4">Nom complet *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="nom"
                                            className="bg-black/40 border border-white/10 focus:border-[hsl(var(--accent-red))] outline-none rounded-full px-6 py-4 text-white transition-colors"
                                            placeholder="Jane Doe"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="company" className="text-sm font-medium text-white/60 pl-4">Entreprise</label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="entreprise"
                                            className="bg-black/40 border border-white/10 focus:border-[hsl(var(--accent-red))] outline-none rounded-full px-6 py-4 text-white transition-colors"
                                            placeholder="Mon Entreprise"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-sm font-medium text-white/60 pl-4">Adresse Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="bg-black/40 border border-white/10 focus:border-[hsl(var(--accent-red))] outline-none rounded-full px-6 py-4 text-white transition-colors"
                                        placeholder="hello@exemple.com"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-white/60 pl-4">Sujet du projet *</label>
                                    <select
                                        id="subject"
                                        name="sujet"
                                        className="bg-black/40 border border-white/10 focus:border-[hsl(var(--accent-red))] outline-none rounded-full px-6 py-4 text-white appearance-none transition-colors"
                                        required
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Sélectionnez un sujet</option>
                                        <option value="branding">Stratégie & Branding</option>
                                        <option value="digital">Digital & Web</option>
                                        <option value="motion">Motion Design</option>
                                        <option value="autre">Autre demande</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2 mb-4">
                                    <label htmlFor="message" className="text-sm font-medium text-white/60 pl-4">Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        className="bg-black/40 border border-white/10 focus:border-[hsl(var(--accent-red))] outline-none rounded-3xl px-6 py-4 text-white resize-none transition-colors"
                                        placeholder="Parlez-nous de votre projet..."
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="group flex items-center justify-center gap-4 bg-white text-black px-8 py-5 rounded-full font-bold text-lg hover:bg-[hsl(var(--accent-red))] hover:text-white transition-all w-full md:w-auto self-start">
                                    Envoyer le message
                                    <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                        <ArrowUpRight strokeWidth={2} size={16} />
                                    </div>
                                </button>

                            </form>
                        </motion.div>
                    </div>
                </div>

            </div>
        </main>
    );
}
