// Pages outside the one-pager (contact, legal) in the same quiet column.
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COPY, EMAIL, PHONE_DISPLAY, SITE, whatsappLink, type Lang } from './content';
import { initInputModality } from './behaviors';
import { BackLink } from './BackLink';
import { SEO } from '../components/SEO';

function useLang(): Lang {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('en') ? 'en' : 'fr';
}

export function PlainPage({ children, className = '', seo }: {
  children: ReactNode; className?: string; seo?: { title: string; description?: string; path: string };
}) {
  const lang = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  // Back to where the visitor came from on the site, or home when they landed here directly
  const back = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  };
  useEffect(() => {
    window.scrollTo(0, 0);
    return initInputModality();
  }, []);
  return (
    <main className={'oc-main ' + className}>
      {seo && <SEO {...seo} />}
      <BackLink label={COPY.back[lang]} onBack={back} className="is-pinned enter" />
      <div className="content-width">
        <BackLink label={COPY.back[lang]} onBack={back} className="is-inline enter" />
        <div className="enter" style={{ animationDelay: '0.08s' }}>{children}</div>
      </div>
    </main>
  );
}

const TEXT = {
  quick: {
    fr: 'Une question rapide ? Écrivez-nous sur WhatsApp. Pour un projet, le brief ci-dessous nous donne tout ce qu’il faut pour vous répondre précisément.',
    en: 'A quick question? Message us on WhatsApp. For a project, the brief below gives us everything we need to answer precisely.',
  },
  step: { fr: 'Étape', en: 'Step' },
  of: { fr: 'sur', en: 'of' },
  several: { fr: 'Plusieurs choix possibles', en: 'You can pick several' },
  details: { fr: 'Vos coordonnées', en: 'Your details' },
  next: { fr: 'Continuer', en: 'Continue' },
  back: { fr: 'Retour', en: 'Back' },
  pick: { fr: 'Choisissez au moins une réponse.', en: 'Pick at least one answer.' },
  name: { fr: 'Nom complet & poste', en: 'Full name & role' },
  company: { fr: 'Entreprise / marque', en: 'Company / brand' },
  email: { fr: 'E-mail professionnel', en: 'Work email' },
  phone: { fr: 'WhatsApp / téléphone', en: 'WhatsApp / phone' },
  link: { fr: 'Site actuel ou document de présentation (facultatif)', en: 'Current website or presentation (optional)' },
  byEmail: { fr: 'ou l’envoyer par e-mail', en: 'or send it by email' },
  sentTitle: { fr: 'Votre brief est prêt.', en: 'Your brief is ready.' },
  sentText: {
    fr: 'Il s’est ouvert dans WhatsApp : il ne reste qu’à appuyer sur Envoyer. Rien ne s’est ouvert ?',
    en: 'It opened in WhatsApp: just press Send. Nothing opened?',
  },
  sentEmail: {
    fr: 'Il s’est ouvert dans votre messagerie : il ne reste qu’à l’envoyer. Rien ne s’est ouvert ?',
    en: 'It opened in your mail app: just send it. Nothing opened?',
  },
  retry: { fr: 'Ouvrir à nouveau', en: 'Open it again' },
  edit: { fr: 'Modifier le brief', en: 'Edit the brief' },
};

type Details = { name: string; company: string; email: string; phone: string; link: string; challenge: string };

