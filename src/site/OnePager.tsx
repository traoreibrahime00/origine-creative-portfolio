// The whole site on one page: intro, studio, projects, services, journal,
// gallery and a footer that turns the page over. Projects, articles and the
// studio open as full-screen sheets that grow out of the card you picked;
// each sheet has its own address, so links and the back button keep working.
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { SEO, SITE_URL } from '../components/SEO';
import {
  COPY, EMAIL, GALLERY, METHOD, POSTS, PROJECTS, SERVICES, SITE, STUDIO, whatsappLink,
  type Block, type Fact, type Img, type Lang,
} from './content';
import { Logo } from './Logo';
import { BackLink } from './BackLink';
import { ThemeSwitch } from './ThemeSwitch';
import {
  copyText, initFooter, initHeroPeek, initInputModality, initPullToClose, initRail,
  initReveals, initTilt, reduceMotion, setSheetOpen,
} from './behaviors';
import { DepthGallery } from './DepthGallery';

type Opener = HTMLElement & { _opener?: HTMLElement | null };

// "/projets/katana" → the sheet it opens; "/projets" → the section it scrolls to
function sheetFor(pathname: string) {
  const [section, slug] = pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (section === 'projets' && slug) return 'projects-' + slug;
  if (section === 'services' && slug) return 'service-' + slug;
  if (section === 'blog' && slug) return 'journal-' + slug;
  if (section === 'a-propos') return 'sheet-studio';
  if (section === 'methode') return 'sheet-methode';
  return null;
}

function sectionFor(pathname: string) {
  const section = pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
  return ({ projets: 'projects', services: 'services', blog: 'journal', galerie: 'gallery', 'a-propos': 'studio', methode: 'studio' } as Record<string, string>)[section] || null;
}

