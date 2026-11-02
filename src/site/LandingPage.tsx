// Search landing page for "agence de communication Abidjan": the studio's
// offer told for that query, linking to the service sheets and projects.
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { COPY, METHOD, PROJECTS, SERVICES, SITE, whatsappLink } from './content';
import { PlainPage } from './PlainPage';
import { SITE_URL } from '../components/SEO';

const PATH = '/agence-de-communication-abidjan';

const FAQ = [
  {
    q: 'Quelle différence entre une agence de communication et une agence de branding ?',
    a: 'Une agence de branding construit la marque : son positionnement, son nom, son identité visuelle. Une agence de communication la fait parler : campagnes, réseaux sociaux, supports. Origine Creative fait les deux, dans cet ordre, pour que chaque prise de parole repose sur une marque claire.',
  },
  {
    q: 'Combien coûte un projet de communication à Abidjan ?',
    a: 'Le prix dépend du périmètre : une campagne ciblée ne demande pas le même travail qu’une création de marque complète. Décrivez votre projet dans notre brief en quatre étapes : nous répondons sous 24h ouvrées et le cadrage stratégique est offert.',
  },
  {
    q: 'Combien de temps dure un projet ?',
    a: 'Selon le périmètre, un projet ciblé peut être livré en moins de trois semaines, et une identité de marque complète demande en général un à deux mois, de l’audit au déploiement.',
  },
  {
    q: 'Travaillez-vous uniquement à Abidjan ?',
    a: 'Nous sommes basés à Abidjan et travaillons avec des entreprises dans toute la Côte d’Ivoire, en Afrique de l’Ouest et à l’international. Les échanges se font en rendez-vous ou à distance, selon ce qui vous convient.',
  },
  {
    q: 'Pouvez-vous gérer nos réseaux sociaux ?',
    a: 'Nous concevons votre présence en ligne : kits réseaux sociaux prêts à l’emploi, templates marketing, animations et landing pages. Vos équipes publient ensuite avec des supports cohérents et faciles à décliner.',
  },
];

export function LandingCommunication() {
  const title = 'Agence de communication à Abidjan — Origine Creative';
  const description = 'Origine Creative, agence de communication et de branding à Abidjan : stratégie de marque, identité visuelle, campagnes, motion design et communication digitale.';
  const url = SITE_URL + PATH;

  return (
    <PlainPage
      className="landing"
      seo={{
        title,
        description,
        path: PATH,
        schema: [
          {
            '@type': 'Service',
            '@id': `${url}#service`,
            name: 'Agence de communication à Abidjan',
            serviceType: 'Agence de communication et de branding',
            description,
            url,
            provider: { '@id': `${SITE_URL}/#organization` },
            areaServed: [{ '@type': 'City', name: 'Abidjan' }, { '@type': 'Country', name: 'Côte d’Ivoire' }],
          },
          {
            '@type': 'FAQPage',
            mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Agence de communication à Abidjan', item: url },
            ],
          },
        ],
      }}
    >
      <h1 className="page-title">Agence de communication à Abidjan</h1>
      <div className="landing-body">
        <p className="case-lead">
          Origine Creative est une agence de communication et de branding basée à Abidjan. Nous aidons les entreprises
          ivoiriennes et africaines à devenir des marques singulières, puis à les faire parler avec justesse.
        </p>

        <div className="post-content">
          <p>
            Une communication efficace commence par une marque claire. Avant de produire une affiche, une campagne ou un
            post, nous définissons avec vous ce qui vous rend différent, à qui vous parlez et sur quel ton. Chaque support
            devient alors cohérent : votre logo, vos réseaux sociaux, vos supports imprimés et vos événements racontent la
            même histoire.
          </p>
          <p>
            Nous accompagnons les entreprises qui se lancent, celles qui veulent moderniser leur image et celles qui
            préparent un temps fort, de la stratégie au déploiement, à Abidjan comme ailleurs en Afrique et à
            l’international.
          </p>
        </div>

        <section>
          <h2 className="case-heading">Nos services de communication</h2>
          <ul className="landing-services">
            {SERVICES.map((sv) => (
              <li key={sv.slug}>
                <Link to={`/services/${sv.slug}`}>{sv.title.fr}</Link>
                <span>{sv.desc.fr}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="case-heading">Quelques réalisations</h2>
          <div className="related-grid">
            {PROJECTS.map((p) => (
              <Link key={p.slug} className="related-card" to={`/projets/${p.slug}`}>
                <span className="related-media" style={{ '--fill': p.fill } as CSSProperties}>
                  <img src={p.cover.small || p.cover.src} alt={p.cover.alt.fr} loading="lazy" decoding="async" />
                </span>
                <span className="card-foot">
                  <span className="card-title">{p.title}</span>
                  <span className="card-meta">{p.meta.fr}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="case-heading">Notre méthode</h2>
          <ol className="case-steps">
            {METHOD.steps.map((st, i) => (
              <li key={i}><strong>{String(i + 1).padStart(2, '0')} {st.label.fr}</strong>{st.text.fr}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="case-heading">Questions fréquentes</h2>
          <div className="faq">
            {FAQ.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <h2 className="case-heading">Parlons de votre projet</h2>
          <p>Décrivez votre projet en quatre étapes : réponse sous 24h ouvrées, cadrage stratégique offert.</p>
          <div className="contact-actions">
            <Link className="pill-button" to="/contact">{COPY.start.fr}</Link>
            <a className="pill-button is-quiet" href={whatsappLink(SITE.contact.whatsappMessage.fr)} target="_blank" rel="noopener">{COPY.whatsappCta.fr}</a>
          </div>
        </section>
      </div>
    </PlainPage>
  );
}