export function ContactPage() {
  const lang = useLang();
  const { brief, contact } = SITE;
  const booking = contact.booking;
  const total = brief.steps.length + 1;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[][]>(() => brief.steps.map(() => []));
  const [details, setDetails] = useState<Details>({ name: '', company: '', email: '', phone: '', link: '', challenge: '' });
  const [error, setError] = useState(false);
  const [sent, setSent] = useState<null | { channel: 'whatsapp' | 'email'; href: string }>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advance = useRef<number>();
  const moved = useRef(false);

  // Each step change moves focus to its question, so screen readers follow along
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
    moved.current = true;
  }, [step, sent]);
  useEffect(() => () => window.clearTimeout(advance.current), []);

  const go = (n: number) => { setError(false); setStep(n); };

  const choose = (s: number, o: number) => {
    const multiple = brief.steps[s].multiple;
    setError(false);
    setAnswers((all) => all.map((a, i) => {
      if (i !== s) return a;
      if (!multiple) return [o];
      return a.includes(o) ? a.filter((x) => x !== o) : [...a, o].sort();
    }));
    // A single answer moves on by itself, after a beat to see the choice land
    if (!multiple) {
      window.clearTimeout(advance.current);
      advance.current = window.setTimeout(() => go(s + 1), 320);
    }
  };

  const next = () => {
    if (answers[step].length === 0) { setError(true); return; }
    go(step + 1);
  };

  const compose = () => {
    const lines = [
      `Brief — ${brief.title[lang]}`,
      '',
      ...brief.steps.flatMap((st, i) => [st.question[lang], ...answers[i].map((o) => '• ' + st.options[o][lang]), '']),
      `${TEXT.name[lang]} : ${details.name}`,
      `${TEXT.company[lang]} : ${details.company}`,
      `${TEXT.email[lang]} : ${details.email}`,
      `${TEXT.phone[lang]} : ${details.phone}`,
      details.link ? `${TEXT.link[lang].replace(/ \(.*\)/, '')} : ${details.link}` : null,
      '',
      brief.challenge[lang],
      details.challenge,
    ];
    return lines.filter((l) => l !== null).join('\n');
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const channel = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === 'email' ? 'email' : 'whatsapp';
    const body = compose();
    let href: string;
    if (channel === 'email') {
      const subject = `Brief — ${details.company || details.name}`;
      href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    } else {
      href = whatsappLink(body);
      window.open(href, '_blank', 'noopener');
    }
    setSent({ channel, href });
  };

  const field = (key: keyof Details) => ({
    name: key,
    value: details[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDetails((d) => ({ ...d, [key]: e.target.value })),
  });

  const choiceStep = step < brief.steps.length ? brief.steps[step] : null;

  return (
    <PlainPage
      seo={{
        title: lang === 'fr' ? 'Démarrer un projet — Origine Creative, agence de branding à Abidjan' : 'Start a project — Origine Creative, branding agency in Abidjan',
        description: lang === 'fr'
          ? 'Décrivez votre projet de marque, de campagne ou de communication digitale en quatre étapes. Réponse sous 24h ouvrées. Origine Creative, Abidjan.'
          : 'Describe your brand, campaign or digital communication project in four steps. Reply within one working day. Origine Creative, Abidjan.',
        path: '/contact',
      }}
    >
      <h1 className="page-title">{brief.title[lang]}</h1>
      <div className="prose-col">
        <p>{TEXT.quick[lang]}</p>
      </div>
      <div className="contact-actions">
        <a className="pill-button is-quiet" href={whatsappLink(contact.whatsappMessage[lang])} target="_blank" rel="noopener">{COPY.whatsappCta[lang]}</a>
        {booking && <a className="pill-button is-quiet" href={booking} target="_blank" rel="noopener">{COPY.booking[lang]}</a>}
      </div>
      <p className="contact-lines">
        <a className="hand-link" href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
        <span>{PHONE_DISPLAY}</span><br />
        <span>{contact.location[lang]}</span>
      </p>

      <section className="brief" id="brief" aria-label={brief.title[lang]}>
        {sent ? (
          <div className="brief-sent">
            <h2 className="brief-question" tabIndex={-1} ref={headingRef}>{TEXT.sentTitle[lang]}</h2>
            <p className="brief-intro">{sent.channel === 'email' ? TEXT.sentEmail[lang] : TEXT.sentText[lang]}</p>
            <div className="brief-nav">
              <a className="pill-button" href={sent.href} target={sent.channel === 'whatsapp' ? '_blank' : undefined} rel="noopener">{TEXT.retry[lang]}</a>
              <button type="button" className="brief-back" onClick={() => setSent(null)}>{TEXT.edit[lang]}</button>
            </div>
          </div>
        ) : (
          <>
            <p className="brief-intro">{brief.intro[lang]}</p>
            <div className="brief-progress" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => <span key={i} className={i <= step ? 'is-done' : ''} />)}
            </div>
            <p className="brief-count">{TEXT.step[lang]} {step + 1} {TEXT.of[lang]} {total}</p>

            {choiceStep ? (
              <fieldset className="brief-step" key={step}>
                <legend>
                  <h2 className="brief-question" tabIndex={-1} ref={headingRef}>{choiceStep.question[lang]}</h2>
                  {choiceStep.multiple && <span className="brief-hint">{TEXT.several[lang]}</span>}
                </legend>
                <div className="brief-options">
                  {choiceStep.options.map((o, i) => (
                    <label key={i} className="brief-option">
                      <input
                        type={choiceStep.multiple ? 'checkbox' : 'radio'}
                        name={`step-${step}`}
                        checked={answers[step].includes(i)}
                        onChange={() => choose(step, i)}
                      />
                      <span>{o[lang]}</span>
                    </label>
                  ))}
                </div>
                {error && <p className="brief-error" role="alert">{TEXT.pick[lang]}</p>}
                <div className="brief-nav">
                  <button type="button" className="pill-button" onClick={next}>{TEXT.next[lang]}</button>
                  {step > 0 && <button type="button" className="brief-back" onClick={() => go(step - 1)}>← {TEXT.back[lang]}</button>}
                </div>
              </fieldset>
            ) : (
              <form className="brief-step contact-form" onSubmit={submit} key="details">
                <h2 className="brief-question" tabIndex={-1} ref={headingRef}>{TEXT.details[lang]}</h2>
                <label>{TEXT.name[lang]}<input {...field('name')} required autoComplete="name" /></label>
                <label>{TEXT.company[lang]}<input {...field('company')} required autoComplete="organization" /></label>
                <div className="contact-row">
                  <label>{TEXT.email[lang]}<input {...field('email')} type="email" required autoComplete="email" /></label>
                  <label>{TEXT.phone[lang]}<input {...field('phone')} type="tel" required autoComplete="tel" /></label>
                </div>
                <label>{TEXT.link[lang]}<input {...field('link')} inputMode="url" autoComplete="url" /></label>
                <label>{brief.challenge[lang]}<textarea {...field('challenge')} required /></label>
                <div className="brief-submit">
                  <button className="pill-button" type="submit" value="whatsapp">{brief.submit[lang]}</button>
                  <ul className="brief-reassure">
                    {brief.reassurance.map((r, i) => <li key={i}>{r[lang]}</li>)}
                  </ul>
                </div>
                <div className="brief-nav">
                  <button type="button" className="brief-back" onClick={() => go(step - 1)}>← {TEXT.back[lang]}</button>
                  <button type="submit" className="brief-back" value="email">{TEXT.byEmail[lang]}</button>
                </div>
              </form>
            )}
          </>
        )}
      </section>
    </PlainPage>
  );
}
