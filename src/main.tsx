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

// Prerendered pages arrive with their markup: take it over instead of redrawing.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
