import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import i18n from './i18n'
import { I18nextProvider } from 'react-i18next'
import App from './App.tsx'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>
)

// Prerendered pages write their head tags without Helmet's data-rh mark (see
// scripts/prerender.js); marking them again lets Helmet replace them as the
// visitor moves between pages, instead of adding a second set.
document.head
  .querySelectorAll('title, meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"]')
  .forEach((el) => el.setAttribute('data-rh', 'true'))

// Prerendered pages arrive with their markup: take it over instead of redrawing.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
