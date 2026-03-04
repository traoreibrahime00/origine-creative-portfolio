import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function MentionsLegales() {
    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-7 md:px-12 lg:px-20">

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>

                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-12">Mentions Légales</h1>

                    <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/70">

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. Éditeur du site</h2>
                            <p>
                                Le site <strong className="text-white">originecreative.com</strong> est édité par Origine Creative, agence de communication spécialisée en stratégie de marque, identité visuelle, communication digitale et motion design.
                            </p>
                            <ul className="space-y-1 mt-4 list-none pl-0">
                                <li><strong className="text-white/90">Raison sociale :</strong> Origine Creative</li>
                                <li><strong className="text-white/90">Siège social :</strong> Abidjan, Côte d'Ivoire</li>
                                <li><strong className="text-white/90">Email :</strong> <a href="mailto:Traore@originecreative.com" className="text-[hsl(var(--accent-red))] hover:underline">Traore@originecreative.com</a></li>
                                <li><strong className="text-white/90">Téléphone :</strong> +225 07 49 06 55 94</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. Hébergement</h2>
                            <p>
                                Ce site est hébergé par <strong className="text-white">Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. Propriété intellectuelle</h2>
                            <p>
                                L'ensemble des contenus présents sur ce site (textes, images, vidéos, logos, animations, graphismes) est protégé par le droit d'auteur et la propriété intellectuelle. Toute reproduction, diffusion ou utilisation, même partielle, sans autorisation écrite préalable d'Origine Creative est strictement interdite.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. Limitation de responsabilité</h2>
                            <p>
                                Origine Creative s'efforce de fournir des informations exactes et à jour sur ce site. Toutefois, nous ne pouvons garantir l'exhaustivité ou l'exactitude des informations diffusées. L'utilisation du site se fait sous la responsabilité de l'utilisateur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. Liens externes</h2>
                            <p>
                                Ce site peut contenir des liens vers des sites tiers. Origine Creative n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
