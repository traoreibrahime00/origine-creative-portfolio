// The whole site on one page: intro, studio, projects, services, journal,
// gallery and a footer that turns the page over. Projects, articles and the
// studio open as full-screen sheets that grow out of the card you picked;
// each sheet has its own address, so links and the back button keep working.
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { SEO } from '../components/SEO';
import {
  COPY, EMAIL, GALLERY, METHOD, POSTS, PROJECTS, SERVICES, STUDIO, WHATSAPP,
  type Block, type Fact, type Img, type Lang,
} from './content';
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
  if (section === 'blog' && slug) return 'journal-' + slug;
  if (section === 'a-propos') return 'studio';
  if (section === 'methode') return 'methode';
  return null;
}

function sectionFor(pathname: string) {
  const section = pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
  return ({ projets: 'projects', services: 'services', blog: 'journal', galerie: 'gallery', 'a-propos': 'studio', methode: 'studio' } as Record<string, string>)[section] || null;
}

const style = (vars: Record<string, string | number>) => vars as CSSProperties;

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
  useLayoutEffect(() => {
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

  const sheetTitle = sheetId
    ? [...PROJECTS.map((p) => [`projects-${p.slug}`, p.title]), ...POSTS.map((p) => [`journal-${p.slug}`, p.title]), ['studio', STUDIO.title[lang]], ['methode', METHOD.title[lang]]]
        .find(([id]) => id === sheetId)?.[1]
    : null;
  const projectBySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));
  const heroSlug = { agri: 'agri-build', katana: 'katana', arafat: 'dj-arafat' } as const;

  return (
    <div className="oc-page" ref={pageRef}>
      <SEO
        title={sheetTitle ? `${sheetTitle} — Origine Creative` : 'Origine Creative — Branding & Communication, Abidjan'}
        description="Origine Creative est un studio de branding et de communication à Abidjan : stratégie de marque, identité visuelle, communication digitale, motion design et direction artistique."
      />
      <main className="oc-main">
        {/* ---- Intro ---- */}
        <section id="about" className="site-section">
          <div className="home-hero content-width">
            <div className="hero-identity">
              <div>
                <h1>
                  <button className="name-open" type="button" data-controls="studio" aria-expanded="false" onClick={opener('/a-propos', 'studio')}>
                    {COPY.name}
                    <BrandO className="name-face" />
                  </button>
                </h1>
                <span className="title">{COPY.title[lang]}</span>
              </div>
              <button
                type="button"
                className="lang-switch"
                onClick={() => i18n.changeLanguage(lang === 'fr' ? 'en' : 'fr')}
                aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
              >
                <span aria-current={lang === 'fr'}>FR</span>
                <span aria-current={lang === 'en'}>EN</span>
              </button>
            </div>
            <section className="hero-statement" key={lang}>
              <p>
                {template(COPY.hero[lang], (key, words) => {
                  const p = projectBySlug[heroSlug[key as keyof typeof heroSlug]];
                  return (
                    <a
                      href={`/projets/${p.slug}`}
                      data-peek={p.cover.small || p.cover.src}
                      data-peek-r={p.cover.r}
                      onClick={opener(`/projets/${p.slug}`, `projects-${p.slug}`)}
                    >
                      {words(COPY.heroLinks[key as keyof typeof COPY.heroLinks])}
                    </a>
                  );
                }, true)}
              </p>
            </section>
          </div>
        </section>

        {/* ---- Studio ---- */}
        <section id="studio" className="site-section content-width">
          <header className="section-header">
            <h2 className="section-title">{COPY.studioTitle[lang]}</h2>
          </header>
          <div className="company-grid">
            <a className="card company" href="/a-propos" data-controls="studio" aria-expanded="false" onClick={opener('/a-propos', 'studio')}>
              <span className="company-mark" aria-hidden="true"><BrandO /></span>
              <span className="card-title">Origine Creative</span>
              <span className="company-line">{STUDIO.line[lang]}</span>
            </a>
            <a className="card company" href="/methode" data-controls="methode" aria-expanded="false" onClick={opener('/methode', 'methode')}>
              <span className="company-mark is-wide" aria-hidden="true"><StepsMark /></span>
              <span className="card-title">{METHOD.title[lang]}</span>
              <span className="company-line">{METHOD.line[lang]}</span>
            </a>
          </div>
          <div className="hero-statement products-statement">
            <p>
              {template(COPY.expertise[lang], (key) => (
                <a href="/services" onClick={scrollTo('services')}>
                  {COPY.expertiseLinks[key as keyof typeof COPY.expertiseLinks][lang]}
                </a>
              ))}
            </p>
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
            <p className="reveal">{COPY.servicesIntro[lang]}</p>
            <Services lang={lang} />
            <p className="reveal">{COPY.servicesOutro[lang]}</p>
            <p className="reveal">
              {template(COPY.servicesCta[lang], () => (
                <button className="copy-email" type="button" onClick={copyEmail}>{COPY.servicesCtaLink[lang]}</button>
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
          <img className="footer-logo footer-in" style={style({ '--i': 0 })} src="/logo.png" width={3209} height={979} alt="Origine Creative" loading="lazy" decoding="async" />
          <p className="footer-line footer-in" style={style({ '--i': 1 })}>
            {COPY.footerLine[lang]}
            <svg className="footer-stroke" viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true">
              <path pathLength={1} d="M3 8.5 C 46 4.2, 92 3.4, 132 5.6 S 205 9.8, 237 4.2" />
            </svg>
          </p>
          <p className="footer-in" style={style({ '--i': 2 })}>
            <button className="copy-email" type="button" onClick={copyEmail}>{EMAIL}</button>
          </p>
          <p className="site-footer-links footer-in" style={style({ '--i': 3 })}>
            <Link to="/contact">{COPY.contact[lang]}</Link>
            <a href={WHATSAPP} target="_blank" rel="noopener">WhatsApp</a>
            <a href="/a-propos" onClick={opener('/a-propos', 'studio')}>{STUDIO.title[lang]}</a>
            <Link to="/mentions-legales">{COPY.legal[lang]}</Link>
            <Link to="/politique-de-confidentialite">{COPY.privacy[lang]}</Link>
          </p>
          <p className="site-footer-links footer-in" style={style({ '--i': 4 })}>
            <span>{COPY.location[lang]}</span>
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

      {POSTS.map((post) => (
        <Sheet key={post.slug} id={`journal-${post.slug}`} title={post.title} meta={post.date} path={`/blog/${post.slug}`} fill={post.fill} lang={lang} onClose={closeSheet}>
          <div className="post-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </Sheet>
      ))}

      <Sheet id="studio" title={STUDIO.title[lang]} path="/a-propos" fill="var(--tile-fill)" lang={lang} onClose={closeSheet}>
        <div className="case">
          <div className="post-content">
            {STUDIO.paragraphs.map((t, i) => <p key={i}>{t[lang]}</p>)}
          </div>
          <Facts facts={STUDIO.facts} lang={lang} />
        </div>
      </Sheet>

      <Sheet id="methode" title={METHOD.title[lang]} path="/methode" fill="var(--tile-fill)" lang={lang} onClose={closeSheet}>
        <div className="case">
          <div className="post-content"><p>{METHOD.intro[lang]}</p></div>
          <ol className="case-steps">
            {METHOD.steps.map((s, i) => (
              <li key={i}><strong>{String(i + 1).padStart(2, '0')} {s.label[lang]}</strong>{s.text[lang]}</li>
            ))}
          </ol>
        </div>
      </Sheet>

      <div className={'copy-toast' + (toast ? ' is-visible' : '')} role="status" aria-live="polite">
        {toast ? COPY.copied[lang] : ''}
      </div>
    </div>
  );
}

// ---- Pieces ----

function Services({ lang }: { lang: Lang }) {
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
            <p>{s.desc[lang]}</p>
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
          <h3 className="sheet-title" tabIndex={-1}>{title}</h3>
          {meta && <p className="sheet-meta">{meta}</p>}
          {children}
        </div>
      </div>
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

// Three steps, rising: immersion, design, roll-out
function StepsMark() {
  return (
    <svg viewBox="0 0 64 40" aria-hidden="true">
      <rect x="0" y="24" width="16" height="16" fill="currentColor" />
      <rect x="24" y="12" width="16" height="28" fill="currentColor" />
      <rect x="48" y="0" width="16" height="40" fill="currentColor" />
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
): ReactNode[] {
  let index = 0;
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
