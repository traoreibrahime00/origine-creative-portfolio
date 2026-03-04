import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PolitiqueConfidentialite() {
    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-7 md:px-12 lg:px-20">

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>

                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-12">Politique de Confidentialité</h1>

                    <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/70">

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. Collecte des données</h2>
                            <p>
                                Origine Creative collecte des données personnelles uniquement lorsque vous les fournissez volontairement via notre formulaire de contact ou notre assistant IA. Les données collectées peuvent inclure :
                            </p>
                            <ul className="space-y-1 mt-4">
                                <li>Votre nom complet</li>
                                <li>Votre adresse email</li>
                                <li>Le nom de votre entreprise</li>
                                <li>Le détail de votre projet</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. Utilisation des données</h2>
                            <p>
                                Les données collectées sont utilisées exclusivement pour :
                            </p>
                            <ul className="space-y-1 mt-4">
                                <li>Répondre à vos demandes de contact</li>
                                <li>Vous proposer un devis ou une collaboration</li>
                                <li>Améliorer nos services et l'expérience utilisateur</li>
                            </ul>
                            <p className="mt-4">
                                Vos données ne sont jamais vendues, louées ou transmises à des tiers à des fins commerciales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. Conservation des données</h2>
                            <p>
                                Les données personnelles sont conservées pendant une durée maximale de 3 ans à compter du dernier contact, conformément aux bonnes pratiques en matière de protection des données.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. Cookies</h2>
                            <p>
                                Ce site n'utilise pas de cookies de tracking ou publicitaires. Seuls des cookies strictement nécessaires au fonctionnement du site peuvent être utilisés.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. Vos droits</h2>
                            <p>
                                Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Pour exercer ces droits, contactez-nous à :
                            </p>
                            <p className="mt-4">
                                <a href="mailto:Traore@originecreative.com" className="text-[hsl(var(--accent-red))] hover:underline font-medium">Traore@originecreative.com</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">6. Services tiers</h2>
                            <p>
                                Notre site utilise les services tiers suivants :
                            </p>
                            <ul className="space-y-1 mt-4">
                                <li><strong className="text-white/90">Formspree</strong> — Traitement des formulaires de contact</li>
                                <li><strong className="text-white/90">Google Gemini AI</strong> — Assistant conversationnel</li>
                                <li><strong className="text-white/90">Vercel</strong> — Hébergement du site</li>
                            </ul>
                        </section>

                        <p className="text-white/40 text-sm mt-12 border-t border-white/10 pt-8">
                            Dernière mise à jour : Mars 2026
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
