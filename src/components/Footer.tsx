import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Dribbble as Behance } from 'lucide-react';
import { useState, useRef } from 'react'; // Behance icon mapped to Dribbble for now if missing

export function Footer() {
    const [easterEggFound, setEasterEggFound] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const heartbeatRef = useRef<HTMLAudioElement | null>(null);

    const handleEasterEgg = () => {
        setEasterEggFound(true);
        if (heartbeatRef.current) {
            heartbeatRef.current.pause();
        }
        if (!audioRef.current) {
            // Un petit son "swoosh" ou impact stylé
            audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        }
        audioRef.current.play().catch(e => console.log(e));

        setTimeout(() => setEasterEggFound(false), 3000);
    };

    const handleMouseEnter = () => {
        if (easterEggFound) return;
        if (!heartbeatRef.current) {
            heartbeatRef.current = new Audio('https://actions.google.com/sounds/v1/human_voices/heartbeat.ogg');
            heartbeatRef.current.loop = true;
            heartbeatRef.current.volume = 0.5;
        }
        heartbeatRef.current.play().catch(e => console.log(e));
    };

    const handleMouseLeave = () => {
        if (heartbeatRef.current) {
            heartbeatRef.current.pause();
            heartbeatRef.current.currentTime = 0;
        }
    };

    return (
        <footer className={`bg-black border-t border-white/10 pt-20 pb-10 px-7 md:px-12 lg:px-20 relative overflow-hidden transition-colors duration-1000 ${easterEggFound ? 'bg-[hsl(var(--accent-red))] text-white' : ''}`}>

            {/* BIG Easter Egg O */}
            <div
                className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-[40vw] font-display italic font-bold select-none cursor-pointer transition-all duration-1000 z-10 
                ${easterEggFound ? 'text-white opacity-40 scale-110' : 'text-white/20 opacity-20 hover:text-[hsl(var(--accent-red))] hover:opacity-50 hover:scale-105'}`}
                onClick={handleEasterEgg}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title="Secret de l'agence..."
            >
                O
            </div>

            <div className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 relative z-20 pointer-events-none transition-opacity duration-500 ${easterEggFound ? 'opacity-0' : 'opacity-100'}`}>

                {/* Brand */}
                <div className="max-w-sm pointer-events-auto">
                    <Link to="/" className="flex items-center gap-1 mb-6">
                        <img src="/logo.png" alt="Origine Creative" className="h-10 object-contain" />
                    </Link>
                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                        Agence de communication africaine spécialisée en stratégie de marque, identité visuelle, communication digitale et motion design. Nous créons des marques qui marquent.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 pointer-events-auto">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-medium mb-2 uppercase tracking-widest text-xs">Navigation</h4>
                        <Link to="/services" className="text-white/60 hover:text-white transition-colors text-sm">Services</Link>
                        <Link to="/projets" className="text-white/60 hover:text-white transition-colors text-sm">Projets</Link>
                        <Link to="/a-propos" className="text-white/60 hover:text-white transition-colors text-sm">À propos</Link>
                        <Link to="/contact" className="text-white/60 hover:text-white transition-colors text-sm">Contact</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-medium mb-2 uppercase tracking-widest text-xs">Social</h4>
                        <a href="#" aria-label="Suivez-nous sur Instagram" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm group">
                            <Instagram size={16} className="group-hover:text-[hsl(var(--accent-red))] transition-colors" />
                            Instagram
                        </a>
                        <a href="#" aria-label="Suivez-nous sur LinkedIn" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm group">
                            <Linkedin size={16} className="group-hover:text-[hsl(var(--accent-red))] transition-colors" />
                            LinkedIn
                        </a>
                        <a href="#" aria-label="Voir notre portfolio Behance" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm group">
                            <Behance size={16} className="group-hover:text-[hsl(var(--accent-red))] transition-colors" />
                            Behance
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/40 text-xs relative z-20 pointer-events-auto">
                <p>© 2026 Origine Creative. Tous droits réservés.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link to="/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link>
                    <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
                </div>
            </div>
        </footer>
    );
}
