// Light/dark switch: a half-filled disc that turns over. It follows the
// system until it is flipped; the choice is kept in localStorage and applied
// before first paint by the inline script in index.html.
import { useEffect, useState } from 'react';

const dark = () => {
  const set = document.documentElement.dataset.theme;
  return set ? set === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export function ThemeSwitch({ label }: { label: string }) {
  // Starts light so the prerendered page and the first render agree; the
  // real state is read once mounted.
  const [isDark, setDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setDark(dark());
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* private mode: the choice lasts this visit */ }
    setDark(!isDark);
  };

  return (
    <button type="button" className="theme-switch" role="switch" aria-checked={isDark} aria-label={label} title={label} onClick={toggle}>
      <span className="theme-switch-knob" aria-hidden="true" />
    </button>
  );
}
