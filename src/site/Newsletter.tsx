// Newsletter sign-up: an email field that adds the visitor to the Brevo list
// through /api/subscribe. Also exports subscribe() for the project brief.
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Lang } from './content';

export type Subscriber = { email: string; firstName?: string; lastName?: string };

export async function subscribe(s: Subscriber): Promise<boolean> {
  try {
    const r = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...s, consent: true }),
      keepalive: true,
    });
    return r.ok;
  } catch {
    return false;
  }
}

const TEXT = {
  title: { fr: 'Nos réalisations, une fois par mois', en: 'Our work, once a month' },
  lead: {
    fr: 'Nouveaux projets, coulisses et idées pour votre marque. Pas plus d’un email par mois.',
    en: 'New projects, behind the scenes and ideas for your brand. No more than one email a month.',
  },
  email: { fr: 'Votre e-mail', en: 'Your email' },
  submit: { fr: 'S’inscrire', en: 'Subscribe' },
  sending: { fr: 'Inscription…', en: 'Subscribing…' },
  done: { fr: 'C’est noté, merci ! À très vite dans votre boîte mail.', en: 'You’re in, thank you! See you in your inbox.' },
  error: { fr: 'L’inscription n’a pas pu aboutir. Réessayez, ou écrivez-nous.', en: 'We couldn’t sign you up. Try again, or write to us.' },
  legal: { fr: 'Désinscription en un clic à tout moment.', en: 'Unsubscribe in one click at any time.' },
  privacy: { fr: 'Confidentialité', en: 'Privacy' },
};

export function NewsletterForm({ lang, className = '' }: { lang: Lang; className?: string }) {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (trap) { setState('done'); return; }
    setState('sending');
    setState((await subscribe({ email })) ? 'done' : 'error');
  };

  return (
    <div className={'newsletter ' + className}>
      <p className="newsletter-title">{TEXT.title[lang]}</p>
      <p className="newsletter-lead">{TEXT.lead[lang]}</p>
      {state === 'done' ? (
        <p className="newsletter-done" role="status">{TEXT.done[lang]}</p>
      ) : (
        <form className="newsletter-form" onSubmit={submit}>
          <label className="newsletter-field">
            <span className="visually-hidden">{TEXT.email[lang]}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={TEXT.email[lang]}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <input
            className="newsletter-trap"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
          <button className="pill-button" type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? TEXT.sending[lang] : TEXT.submit[lang]}
          </button>
        </form>
      )}
      {state === 'error' && <p className="newsletter-error" role="alert">{TEXT.error[lang]}</p>}
      {state !== 'done' && (
        <p className="newsletter-legal">
          {TEXT.legal[lang]} <Link to="/politique-de-confidentialite">{TEXT.privacy[lang]}</Link>
        </p>
      )}
    </div>
  );
}
