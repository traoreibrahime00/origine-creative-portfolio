import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { PageTransition } from './components/PageTransition';

// Code-splitting: lazy-load pages for smaller initial bundle
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Projets = lazy(() => import('./pages/Projets').then(m => ({ default: m.Projets })));
const APropos = lazy(() => import('./pages/APropos').then(m => ({ default: m.APropos })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales').then(m => ({ default: m.MentionsLegales })));
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite').then(m => ({ default: m.PolitiqueConfidentialite })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogArticle = lazy(() => import('./pages/BlogArticle').then(m => ({ default: m.BlogArticle })));

// Lazy-load heavy components
const Chatbot = lazy(() => import('./components/Chatbot').then(m => ({ default: m.Chatbot })));

let globalLenis: Lenis | null = null;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (globalLenis) {
      globalLenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

// Minimal loading fallback (matches the dark theme)
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[hsl(var(--accent-red))] rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/projets" element={<PageTransition><Projets /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogArticle /></PageTransition>} />
          <Route path="/a-propos" element={<PageTransition><APropos /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/mentions-legales" element={<PageTransition><MentionsLegales /></PageTransition>} />
          <Route path="/politique-de-confidentialite" element={<PageTransition><PolitiqueConfidentialite /></PageTransition>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    globalLenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      globalLenis = null;
    };
  }, []);

  return (
    <BrowserRouter>
      <Preloader />
      <ScrollToTop />
      <CustomCursor />
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
      <Analytics />

      {/* Custom Global Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{ backgroundImage: `url('/background.gif')`, display: 'block' }}
        />

        {/* Optional fallback/additional red glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
            x: ['-10%', '10%', '-10%'],
            y: ['0%', '10%', '0%']
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-red-600 rounded-full mix-blend-screen"
          style={{ filter: 'blur(120px)' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: ['10%', '-10%', '10%'],
            y: ['10%', '-10%', '10%']
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-red-800 rounded-full mix-blend-screen"
          style={{ filter: 'blur(150px)' }}
        />
      </div>

      <div className="relative min-h-screen text-white flex flex-col font-sans z-10">
        <Navbar />
        <div className="flex-1" id="main-content">
          <AnimatedRoutes />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
