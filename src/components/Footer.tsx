import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Dribbble as Behance } from 'lucide-react'; // Behance icon mapped to Dribbble for now if missing

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-20 pb-10 px-7 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 relative z-10">

                {/* Brand */}
                <div className="max-w-sm">
                    <Link to="/" className="flex items-center gap-1 mb-6">
                        <img src="/logo.png" alt="Origine Creative" className="h-10 object-contain" />
                    </Link>
                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                        Agence de communication africaine spécialisée en stratégie de marque, identité visuelle, communication digitale et motion design. Nous créons des marques qui marquent.
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-16">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-medium mb-2 uppercase tracking-widest text-xs">Navigation</h4>
                        <Link to="/services" className="text-white/60 hover:text-white transition-colors text-sm">Services</Link>
                        <Link to="/projets" className="text-white/60 hover:text-white transition-colors text-sm">Projets</Link>
                        <Link to="/a-propos" className="text-white/60 hover:text-white transition-colors text-sm">À propos</Link>
                        <Link to="/contact" className="text-white/60 hover:text-white transition-colors text-sm">Contact</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-medium mb-2 uppercase tracking-widest text-xs">Social</h4>
                        <a href="#" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm group">
                            <Instagram size={16} className="group-hover:text-[hsl(var(--accent-red))] transition-colors" />
                            Instagram
                        </a>
                        <a href="#" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm group">
                            <Linkedin size={16} className="group-hover:text-[hsl(var(--accent-red))] transition-colors" />
                            LinkedIn
                        </a>
                        <a href="#" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm group">
                            <Behance size={16} className="group-hover:text-[hsl(var(--accent-red))] transition-colors" />
                            Behance
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/40 text-xs">
                <p>© 2026 Origine Creative. Tous droits réservés.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link to="#" className="hover:text-white transition-colors">Politique de confidentialité</Link>
                    <Link to="#" className="hover:text-white transition-colors">Mentions légales</Link>
                </div>
            </div>
        </footer>
    );
}
