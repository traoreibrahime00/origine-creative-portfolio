import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Projets } from './pages/Projets';
import { APropos } from './pages/APropos';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { Chatbot } from './components/Chatbot';

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
      <Chatbot />

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
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projets" element={<Projets />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
