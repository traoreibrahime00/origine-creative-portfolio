// Build-time rendering: scripts/prerender.js calls render() for every public
// address and writes the result as a real HTML page, so search engines read
// each page's text, title and description without running the app.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AppRoutes } from './App';
import { POSTS, PROJECTS, SERVICES } from './site/content';

export async function render(url: string) {
  await i18n.changeLanguage('fr');
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <HelmetProvider context={helmetContext}>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </HelmetProvider>
      </I18nextProvider>
    </StrictMode>,
  );
  const h = helmetContext.helmet;
  const head = h ? [h.title, h.meta, h.link, h.script].map((part) => part.toString()).join('\n    ') : '';
  return { html, head };
}

// Every address worth a page of its own
export const routes = [
  '/',
  '/contact',
  '/agence-de-communication-abidjan',
  '/mentions-legales',
  '/politique-de-confidentialite',
  '/a-propos',
  '/methode',
  '/projets',
  '/services',
  '/blog',
  '/galerie',
  ...SERVICES.map((s) => `/services/${s.slug}`),
  ...PROJECTS.map((p) => `/projets/${p.slug}`),
  ...POSTS.map((p) => `/blog/${p.slug}`),
];
