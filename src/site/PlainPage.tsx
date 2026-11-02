// Pages outside the one-pager (contact, legal) in the same quiet column.
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COPY, EMAIL, PHONE_DISPLAY, SERVICES, SITE, WHATSAPP, type Lang } from './content';
import { initInputModality } from './behaviors';
import { Logo } from './Logo';

function useLang(): Lang {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('en') ? 'en' : 'fr';
}

export function PlainPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    return initInputModality();
  }, []);
  return (
    <main className={'oc-main ' + className}>
      <div className="content-width">
        <Link to="/" className="page-back enter" aria-label="Origine Creative">← <Logo /></Link>
        <div className="enter" style={{ animationDelay: '0.08s' }}>{children}</div>
      </div>
    </main>
  );
}

const TEXT = {
  title: { fr: 'Parlons de votre projet', en: 'Tell us about your project' },
  intro: {
    fr: 'Décrivez votre projet, vos objectifs et vos délais, par e-mail, sur WhatsApp ou avec le formulaire ci-dessous.',
    en: 'Tell us about your project, your goals and your timing, by email, on WhatsApp or with the form below.',
  },
  name: { fr: 'Nom complet', en: 'Full name' },
  company: { fr: 'Entreprise', en: 'Company' },
  subject: { fr: 'Sujet', en: 'Subject' },
  other: { fr: 'Autre demande', en: 'Something else' },
  message: { fr: 'Message', en: 'Message' },
  send: { fr: 'Préparer l’e-mail', en: 'Compose the email' },
  note: {
    fr: 'Le bouton ouvre votre messagerie avec le message prêt à envoyer.',
    en: 'The button opens your mail app with the message ready to send.',
  },
};

export function ContactPage() {
  const lang = useLang();
  const [subject, setSubject] = useState(SERVICES[0].title[lang]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const lines = [`${TEXT.name[lang]} : ${data.get('name')}`];
    if (data.get('company')) lines.push(`${TEXT.company[lang]} : ${data.get('company')}`);
    lines.push('', String(data.get('message') || ''));
    const body = lines.join('\n');
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  useEffect(() => {
    document.title = `${COPY.contact[lang]} — Origine Creative`;
  }, [lang]);

  return (
    <PlainPage>
      <h1 className="page-title">{TEXT.title[lang]}</h1>
      <div className="prose-col">
        <p>{TEXT.intro[lang]}</p>
        <p>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
          <a href={WHATSAPP} target="_blank" rel="noopener">{PHONE_DISPLAY}</a> · WhatsApp<br />
          <span style={{ color: 'var(--color-muted)' }}>{SITE.contact.location[lang]}</span>
        </p>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <label>{TEXT.name[lang]}<input name="name" required autoComplete="name" /></label>
        <label>{TEXT.company[lang]}<input name="company" autoComplete="organization" /></label>
        <label>
          {TEXT.subject[lang]}
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SERVICES.map((s) => <option key={s.title.fr}>{s.title[lang]}</option>)}
            <option>{TEXT.other[lang]}</option>
          </select>
        </label>
        <label>{TEXT.message[lang]}<textarea name="message" required /></label>
        <button className="pill-button" type="submit">{TEXT.send[lang]}</button>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{TEXT.note[lang]}</p>
      </form>
    </PlainPage>
  );
}
