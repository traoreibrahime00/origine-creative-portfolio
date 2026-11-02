import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import { OnePager } from './site/OnePager';
import { ContactPage, PlainPage } from './site/PlainPage';
import './site/site.css';

// Everything public lives on the one-pager; its sections and sheets answer
// the old addresses (/projets, /projets/:slug, /services, /blog/:slug, /a-propos).
const AdminPage = lazy(() => import('./site/Admin').then(m => ({ default: m.AdminPage })));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales').then(m => ({ default: m.MentionsLegales })));
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite').then(m => ({ default: m.PolitiqueConfidentialite })));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Analytics />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mentions-legales" element={<PlainPage className="text-page"><MentionsLegales /></PlainPage>} />
            <Route path="/politique-de-confidentialite" element={<PlainPage className="text-page"><PolitiqueConfidentialite /></PlainPage>} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/*" element={<OnePager />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
