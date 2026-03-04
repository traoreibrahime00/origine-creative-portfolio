import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Projets', path: '/projets' },
    { name: 'À propos', path: '/a-propos' },
    { name: 'Contact', path: '/contact' },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    return (
        <>
            {/* Skip to content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[hsl(var(--accent-red))] focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-medium"
            >
                Aller au contenu principal
            </a>
            <header
                className={cn(
                    'fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 transition-all duration-300 rounded-full px-6 py-4 flex items-center justify-between',
                    scrolled
                        ? 'bg-black/80 backdrop-blur-xl border border-white/10'
                        : 'bg-transparent border border-transparent'
                )}
            >
                <Link to="/" className="flex items-center gap-1 z-50">
                    <img src="/logo.png" alt="Origine Creative" className="h-8 object-contain" />
                </Link>

                {/* Desktop Nav */}
                <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1 backdrop-blur-md rounded-full px-2 py-1">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                cn(
                                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105',
                                    isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                )
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <Link
                    to="/contact"
                    className={cn(
                        'hidden lg:flex items-center gap-3 pl-6 pr-2 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 group',
                        scrolled ? 'bg-white text-black' : 'bg-transparent text-white border border-white/20 hover:bg-white hover:text-black'
                    )}
                >
                    <span className="text-sm">Travaillons ensemble</span>
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white",
                        scrolled ? 'bg-black text-white' : 'bg-white text-black'
                    )}>
                        <ArrowUpRight strokeWidth={2} size={16} />
                    </div>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-white z-50 p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-4 z-40 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-8 overflow-y-auto"
                        onWheelCapture={(e) => e.stopPropagation()}
                    >
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    cn(
                                        'text-3xl font-medium transition-colors',
                                        isActive ? 'text-[hsl(var(--accent-red))] text-glow' : 'text-white/80 hover:text-white'
                                    )
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <Link
                            to="/contact"
                            className="mt-8 flex items-center gap-3 px-6 py-3 rounded-full font-medium bg-white text-black"
                        >
                            Travaillons ensemble
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                <ArrowUpRight strokeWidth={2} size={16} />
                            </div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