const style = (vars: Record<string, string | number>) => vars as CSSProperties;
// Layout effects only run in the browser; the build-time render skips them quietly.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function OnePager() {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language?.startsWith('en') ? 'en' : 'fr';
  const location = useLocation();
  const navigate = useNavigate();
  const sheetId = sheetFor(location.pathname);
  const pageRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState(false);

  // ---- Sheets follow the address ----
  const firstRun = useRef(true);
  const openId = useRef<string | null>(null);
  useBrowserLayoutEffect(() => {
    const first = firstRun.current;
    firstRun.current = false;
    if (first) {
      // Land directly on the addressed section; entrance motion is for the top.
      const section = sectionFor(location.pathname);
      if (section) {
        document.body.dataset.focus = section;
        document.getElementById(section)?.scrollIntoView({ block: 'start' });
      }
    }
    const prev = openId.current;
    if (prev && prev !== sheetId) {
      const el = document.getElementById(prev);
      if (el) setSheetOpen(el, false, !!sheetId);
    }
    if (sheetId) {
      const el = document.getElementById(sheetId);
      if (el) setSheetOpen(el, true, first);
    }
    openId.current = sheetId;
  }, [sheetId, location.pathname]);

  const fromPage = (location.state as { sheet?: boolean } | null)?.sheet;
  const closeSheet = useCallback(() => {
    if (fromPage) navigate(-1);
    else navigate('/', { replace: true });
  }, [fromPage, navigate]);
  const closeRef = useRef(closeSheet);
  closeRef.current = closeSheet;

  const openFrom = useCallback((el: HTMLElement, path: string, controls: string) => {
    const article = document.getElementById(controls) as Opener | null;
    if (article) article._opener = el.closest('.card') ? el : document.querySelector<HTMLElement>(`.card[data-controls="${controls}"]`);
    navigate(path, { state: { sheet: true } });
  }, [navigate]);
  // navigate() changes with every address, so the DOM wiring below reaches
  // these through refs and is set up once.
  const openRef = useRef(openFrom);
  openRef.current = openFrom;

  // Click handler for any link that opens a sheet (hero names, footer)
  const opener = (path: string, controls: string) => (e: React.MouseEvent<HTMLElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    openFrom(e.currentTarget, path, controls);
  };

  // ---- Behaviour that lives outside React ----
  useEffect(() => {
    const page = pageRef.current!;
    const offs: (() => void)[] = [initInputModality(), initReveals(page)];
    page.querySelectorAll<HTMLElement>('.company-mark').forEach((tile) => offs.push(initTilt(tile)));
    page.querySelectorAll<HTMLElement>('.card-rail').forEach((rail) => {
      offs.push(initRail(rail, (card) => openRef.current(card, card.getAttribute('href')!, card.dataset.controls!)));
    });
    page.querySelectorAll<HTMLElement>('.sheet').forEach((sheet) => {
      if (!sheet.classList.contains('is-open')) sheet.querySelector('.sheet-scroll')?.setAttribute('inert', '');
      offs.push(initPullToClose(sheet, () => closeRef.current()));
    });
    const footer = page.querySelector<HTMLElement>('.site-footer');
    if (footer) offs.push(initFooter(footer));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.documentElement.classList.contains('has-sheet')) closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      offs.forEach((off) => off());
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('has-sheet');
    };
  }, []);

  // The intro is re-rendered per language, so its peek links are re-bound too.
  useEffect(() => {
    const links = Array.from(pageRef.current!.querySelectorAll<HTMLElement>('.hero-statement a[data-peek]'));
    return initHeroPeek(links);
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const copyEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    if (await copyText(EMAIL)) {
      button.classList.add('copied');
      setToast(true);
      setTimeout(() => { button.classList.remove('copied'); setToast(false); }, 1800);
    } else {
      window.location.href = 'mailto:' + EMAIL;
    }
  };

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  const meta = metaFor(sheetId, location.pathname, lang);
  const whatsapp = whatsappLink(SITE.contact.whatsappMessage[lang]);
  const booking = SITE.contact.booking;
  const projectBySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));
  const linkFor = (links: typeof SITE.hero.links, key: string) => links.find((l) => l.key === key);

  return (
    <div className="oc-page" ref={pageRef}>
      <SEO {...meta} />
      <main className="oc-main">
        {/* ---- Intro ---- */}
        <section id="about" className="site-section">
          <div className="home-hero content-width">
            <div className="hero-identity">
              <div>
                <div className="hero-name">
                  <button className="name-open" type="button" data-controls="sheet-studio" aria-expanded="false" aria-label="Origine Creative" onClick={opener('/a-propos', 'sheet-studio')}>
                    <Logo className="hero-logo" />
                  </button>
                </div>
                <span className="title">{SITE.identity.title[lang]}</span>
              </div>
              <div className="hero-tools">
                <button
                  type="button"
                  className="lang-switch"
                  onClick={() => i18n.changeLanguage(lang === 'fr' ? 'en' : 'fr')}
                  aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
                >
                  <span aria-current={lang === 'fr'}>FR</span>
                  <span aria-current={lang === 'en'}>EN</span>
                </button>
                <ThemeSwitch label={COPY.theme[lang]} />
              </div>
            </div>
            <section className="hero-statement" key={lang}>
              <p className="hero-eyebrow">{SITE.hero.eyebrow[lang]}</p>
              <h1>{template(SITE.hero.text[lang], (key) => key, true)}</h1>
              <p className="hero-sub">
                {template(SITE.hero.sub[lang], (key, words) => {
                  const link = linkFor(SITE.hero.links, key);
                  const p = link?.project ? projectBySlug[link.project] : undefined;
                  const label = words(link ? link.label[lang] : key);
                  // A word tied to a project opens it and shows its cover on hover;
                  // otherwise it leads to the projects.
                  if (!p) return <a href="/projets" onClick={scrollTo('projects')}>{label}</a>;
                  return (
                    <a
                      href={`/projets/${p.slug}`}
                      data-peek={p.cover.small || p.cover.src}
                      data-peek-r={p.cover.r}
                      onClick={opener(`/projets/${p.slug}`, `projects-${p.slug}`)}
                    >
                      {label}
                    </a>
                  );
                }, true, wordCount(SITE.hero.text[lang]))}
              </p>
              <div className="hero-cta">
                <Link className="pill-button" to="/contact">{SITE.hero.ctaContact[lang]}</Link>
                <a className="hand-link" href="/projets" onClick={scrollTo('projects')}>{SITE.hero.ctaProjects[lang]} ↗</a>
              </div>
            </section>
          </div>
        </section>

        {/* ---- Studio ---- */}
        <section id="studio" className="site-section content-width">
          <header className="section-header">
            <h2 className="section-title">{COPY.studioTitle[lang]}</h2>
          </header>
          <div className="company-grid">
            <a className="card company" href="/a-propos" data-controls="sheet-studio" aria-expanded="false" onClick={opener('/a-propos', 'sheet-studio')}>
              <span className="company-mark" aria-hidden="true"><BrandO /></span>
              <span className="card-title">Origine Creative</span>
              <span className="company-line">{STUDIO.line[lang]}</span>
            </a>
            <a className="card company" href="/methode" data-controls="sheet-methode" aria-expanded="false" onClick={opener('/methode', 'sheet-methode')}>
              <span className="company-mark is-wide" aria-hidden="true"><StepsMark /></span>
              <span className="card-title">{METHOD.title[lang]}</span>
              <span className="company-line">{METHOD.line[lang]}</span>
            </a>
          </div>
          <div className="hero-statement products-statement">
            <p>
              {template(SITE.expertise.text[lang], (key) => (
                <a href="/services" onClick={scrollTo('services')}>
                  {linkFor(SITE.expertise.links, key)?.label[lang] ?? key}
                </a>
              ))}
            </p>
          </div>
        </section>

        {/* ---- Manifesto ---- */}
        <section id="manifeste" className="site-section content-width">
          <header className="section-header">
            <h2 className="section-title">{COPY.manifesto[lang]}</h2>
          </header>
          <div className="manifesto prose-col">
            <p className="manifesto-title reveal">{SITE.manifesto.title[lang]}</p>
            {SITE.manifesto.paragraphs.map((t, i) => (
              <p key={i} className="reveal" style={style({ '--reveal-delay': `${(i + 1) * 90}ms` })}>{t[lang]}</p>
            ))}
          </div>
        </section>

        {/* ---- Projects ---- */}
        <section id="projects" className="site-section content-width">
          <header className="section-header">
            <h2 className="section-title">{COPY.projectsTitle[lang]}</h2>
          </header>
          <div className="reveal">
            <div className="card-rail" role="region" aria-label={COPY.projectsTitle[lang]}>
              {PROJECTS.map((p) => (
                <a key={p.slug} className="card" href={`/projets/${p.slug}`} data-controls={`projects-${p.slug}`} aria-expanded="false" style={style({ '--fill': p.fill })} draggable={false}>
                  <span className="card-media">
                    <img src={p.cover.small || p.cover.src} alt="" draggable={false} decoding="async" />
                  </span>
                  <span className="card-foot">
                    <span className="card-title">{p.title}</span>
                    <span className="card-meta">{p.meta[lang]}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Services ---- */}
        <section id="services" className="site-section">
          <div className="content-width prose-col">
            <p className="reveal">{SITE.services.intro[lang]}</p>
            <Services lang={lang} onOpen={openFrom} />
            <p className="reveal">{SITE.services.outro[lang]}</p>
            <p className="reveal">
              {template(SITE.services.cta[lang], () => (
                <button className="copy-email" type="button" onClick={copyEmail}>{SITE.services.ctaLink[lang]}</button>
              ))}
            </p>
          </div>
        </section>

        {/* ---- Journal ---- */}
        <section id="journal" className="site-section content-width">
          <header className="section-header">
            <h2 className="section-title">{COPY.journalTitle[lang]}</h2>
          </header>
          <div className="reveal">
            <div className="card-rail is-docs" role="region" aria-label={COPY.journalTitle[lang]}>
              {POSTS.map((post) => (
                <a key={post.slug} className="card" href={`/blog/${post.slug}`} data-controls={`journal-${post.slug}`} aria-expanded="false" style={style({ '--fill': post.fill })} draggable={false}>
                  <span className="card-doc" aria-hidden="true">
                    <span className="card-doc-page">
                      <span className="doc-title">{post.title}</span>
                      <span className="doc-meta">{post.date}</span>
                      <span className="doc-body">{plain(post.content).split('\n').slice(0, 8).map((line, i) => <span key={i}>{line}</span>)}</span>
                    </span>
                  </span>
                  <span className="card-foot">
                    <span className="card-title">{post.title}</span>
                    <span className="card-meta">{post.date}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Gallery ---- */}
        <section id="gallery" className="site-section section-wide">
          <header className="section-header">
            <h2 className="section-title">{COPY.galleryTitle[lang]}</h2>
          </header>
          <DepthGallery
            items={GALLERY}
            lang={lang}
            hint={COPY.galleryHint[lang]}
            closeLabel={COPY.close[lang]}
            prevLabel={COPY.prev[lang]}
            nextLabel={COPY.next[lang]}
          />
        </section>

        {/* ---- Footer ---- */}
        <footer className="site-footer content-width">
          <Logo className="footer-logo footer-in" style={style({ '--i': 0 })} />
          <p className="footer-line footer-in" style={style({ '--i': 1 })}>
            {SITE.footerLine[lang]}
            <svg className="footer-stroke" viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true">
              <path pathLength={1} d="M3 8.5 C 46 4.2, 92 3.4, 132 5.6 S 205 9.8, 237 4.2" />
            </svg>
          </p>
          <p className="footer-actions footer-in" style={style({ '--i': 2 })}>
            <a className="pill-button" href={whatsapp} target="_blank" rel="noopener">{COPY.whatsappCta[lang]}</a>
            {booking && <a className="hand-link" href={booking} target="_blank" rel="noopener">{COPY.booking[lang]} ↗</a>}
          </p>
          <p className="footer-in" style={style({ '--i': 3 })}>
            <button className="copy-email" type="button" onClick={copyEmail}>{EMAIL}</button>
          </p>
          <p className="site-footer-links footer-in" style={style({ '--i': 4 })}>
            <Link to="/contact">{COPY.start[lang]}</Link>
            <a href="/a-propos" onClick={opener('/a-propos', 'sheet-studio')}>{STUDIO.title[lang]}</a>
            <Link to="/mentions-legales">{COPY.legal[lang]}</Link>
            <Link to="/politique-de-confidentialite">{COPY.privacy[lang]}</Link>
          </p>
          <p className="site-footer-links footer-in" style={style({ '--i': 5 })}>
            <span>{SITE.contact.location[lang]}</span>
            <span>© {new Date().getFullYear()}</span>
          </p>
        </footer>
      </main>

      {/* ---- Sheets ---- */}
      {PROJECTS.map((p) => (
        <Sheet key={p.slug} id={`projects-${p.slug}`} title={p.title} path={`/projets/${p.slug}`} fill={p.fill} lang={lang} onClose={closeSheet}>
          <div className="case">
            <div className={'case-wide case-cover' + (p.cover.r < 1 ? ' is-portrait' : '')}>
              <img src={p.cover.src} alt={p.cover.alt[lang]} style={style({ '--r': p.cover.r })} loading="lazy" decoding="async" />
            </div>
            <div className="post-content">
              {p.intro.map((t, i) => <p key={i}>{t[lang]}</p>)}
            </div>
            <Facts facts={p.facts} lang={lang} />
            {p.story.length > 0 && (
              <div className="case-story post-content">
                {p.story.map((b, i) => <StoryBlock key={i} block={b} lang={lang} />)}
              </div>
            )}
          </div>
        </Sheet>
      ))}

      {SERVICES.map((sv) => (
        <Sheet key={sv.slug} id={`service-${sv.slug}`} title={sv.title[lang]} meta={sv.desc[lang]} path={`/services/${sv.slug}`} fill="var(--tile-fill)" lang={lang} onClose={closeSheet}>
          <div className="case">
            <p className="case-lead">{sv.benefit[lang]}</p>
            <div className="post-content">
              {sv.intro.map((t, i) => <p key={i}>{t[lang]}</p>)}
            </div>
            <section>
              <h3 className="case-heading">{COPY.deliverables[lang]}</h3>
              <ul className="case-list">
                {sv.deliverables.map((d, i) => <li key={i}>{d[lang]}</li>)}
              </ul>
            </section>
            <section>
              <h3 className="case-heading">{COPY.method[lang]}</h3>
              <ol className="case-steps">
                {METHOD.steps.map((st, i) => (
                  <li key={i}><strong>{String(i + 1).padStart(2, '0')} {st.label[lang]}</strong>{st.text[lang]}</li>
                ))}
              </ol>
            </section>
            {sv.projects.some((slug) => projectBySlug[slug]) && (
              <section>
                <h3 className="case-heading">{COPY.related[lang]}</h3>
                <div className="related-grid">
                  {sv.projects.map((slug) => projectBySlug[slug]).filter(Boolean).map((p) => (
                    <a key={p.slug} className="related-card" href={`/projets/${p.slug}`} onClick={opener(`/projets/${p.slug}`, `projects-${p.slug}`)}>
                      <span className="related-media" style={style({ '--fill': p.fill })}>
                        <img src={p.cover.small || p.cover.src} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="card-foot">
                        <span className="card-title">{p.title}</span>
                        <span className="card-meta">{p.meta[lang]}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}
            {sv.faq.length > 0 && (
              <section>
                <h3 className="case-heading">{COPY.faq[lang]}</h3>
                <div className="faq">
                  {sv.faq.map((f, i) => (
                    <details key={i}>
                      <summary>{f.q[lang]}</summary>
                      <p>{f.a[lang]}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
            <div className="hero-cta">
              <Link className="pill-button" to="/contact">{COPY.start[lang]}</Link>
              <a className="hand-link" href={whatsapp} target="_blank" rel="noopener">WhatsApp ↗</a>
            </div>
          </div>
        </Sheet>
      ))}

      {POSTS.map((post) => (
        <Sheet key={post.slug} id={`journal-${post.slug}`} title={post.title} meta={post.date} path={`/blog/${post.slug}`} fill={post.fill} lang={lang} onClose={closeSheet}>
          <div className="post-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </Sheet>
      ))}

      <Sheet id="sheet-studio" title={STUDIO.title[lang]} path="/a-propos" fill="var(--tile-fill)" lang={lang} onClose={closeSheet}>
        <div className="case">
          <div className="post-content">
            {STUDIO.paragraphs.map((t, i) => <p key={i}>{t[lang]}</p>)}
          </div>
          <Facts facts={STUDIO.facts} lang={lang} />
        </div>
      </Sheet>

      <Sheet id="sheet-methode" title={METHOD.title[lang]} path="/methode" fill="var(--tile-fill)" lang={lang} onClose={closeSheet}>
        <div className="case">
          <div className="post-content"><p>{METHOD.intro[lang]}</p></div>
          <ol className="case-steps">
            {METHOD.steps.map((s, i) => (
              <li key={i}><strong>{String(i + 1).padStart(2, '0')} {s.label[lang]}</strong>{s.text[lang]}</li>
            ))}
          </ol>
        </div>
      </Sheet>

      <a className="quick-whatsapp" href={whatsapp} target="_blank" rel="noopener" aria-label={COPY.whatsappCta[lang]}>
        <WhatsAppIcon />
        <span>{COPY.whatsappCta[lang]}</span>
      </a>

      <div className={'copy-toast' + (toast ? ' is-visible' : '')} role="status" aria-live="polite">
        {toast ? COPY.copied[lang] : ''}
      </div>
    </div>
  );
}

// ---- Pieces ----

function Services({ lang, onOpen }: { lang: Lang; onOpen: (el: HTMLElement, path: string, controls: string) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const toggle = (i: number) => setOpen(open === i ? null : i);
  return (
    <section className="how-i-work reveal">
      <header className="section-header">
        <h2 className="section-title">{COPY.servicesTitle[lang]}</h2>
      </header>
      <div className="work-grid">
        {SERVICES.map((s, i) => (
          <div
            key={i}
            className={'work-card' + (open === i ? ' is-open' : '')}
            role="button"
            tabIndex={0}
            aria-expanded={open === i}
            onClick={() => toggle(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); }
            }}
          >
            <span className="work-num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title[lang]}</h3>
            <span className="work-indicator" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M3.5 6 8 10.5 12.5 6" /></svg>
            </span>
            <p>
              {s.desc[lang]} <span className="work-benefit">{s.benefit[lang]}</span>{' '}
              <a
                className="work-more"
                href={`/services/${s.slug}`}
                tabIndex={open === i ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                  e.preventDefault();
                  onOpen(e.currentTarget, `/services/${s.slug}`, `service-${s.slug}`);
                }}
              >
                {COPY.more[lang]} →
              </a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Sheet({ id, title, meta, path, fill, lang, onClose, children }: {
  id: string; title: string; meta?: string; path: string; fill: string; lang: Lang; onClose: () => void; children: ReactNode;
}) {
  return (
    <article id={id} className="sheet" data-title={title} style={style({ '--fill': fill })}>
      <div className="sheet-scroll" id={`${id}-panel`}>
        <div className="sheet-inner content-width">
          <BackLink label={COPY.back[lang]} onBack={onClose} className="is-inline" />
          <h2 className="sheet-title" tabIndex={-1}>{title}</h2>
          {meta && <p className="sheet-meta">{meta}</p>}
          {children}
        </div>
      </div>
      <BackLink label={COPY.back[lang]} onBack={onClose} className="is-pinned" />
      <a
        className="sheet-close"
        href={path}
        aria-expanded="false"
        aria-controls={`${id}-panel`}
        aria-label={`${COPY.close[lang]} ${title}`}
        onClick={(e) => { e.preventDefault(); onClose(); }}
      >
        <span aria-hidden="true" />
      </a>
    </article>
  );
}

function Facts({ facts, lang }: { facts: Fact[]; lang: Lang }) {
  return (
    <dl className="case-facts">
      {facts.map((f, i) => (
        <div key={i}>
          <dt>{f.label[lang]}</dt>
          <dd>
            {f.href ? (
              <a className="hand-link" href={f.href} target={f.href.startsWith('http') ? '_blank' : undefined} rel="noopener">{f.value[lang]}</a>
            ) : f.value[lang]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Picture({ img, lang }: { img: Img; lang: Lang }) {
  return (
    <img
      src={img.src}
      srcSet={img.small ? `${img.small} 720w, ${img.src} 1600w` : undefined}
      sizes={img.small ? '(max-width: 600px) 100vw, 60rem' : undefined}
      alt={img.alt[lang]}
      loading="lazy"
      decoding="async"
      style={style({ '--r': img.r })}
    />
  );
}

function StoryBlock({ block, lang }: { block: Block; lang: Lang }) {
  switch (block.kind) {
    case 'h':
      return <h4>{block.text[lang]}</h4>;
    case 'p':
      return <p>{block.text[lang]}</p>;
    case 'quote':
      return <blockquote><p>{block.text[lang]}</p></blockquote>;
    case 'figure': {
      const portrait = block.images.length === 1 && block.images[0].r < 1;
      return (
        <figure className={'figure' + (portrait ? ' is-portrait' : '')}>
          {block.images.map((img, i) => <Picture key={i} img={img} lang={lang} />)}
          {block.caption && <figcaption>{block.caption[lang]}</figcaption>}
        </figure>
      );
    }
    case 'strip':
      return (
        <div className="case-strip" tabIndex={0}>
          {block.images.map((img, i) => (
            <img key={i} src={img.small || img.src} alt={img.alt[lang]} loading="lazy" decoding="async" style={style({ '--r': img.r })} />
          ))}
        </div>
      );
  }
}

// The brand's O, drawn as a ring so it can sit on any background
function BrandO({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 96" aria-hidden="true">
      <path
        fill="#d7191c"
        fillRule="evenodd"
        d="M50 0C21 0 0 18.5 0 48s21 48 50 48 50-18.5 50-48S79 0 50 0Zm0 19c-16.5 0-30 10-30 29s13.5 29 30 29 30-10 30-29-13.5-29-30-29Z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.2 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.1-.1Z"
      />
    </svg>
  );
}

// Four steps, rising: audit, strategy, design, roll-out
function StepsMark() {
  return (
    <svg viewBox="0 0 88 40" aria-hidden="true">
      <rect x="0" y="28" width="16" height="12" fill="currentColor" />
      <rect x="24" y="19" width="16" height="21" fill="currentColor" />
      <rect x="48" y="10" width="16" height="30" fill="currentColor" />
      <rect x="72" y="0" width="16" height="40" fill="currentColor" />
    </svg>
  );
}

// Fills "{key}" slots in a sentence. With `animate`, every word becomes its
// own span so the intro can write itself in, inside links too, and a name
// keeps the punctuation that follows it on the same line.
function template(
  text: string,
  slot: (key: string, words: (s: string) => ReactNode) => ReactNode,
  animate = false,
  from = 0,
): ReactNode[] {
  // `from` carries the word count of an earlier sentence, so a second one
  // keeps writing where the first stopped.
  let index = from;
  const words = (s: string): ReactNode =>
    !animate
      ? s
      : s.split(/(\s+)/).map((w, i) =>
          !w ? null : /^\s+$/.test(w) ? w : (
            <span key={i} className="word" style={{ animationDelay: `${(0.3 + index++ * 0.04).toFixed(2)}s` }}>{w}</span>
          ),
        );

  const parts = text.split(/(\{\w+\})/);
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const match = part.match(/^\{(\w+)\}$/);
    if (!match) {
      if (part) out.push(<Fragment key={i}>{words(part)}</Fragment>);
      continue;
    }
    const node = slot(match[1], words);
    const after = parts[i + 1]?.match(/^[^\s]+/)?.[0];
    if (after) parts[i + 1] = parts[i + 1].slice(after.length);
    out.push(
      <span key={i} className="nowrap">
        {node}
        {after && words(after)}
      </span>,
    );
  }
  return out;
}

// Title, description, address and structured data of the page being shown
function metaFor(sheetId: string | null, pathname: string, lang: Lang) {
  const base = {
    title: 'Origine Creative — Agence de branding & direction artistique à Abidjan',
    description: 'Origine Creative bâtit des marques singulières à Abidjan, en Afrique et à l’international : stratégie de marque, identité visuelle, direction artistique, motion design et communication digitale.',
    path: '/',
  };
  // The sections' own addresses (/services, /projets…) are the home page
  if (!sheetId) return base;
  const path = pathname.replace(/\/$/, '');
  const service = SERVICES.find((s) => `service-${s.slug}` === sheetId);
  if (service) {
    const url = SITE_URL + path;
    return {
      title: service.seoTitle[lang],
      description: service.seoDescription[lang],
      path,
      schema: [
        {
          '@type': 'Service',
          '@id': `${url}#service`,
          name: service.title[lang],
          description: service.seoDescription[lang],
          url,
          provider: { '@id': `${SITE_URL}/#organization` },
          areaServed: [{ '@type': 'City', name: 'Abidjan' }, { '@type': 'Country', name: 'Côte d’Ivoire' }],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: service.title[lang],
            itemListElement: service.deliverables.map((d) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: d[lang] } })),
          },
        },
        ...(service.faq.length
          ? [{
              '@type': 'FAQPage',
              mainEntity: service.faq.map((f) => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: f.a[lang] } })),
            }]
          : []),
      ],
    };
  }
  const project = PROJECTS.find((p) => `projects-${p.slug}` === sheetId);
  if (project) {
    return {
      title: `${project.title} — ${project.meta[lang]} | Origine Creative`,
      description: project.intro[0]?.[lang] || base.description,
      path,
      image: SITE_URL + project.cover.src,
      schema: [{ '@type': 'CreativeWork', name: project.title, url: SITE_URL + path, creator: { '@id': `${SITE_URL}/#organization` } }],
    };
  }
  const post = POSTS.find((p) => `journal-${p.slug}` === sheetId);
  if (post) {
    return {
      title: `${post.title} | Origine Creative`,
      description: post.excerpt,
      path,
      type: 'article' as const,
      schema: [{ '@type': 'Article', headline: post.title, description: post.excerpt, url: SITE_URL + path, publisher: { '@id': `${SITE_URL}/#organization` } }],
    };
  }
  if (sheetId === 'sheet-studio') return { title: `${STUDIO.title[lang]} — Origine Creative`, description: STUDIO.paragraphs[0]?.[lang] || base.description, path };
  if (sheetId === 'sheet-methode') return { title: `${METHOD.title[lang]} — Origine Creative`, description: METHOD.intro[lang], path };
  return base;
}

const wordCount = (text: string) => text.replace(/\{\w+\}/g, 'x').split(/\s+/).filter(Boolean).length;

// Markdown to a plain preview for the paper cards
function plain(md: string) {
  return md
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*|__|\*|_|`/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*>]\s+/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}
