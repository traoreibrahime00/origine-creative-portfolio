// Pages outside the one-pager (contact, legal) in the same quiet column.
import { useEffect, type FormEvent, type ReactNode } from 'react';
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
    fr: 'Le plus rapide : un message WhatsApp. Vous pouvez aussi remplir le brief ci-dessous, il part en un clic.',
    en: 'The quickest way is a WhatsApp message. You can also fill in the brief below, it goes in one click.',
  },
  whatsapp: { fr: 'Écrire sur WhatsApp', en: 'Message on WhatsApp' },
  booking: { fr: 'Prendre rendez-vous', en: 'Book a call' },
  briefTitle: { fr: 'Brief en une minute', en: 'One-minute brief' },
  name: { fr: 'Nom complet', en: 'Full name' },
  company: { fr: 'Entreprise', en: 'Company' },
  sector: { fr: "Secteur d'activité", en: 'Industry' },
  type: { fr: 'Type de projet', en: 'Type of project' },
  other: { fr: 'Autre / je ne sais pas encore', en: 'Other / not sure yet' },
  budget: { fr: 'Budget estimé (facultatif)', en: 'Estimated budget (optional)' },
  timing: { fr: 'Échéance', en: 'Timing' },
  timings: {
    fr: ['Dès que possible', 'Dans 1 à 3 mois', 'Dans 3 à 6 mois', 'Pas encore défini'],
    en: ['As soon as possible', 'In 1 to 3 months', 'In 3 to 6 months', 'Not decided yet'],
  },
  message: { fr: 'Votre projet en quelques mots', en: 'Your project in a few words' },
  sendWhatsapp: { fr: 'Envoyer sur WhatsApp', en: 'Send on WhatsApp' },
  sendEmail: { fr: 'Envoyer par e-mail', en: 'Send by email' },
  note: {
    fr: 'Le brief s’ouvre dans WhatsApp ou dans votre messagerie, prêt à envoyer.',
    en: 'The brief opens in WhatsApp or your mail app, ready to send.',
  },
};

const SECTORS = {
  fr: ['Agriculture', 'Agroalimentaire', 'Automobile', 'BTP & immobilier', 'Commerce & distribution', 'Culture & médias', 'Énergie', 'Finance & assurance', 'Hôtellerie & restauration', 'Industrie', 'Mode & beauté', 'ONG & institutions', 'Santé', 'Technologie', 'Transport & logistique'],
  en: ['Agriculture', 'Food & beverage', 'Automotive', 'Construction & real estate', 'Retail', 'Culture & media', 'Energy', 'Finance & insurance', 'Hospitality', 'Industry', 'Fashion & beauty', 'NGOs & institutions', 'Health', 'Technology', 'Transport & logistics'],
};

export function ContactPage() {
  const lang = useLang();
  const booking = SITE.contact.booking;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const channel = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value || 'whatsapp';
    const line = (label: string, key: string) => (data.get(key) ? `${label} : ${data.get(key)}` : '');
    const body = [
      'Brief — Origine Creative',
      line(TEXT.name[lang], 'name'),
      line(TEXT.company[lang], 'company'),
      line(TEXT.sector[lang], 'sector'),
      line(TEXT.type[lang], 'type'),
      line(TEXT.budget[lang].replace(/ \(.*\)/, ''), 'budget'),
      line(TEXT.timing[lang], 'timing'),
      '',
      String(data.get('message') || ''),
    ].filter((l, i, all) => l || (i > 0 && all[i - 1])).join('\n').trim();
    if (channel === 'email') {
      const subject = `Brief — ${data.get('type')}${data.get('company') ? ' — ' + data.get('company') : ''}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(`${WHATSAPP}${WHATSAPP.includes('?') ? '&' : '?'}text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    }
  };

  useEffect(() => {
    document.title = `${COPY.contact[lang]} — Origine Creative`;
  }, [lang]);

  return (
    <PlainPage>
      <h1 className="page-title">{TEXT.title[lang]}</h1>
      <div className="prose-col">
        <p>{TEXT.intro[lang]}</p>
      </div>
      <div className="contact-actions">
        <a className="pill-button" href={WHATSAPP} target="_blank" rel="noopener">{TEXT.whatsapp[lang]}</a>
        {booking && <a className="pill-button is-quiet" href={booking} target="_blank" rel="noopener">{TEXT.booking[lang]}</a>}
      </div>
      <p className="contact-lines">
        <a className="hand-link" href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
        <span>{PHONE_DISPLAY}</span><br />
        <span>{SITE.contact.location[lang]}</span>
      </p>

      <form className="contact-form" onSubmit={submit}>
        <h2 className="section-title">{TEXT.briefTitle[lang]}</h2>
        <label>{TEXT.name[lang]}<input name="name" required autoComplete="name" /></label>
        <label>{TEXT.company[lang]}<input name="company" autoComplete="organization" /></label>
        <label>
          {TEXT.sector[lang]}
          <input name="sector" list="sectors" autoComplete="off" />
          <datalist id="sectors">{SECTORS[lang].map((s) => <option key={s} value={s} />)}</datalist>
        </label>
        <label>
          {TEXT.type[lang]}
          <select name="type" defaultValue={SERVICES[0].title[lang]}>
            {SERVICES.map((s) => <option key={s.title.fr}>{s.title[lang]}</option>)}
            <option>{TEXT.other[lang]}</option>
          </select>
        </label>
        <div className="contact-row">
          <label>{TEXT.budget[lang]}<input name="budget" /></label>
          <label>
            {TEXT.timing[lang]}
            <select name="timing" defaultValue={TEXT.timings[lang][0]}>
              {TEXT.timings[lang].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <label>{TEXT.message[lang]}<textarea name="message" /></label>
        <div className="contact-actions">
          <button className="pill-button" type="submit" value="whatsapp">{TEXT.sendWhatsapp[lang]}</button>
          <button className="pill-button is-quiet" type="submit" value="email">{TEXT.sendEmail[lang]}</button>
        </div>
        <p className="contact-note">{TEXT.note[lang]}</p>
      </form>
    </PlainPage>
  );
}
