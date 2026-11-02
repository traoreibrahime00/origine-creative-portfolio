import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import { OnePager } from './site/OnePager';
import { ContactPage, PlainPage } from './site/PlainPage';
import { MentionsLegales } from './pages/MentionsLegales';
import { PolitiqueConfidentialite } from './pages/PolitiqueConfidentialite';
import './site/site.css';

// Everything public lives on the one-pager; its sections and sheets answer
// the old addresses (/projets, /projets/:slug, /services/:slug, /blog/:slug,
// /a-propos). Only the admin loads on demand: it is never prerendered.
const AdminPage = lazy(() => import('./site/Admin').then(m => ({ default: m.AdminPage })));

// The routes, shared by the browser (App) and the build-time prerender
// (entry-server.tsx), which wraps them in its own router.
export function AppRoutes() {
  return (
    <>
      <Analytics />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/mentions-legales"
            element={<PlainPage className="text-page" seo={{ title: 'Mentions légales — Origine Creative', path: '/mentions-legales' }}><MentionsLegales /></PlainPage>}
          />
          <Route
            path="/politique-de-confidentialite"
            element={<PlainPage className="text-page" seo={{ title: 'Politique de confidentialité — Origine Creative', path: '/politique-de-confidentialite' }}><PolitiqueConfidentialite /></PlainPage>}
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/*" element={<OnePager />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
