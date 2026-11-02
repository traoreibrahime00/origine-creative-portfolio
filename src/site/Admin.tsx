// /admin: edit everything the one-pager shows. Online, saving commits the
// content files to GitHub and Vercel publishes them; on the dev server the
// same actions write to disk (see vite.config.ts).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeSwitch } from './ThemeSwitch';
import type { Block, Fact, Img, Post, Project, Service, Site, SlotLink, T } from './content';

type Tab = 'textes' | 'projets' | 'services' | 'galerie' | 'journal' | 'contact';
const TABS: [Tab, string][] = [
  ['textes', 'Textes'], ['projets', 'Projets'], ['services', 'Services'],
  ['galerie', 'Galerie'], ['journal', 'Journal'], ['contact', 'Contact'],
];

const KEY = 'oc-admin-key';
const emptyT = (): T => ({ fr: '', en: '' });
const emptyImg = (): Img => ({ src: '', r: 1.6, alt: emptyT() });
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function api(key: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
  if (!res.ok) throw Object.assign(new Error(data.error || `Erreur ${res.status}`), { status: res.status });
  return data;
}

// Resize in the browser before upload: a 1600 px picture for sheets and a
// 720 px one for cards and the gallery, both JPEG on white.
async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const encode = (max: number) => {
    const scale = Math.min(1, max / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  };
  return { full: encode(1600), small: encode(720), r: Math.round((bitmap.width / bitmap.height) * 10000) / 10000 };
}

export function AdminPage() {
  const [key, setKey] = useState(() => { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } });
  const [phase, setPhase] = useState<'loading' | 'login' | 'ready'>('loading');
  const [loginError, setLoginError] = useState('');
  const [mode, setMode] = useState<'github' | 'local'>('github');
  const [site, setSite] = useState<Site | null>(null);
  const [blog, setBlog] = useState<Post[]>([]);
  const saved = useRef({ site: '', blog: '' });
  const [tab, setTab] = useState<Tab>('projets');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const previews = useRef(new Map<string, string>());

  const load = async (k: string) => {
    try {
      const data = await api(k, { action: 'load' });
      setSite(data.site);
      setBlog(data.blog);
      setMode(data.mode);
      saved.current = { site: JSON.stringify(data.site), blog: JSON.stringify(data.blog) };
      try { sessionStorage.setItem(KEY, k); } catch { /* the password is asked again next visit */ }
      setPhase('ready');
    } catch (err) {
      const e = err as Error & { status?: number };
      setLoginError(k || e.status === 503 ? e.message : '');
      setPhase('login');
    }
  };

  useEffect(() => { load(key); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = !!site && (JSON.stringify(site) !== saved.current.site || JSON.stringify(blog) !== saved.current.blog);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Immutable edits: work on a copy, then hand it back
  const edit = (fn: (s: Site) => void) => setSite((s) => { const n = structuredClone(s!); fn(n); return n; });
  const editBlog = (fn: (b: Post[]) => void) => setBlog((b) => { const n = structuredClone(b); fn(n); return n; });

  const upload = async (file: File, name: string): Promise<Img> => {
    const img = await prepareImage(file);
    const out = await api(key, { action: 'upload', name, full: img.full, small: img.small });
    previews.current.set(out.src, img.small);
    if (out.small) previews.current.set(out.small, img.small);
    return { src: out.src, small: out.small, r: img.r, alt: emptyT() };
  };

  const problems = (s: Site) => {
    const list: string[] = [];
    const slugs = new Set<string>();
    s.projects.forEach((p, i) => {
      if (!p.title.trim()) list.push(`Projet ${i + 1} : titre manquant`);
      if (!p.slug.trim()) list.push(`Projet ${p.title || i + 1} : adresse manquante`);
      if (slugs.has(p.slug)) list.push(`Deux projets ont l'adresse « ${p.slug} »`);
      slugs.add(p.slug);
      if (!p.cover.src) list.push(`Projet ${p.title || i + 1} : image de couverture manquante`);
    });
    s.gallery.forEach((g, i) => { if (!g.img.src) list.push(`Galerie, image ${i + 1} manquante`); });
    const serviceSlugs = new Set<string>();
    s.services.items.forEach((sv, i) => {
      if (!sv.slug.trim() || serviceSlugs.has(sv.slug)) list.push(`Service ${sv.title.fr || i + 1} : adresse manquante ou en double`);
      serviceSlugs.add(sv.slug);
    });
    const postSlugs = new Set<string>();
    blog.forEach((p, i) => {
      if (!p.slug.trim() || postSlugs.has(p.slug)) list.push(`Article ${p.title || i + 1} : adresse manquante ou en double`);
      postSlugs.add(p.slug);
    });
    return list;
  };

  const save = async () => {
    if (!site) return;
    const issues = problems(site);
    if (issues.length) { setStatus('À corriger : ' + issues.join(' · ')); return; }
    setBusy(true);
    setStatus('Enregistrement…');
    try {
      const siteText = JSON.stringify(site);
      const blogText = JSON.stringify(blog);
      if (siteText !== saved.current.site) {
        await api(key, { action: 'save', file: 'site', data: site });
        saved.current.site = siteText;
      }
      if (blogText !== saved.current.blog) {
        await api(key, { action: 'save', file: 'blog', data: blog });
        saved.current.blog = blogText;
      }
      setStatus(mode === 'github'
        ? 'Enregistré. Le site en ligne sera à jour dans une minute environ.'
        : 'Enregistré dans src/data (serveur local).');
    } catch (err) {
      setStatus('Échec : ' + (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'loading') return <AdminShell><p className="adm-muted">Chargement…</p></AdminShell>;

  if (phase === 'login' || !site) {
    return (
      <AdminShell>
        <form className="adm-login" onSubmit={(e) => { e.preventDefault(); setPhase('loading'); setKey(key); load(key); }}>
          <h1 className="page-title">Administration</h1>
          <label className="adm-field">
            <span>Mot de passe</span>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} autoFocus autoComplete="current-password" />
          </label>
          {loginError && <p className="adm-error">{loginError}</p>}
          <button className="pill-button" type="submit">Entrer</button>
        </form>
      </AdminShell>
    );
  }

  const ctx: Ctx = { edit, upload, previews: previews.current };

  return (
    <AdminShell
      bar={
        <div className="adm-bar">
          <nav className="adm-tabs" aria-label="Sections">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" aria-current={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </nav>
          <div className="adm-actions">
            <span className="adm-status" role="status">{status || (dirty ? 'Modifications non enregistrées' : '')}</span>
            <button className="pill-button" type="button" onClick={save} disabled={busy || !dirty}>
              {mode === 'github' ? 'Enregistrer et publier' : 'Enregistrer'}
            </button>
          </div>
        </div>
      }
    >
      {tab === 'textes' && <TextsTab site={site} ctx={ctx} />}
      {tab === 'projets' && <ProjectsTab site={site} ctx={ctx} />}
      {tab === 'services' && <ServicesTab site={site} ctx={ctx} />}
      {tab === 'galerie' && <GalleryTab site={site} ctx={ctx} />}
      {tab === 'journal' && <JournalTab blog={blog} editBlog={editBlog} />}
      {tab === 'contact' && <ContactTab site={site} ctx={ctx} />}
    </AdminShell>
  );
}

type Ctx = {
  edit: (fn: (s: Site) => void) => void;
  upload: (file: File, name: string) => Promise<Img>;
  previews: Map<string, string>;
};

function AdminShell({ children, bar }: { children: ReactNode; bar?: ReactNode }) {
  return (
    <div className="adm">
      <Helmet>
        <title>Administration — Origine Creative</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="adm-head">
        <Link to="/" aria-label="Voir le site"><Logo className="adm-logo" /></Link>
        <div className="adm-head-right">
          <Link to="/" className="adm-muted" target="_blank">Voir le site ↗</Link>
          <ThemeSwitch label="Mode sombre" />
        </div>
      </header>
      {bar}
      <main className="adm-main">{children}</main>
    </div>
  );
}

// ---- Fields ----

function Field({ label, value, onChange, multiline, type = 'text', hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string; hint?: string;
}) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Bi({ label, value, onChange, multiline, hint }: {
  label: string; value: T | undefined; onChange: (v: T) => void; multiline?: boolean; hint?: string;
}) {
  const v = value || emptyT();
  return (
    <fieldset className="adm-bi">
      <legend>{label}</legend>
      <Field label="Français" value={v.fr} onChange={(fr) => onChange({ ...v, fr })} multiline={multiline} />
      <Field label="English" value={v.en} onChange={(en) => onChange({ ...v, en })} multiline={multiline} />
      {hint && <small>{hint}</small>}
    </fieldset>
  );
}

function ImageField({ label, value, onChange, ctx, name }: {
  label: string; value: Img; onChange: (v: Img) => void; ctx: Ctx; name: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState('');
  const shown = ctx.previews.get(value.src) || value.small || value.src;
  const pick = async (file?: File) => {
    if (!file) return;
    setState('Envoi…');
    try {
      const img = await ctx.upload(file, name || file.name.replace(/\.\w+$/, ''));
      onChange({ ...img, alt: value.alt });
      setState('');
    } catch (err) {
      setState('Échec : ' + (err as Error).message);
    }
  };
  return (
    <div className="adm-image">
      <span className="adm-label">{label}</span>
      <div className="adm-image-row">
        <button type="button" className="adm-thumb" onClick={() => input.current?.click()} style={{ aspectRatio: String(value.r || 1.6) }}>
          {shown ? <img src={shown} alt="" /> : <span>Choisir une image</span>}
        </button>
        <div className="adm-image-side">
          <button type="button" className="adm-link" onClick={() => input.current?.click()}>{shown ? 'Remplacer' : 'Choisir une image'}</button>
          {state && <small>{state}</small>}
          <Bi label="Description (accessibilité)" value={value.alt} onChange={(alt) => onChange({ ...value, alt })} />
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

// A list whose items can be moved, removed and added
function List<I>({ items, render, onChange, add, addLabel, title }: {
  items: I[]; render: (item: I, i: number) => ReactNode; onChange: (items: I[]) => void;
  add?: () => I; addLabel?: string; title?: (item: I, i: number) => string;
}) {
  const move = (i: number, d: number) => {
    const next = items.slice();
    const [it] = next.splice(i, 1);
    next.splice(i + d, 0, it);
    onChange(next);
  };
  return (
    <div className="adm-list">
      {items.map((item, i) => (
        <div className="adm-item" key={i}>
          <div className="adm-item-bar">
            <span>{title ? title(item, i) : String(i + 1).padStart(2, '0')}</span>
            <span className="adm-item-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Descendre">↓</button>
              <button type="button" onClick={() => { if (confirm('Supprimer cet élément ?')) onChange(items.filter((_, j) => j !== i)); }} aria-label="Supprimer">✕</button>
            </span>
          </div>
          {render(item, i)}
        </div>
      ))}
      {add && <button type="button" className="adm-add" onClick={() => onChange([...items, add()])}>+ {addLabel || 'Ajouter'}</button>}
    </div>
  );
}

function Facts({ facts, onChange }: { facts: Fact[]; onChange: (f: Fact[]) => void }) {
  return (
    <List<Fact>
      items={facts}
      onChange={onChange}
      add={() => ({ label: emptyT(), value: emptyT() })}
      addLabel="Ajouter une ligne"
      title={(f, i) => f.label.fr || `Ligne ${i + 1}`}
      render={(f, i) => (
        <>
          <Bi label="Intitulé" value={f.label} onChange={(label) => onChange(facts.map((x, j) => (j === i ? { ...x, label } : x)))} />
          <Bi label="Valeur" value={f.value} onChange={(value) => onChange(facts.map((x, j) => (j === i ? { ...x, value } : x)))} />
          <Field label="Lien (facultatif)" value={f.href || ''} onChange={(href) => onChange(facts.map((x, j) => (j === i ? { ...x, href: href || undefined } : x)))} hint="https://… ou mailto:…" />
        </>
      )}
    />
  );
}

function Links({ links, onChange, projects }: { links: SlotLink[]; onChange: (l: SlotLink[]) => void; projects?: Project[] }) {
  return (
    <List<SlotLink>
      items={links}
      onChange={onChange}
      add={() => ({ key: 'mot' + (links.length + 1), label: emptyT() })}
      addLabel="Ajouter un mot lié"
      title={(l) => `{${l.key}}`}
      render={(l, i) => (
        <>
          <Field label="Repère dans le texte" value={l.key} onChange={(key) => onChange(links.map((x, j) => (j === i ? { ...x, key: key.replace(/[^\w]/g, '') } : x)))} hint={`Écrire {${l.key}} dans le texte à l'endroit du mot`} />
          <Bi label="Mot affiché" value={l.label} onChange={(label) => onChange(links.map((x, j) => (j === i ? { ...x, label } : x)))} />
          {projects && (
            <label className="adm-field">
              <span>Projet ouvert au clic</span>
              <select value={l.project || ''} onChange={(e) => onChange(links.map((x, j) => (j === i ? { ...x, project: e.target.value || undefined } : x)))}>
                <option value="">Aucun (mène aux projets)</option>
                {projects.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
              </select>
            </label>
          )}
        </>
      )}
    />
  );
}

function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="adm-section">
      <h2 className="section-title">{title}</h2>
      {note && <p className="adm-note">{note}</p>}
      {children}
    </section>
  );
}

// ---- Tabs ----

function TextsTab({ site, ctx }: { site: Site; ctx: Ctx }) {
  const { edit } = ctx;
  return (
    <>
      <Section title="Accueil" note="Dans le sous-titre, les mots entre accolades, comme {identites}, deviennent des liens. Au survol, ils montrent la couverture du projet choisi.">
        <Bi label="Sous le logo" value={site.identity.title} onChange={(v) => edit((s) => { s.identity.title = v; })} />
        <Bi label="Surtitre" value={site.hero.eyebrow} onChange={(v) => edit((s) => { s.hero.eyebrow = v; })} />
        <Bi label="Titre principal" value={site.hero.text} onChange={(v) => edit((s) => { s.hero.text = v; })} multiline />
        <Bi label="Sous-titre" value={site.hero.sub} onChange={(v) => edit((s) => { s.hero.sub = v; })} multiline />
        <Links links={site.hero.links} projects={site.projects} onChange={(l) => edit((s) => { s.hero.links = l; })} />
        <Bi label="Bouton vers le brief (page Contact)" value={site.hero.ctaContact} onChange={(v) => edit((s) => { s.hero.ctaContact = v; })} />
        <Bi label="Lien vers les projets" value={site.hero.ctaProjects} onChange={(v) => edit((s) => { s.hero.ctaProjects = v; })} />
      </Section>
      <Section title="Manifeste" note="Entre le studio et les projets.">
        <Bi label="Titre" value={site.manifesto.title} onChange={(v) => edit((s) => { s.manifesto.title = v; })} multiline />
        <List
          items={site.manifesto.paragraphs}
          onChange={(p) => edit((s) => { s.manifesto.paragraphs = p; })}
          add={emptyT}
          addLabel="Ajouter un paragraphe"
          render={(p, i) => <Bi label="Paragraphe" value={p} multiline onChange={(v) => edit((s) => { s.manifesto.paragraphs[i] = v; })} />}
        />
      </Section>
      <Section title="Ligne des expertises" note="Sous les tuiles Studio et Méthode. Les mots liés mènent aux services.">
        <Bi label="Texte" value={site.expertise.text} onChange={(v) => edit((s) => { s.expertise.text = v; })} multiline />
        <Links links={site.expertise.links} onChange={(l) => edit((s) => { s.expertise.links = l; })} />
      </Section>
      <Section title="Tuile et page « Le studio »">
        <Bi label="Titre" value={site.studio.title} onChange={(v) => edit((s) => { s.studio.title = v; })} />
        <Bi label="Ligne sous la tuile" value={site.studio.line} onChange={(v) => edit((s) => { s.studio.line = v; })} />
        <List
          items={site.studio.paragraphs}
          onChange={(p) => edit((s) => { s.studio.paragraphs = p; })}
          add={emptyT}
          addLabel="Ajouter un paragraphe"
          render={(p, i) => <Bi label="Paragraphe" value={p} multiline onChange={(v) => edit((s) => { s.studio.paragraphs[i] = v; })} />}
        />
        <Facts facts={site.studio.facts} onChange={(f) => edit((s) => { s.studio.facts = f; })} />
      </Section>
      <Section title="Tuile et page « Méthode »">
        <Bi label="Titre" value={site.method.title} onChange={(v) => edit((s) => { s.method.title = v; })} />
        <Bi label="Ligne sous la tuile" value={site.method.line} onChange={(v) => edit((s) => { s.method.line = v; })} />
        <Bi label="Introduction" value={site.method.intro} multiline onChange={(v) => edit((s) => { s.method.intro = v; })} />
        <List<Site['method']['steps'][number]>
          items={site.method.steps}
          onChange={(st) => edit((s) => { s.method.steps = st; })}
          add={() => ({ label: emptyT(), text: emptyT() })}
          addLabel="Ajouter une étape"
          title={(st, i) => st.label.fr || `Étape ${i + 1}`}
          render={(st, i) => (
            <>
              <Bi label="Nom de l'étape" value={st.label} onChange={(v) => edit((s) => { s.method.steps[i].label = v; })} />
              <Bi label="Description" value={st.text} multiline onChange={(v) => edit((s) => { s.method.steps[i].text = v; })} />
            </>
          )}
        />
      </Section>
      <Section title="Pied de page">
        <Bi label="Phrase sous le logo" value={site.footerLine} onChange={(v) => edit((s) => { s.footerLine = v; })} />
      </Section>
    </>
  );
}

function newProject(n: number): Project {
  return {
    slug: `nouveau-projet-${n}`,
    title: 'Nouveau projet',
    meta: emptyT(),
    fill: '#efefed',
    cover: emptyImg(),
    intro: [emptyT()],
    facts: [],
    story: [],
  };
}

function ProjectsTab({ site, ctx }: { site: Site; ctx: Ctx }) {
  const { edit } = ctx;
  return (
    <Section title="Projets" note="L'ordre ici est l'ordre du carrousel. Chaque projet s'ouvre à l'adresse /projets/adresse.">
      <List
        items={site.projects}
        onChange={(p) => edit((s) => { s.projects = p; })}
        add={() => newProject(site.projects.length + 1)}
        addLabel="Ajouter un projet"
        title={(p) => p.title || 'Sans titre'}
        render={(p, i) => <ProjectEditor project={p} ctx={ctx} onChange={(fn) => edit((s) => fn(s.projects[i]))} />}
      />
    </Section>
  );
}

function ProjectEditor({ project: p, ctx, onChange }: { project: Project; ctx: Ctx; onChange: (fn: (p: Project) => void) => void }) {
  return (
    <details className="adm-details">
      <summary>Modifier</summary>
      <div className="adm-grid">
        <Field
          label="Titre"
          value={p.title}
          onChange={(v) => onChange((x) => {
            // A new project's address follows its title until it is set by hand
            if (x.slug.startsWith('nouveau-projet') || x.slug === slugify(x.title)) x.slug = slugify(v);
            x.title = v;
          })}
        />
        <Field label="Adresse" value={p.slug} onChange={(v) => onChange((x) => { x.slug = slugify(v); })} hint={`originecreative.com/projets/${p.slug}`} />
        <Bi label="Étiquette sur la carte" value={p.meta} onChange={(v) => onChange((x) => { x.meta = v; })} hint="Ex. Identité, Communication" />
        <label className="adm-field">
          <span>Couleur d'ouverture</span>
          <input type="color" value={p.fill} onChange={(e) => onChange((x) => { x.fill = e.target.value; })} />
        </label>
      </div>
      <ImageField label="Couverture" value={p.cover} name={p.slug} ctx={ctx} onChange={(v) => onChange((x) => { x.cover = v; })} />
      <h3 className="adm-sub">Introduction</h3>
      <List
        items={p.intro}
        onChange={(v) => onChange((x) => { x.intro = v; })}
        add={emptyT}
        addLabel="Ajouter un paragraphe"
        render={(t, i) => <Bi label="Paragraphe" value={t} multiline onChange={(v) => onChange((x) => { x.intro[i] = v; })} />}
      />
      <h3 className="adm-sub">Fiche (client, mission, lien…)</h3>
      <Facts facts={p.facts} onChange={(v) => onChange((x) => { x.facts = v; })} />
      <h3 className="adm-sub">Récit et images</h3>
      <Story blocks={p.story} ctx={ctx} name={p.slug} onChange={(v) => onChange((x) => { x.story = v; })} />
    </details>
  );
}

const BLOCKS: [Block['kind'], string, () => Block][] = [
  ['h', 'Titre', () => ({ kind: 'h', text: emptyT() })],
  ['p', 'Paragraphe', () => ({ kind: 'p', text: emptyT() })],
  ['quote', 'Citation', () => ({ kind: 'quote', text: emptyT() })],
  ['figure', 'Image(s)', () => ({ kind: 'figure', images: [emptyImg()], caption: emptyT() })],
  ['strip', "Bande d'images", () => ({ kind: 'strip', images: [emptyImg()] })],
];

function Story({ blocks, onChange, ctx, name }: { blocks: Block[]; onChange: (b: Block[]) => void; ctx: Ctx; name: string }) {
  const set = (i: number, b: Block) => onChange(blocks.map((x, j) => (j === i ? b : x)));
  return (
    <>
      <List
        items={blocks}
        onChange={onChange}
        title={(b) => BLOCKS.find(([k]) => k === b.kind)?.[1] || b.kind}
        render={(b, i) => {
          if (b.kind === 'h' || b.kind === 'p' || b.kind === 'quote') {
            return <Bi label="Texte" value={b.text} multiline={b.kind !== 'h'} onChange={(text) => set(i, { ...b, text })} />;
          }
          return (
            <>
              <List
                items={b.images}
                onChange={(images) => set(i, { ...b, images })}
                add={emptyImg}
                addLabel="Ajouter une image"
                render={(img, k) => (
                  <ImageField label={`Image ${k + 1}`} value={img} name={name} ctx={ctx} onChange={(v) => set(i, { ...b, images: b.images.map((x, j) => (j === k ? v : x)) })} />
                )}
              />
              {b.kind === 'figure' && (
                <Bi label="Légende (facultatif)" value={b.caption} onChange={(caption) => set(i, { ...b, caption })} hint="Deux images ou plus s'affichent côte à côte." />
              )}
            </>
          );
        }}
      />
      <div className="adm-add-row">
        {BLOCKS.map(([kind, label, make]) => (
          <button key={kind} type="button" className="adm-add" onClick={() => onChange([...blocks, make()])}>+ {label}</button>
        ))}
      </div>
    </>
  );
}

function newService(n: number): Service {
  return {
    slug: `nouveau-service-${n}`,
    title: emptyT(),
    desc: emptyT(),
    benefit: emptyT(),
    seoTitle: emptyT(),
    seoDescription: emptyT(),
    intro: [emptyT()],
    deliverables: [],
    projects: [],
    faq: [],
  };
}

function ServicesTab({ site, ctx }: { site: Site; ctx: Ctx }) {
  const { edit } = ctx;
  return (
    <Section title="Services" note="Chaque service a sa propre page, à l'adresse /services/adresse, pensée pour Google : soignez le titre et la description pour Google.">
      <Bi label="Paragraphe avant la liste" value={site.services.intro} multiline onChange={(v) => edit((s) => { s.services.intro = v; })} />
      <List<Service>
        items={site.services.items}
        onChange={(v) => edit((s) => { s.services.items = v; })}
        add={() => newService(site.services.items.length + 1)}
        addLabel="Ajouter un service"
        title={(it) => it.title.fr || 'Nouveau service'}
        render={(it, i) => {
          const set = (fn: (x: Service) => void) => edit((s) => fn(s.services.items[i]));
          return (
            <>
              <Bi
                label="Nom"
                value={it.title}
                onChange={(v) => set((x) => {
                  if (x.slug.startsWith('nouveau-service') || x.slug === slugify(x.title.fr)) x.slug = slugify(v.fr);
                  x.title = v;
                })}
              />
              <Bi label="Accroche (dans la liste et sous le titre de la page)" value={it.desc} multiline onChange={(v) => set((x) => { x.desc = v; })} />
              <Bi label="Bénéfice pour le client" value={it.benefit} multiline onChange={(v) => set((x) => { x.benefit = v; })} hint="Affiché sous l'accroche dans la liste, et en ouverture de la page du service." />
              <details className="adm-details">
                <summary>Page du service</summary>
                <Field label="Adresse" value={it.slug} onChange={(v) => set((x) => { x.slug = slugify(v); })} hint={`originecreative.com/services/${it.slug}`} />
                <Bi label="Titre pour Google" value={it.seoTitle} onChange={(v) => set((x) => { x.seoTitle = v; })} hint="Environ 60 caractères, avec le métier et la ville. Ex. Agence de branding à Abidjan — …" />
                <Bi label="Description pour Google" value={it.seoDescription} multiline onChange={(v) => set((x) => { x.seoDescription = v; })} hint="Environ 155 caractères : ce que vous faites, pour qui, où." />
                <h3 className="adm-sub">Texte de la page</h3>
                <List<T>
                  items={it.intro}
                  onChange={(v) => set((x) => { x.intro = v; })}
                  add={emptyT}
                  addLabel="Ajouter un paragraphe"
                  render={(t, k) => <Bi label="Paragraphe" value={t} multiline onChange={(v) => set((x) => { x.intro[k] = v; })} />}
                />
                <h3 className="adm-sub">Ce que nous livrons</h3>
                <List<T>
                  items={it.deliverables}
                  onChange={(v) => set((x) => { x.deliverables = v; })}
                  add={emptyT}
                  addLabel="Ajouter un livrable"
                  title={(d, k) => d.fr || `Livrable ${k + 1}`}
                  render={(d, k) => <Bi label="Livrable" value={d} onChange={(v) => set((x) => { x.deliverables[k] = v; })} />}
                />
                <h3 className="adm-sub">Projets liés</h3>
                <div className="adm-checks">
                  {site.projects.map((p) => (
                    <label key={p.slug}>
                      <input
                        type="checkbox"
                        checked={it.projects.includes(p.slug)}
                        onChange={(e) => set((x) => {
                          x.projects = e.target.checked ? [...x.projects, p.slug] : x.projects.filter((sl) => sl !== p.slug);
                        })}
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
                <h3 className="adm-sub">Questions fréquentes</h3>
                <List<Service['faq'][number]>
                  items={it.faq}
                  onChange={(v) => set((x) => { x.faq = v; })}
                  add={() => ({ q: emptyT(), a: emptyT() })}
                  addLabel="Ajouter une question"
                  title={(f, k) => f.q.fr || `Question ${k + 1}`}
                  render={(f, k) => (
                    <>
                      <Bi label="Question" value={f.q} onChange={(v) => set((x) => { x.faq[k].q = v; })} />
                      <Bi label="Réponse" value={f.a} multiline onChange={(v) => set((x) => { x.faq[k].a = v; })} />
                    </>
                  )}
                />
              </details>
            </>
          );
        }}
      />
      <Bi label="Paragraphe après la liste" value={site.services.outro} multiline onChange={(v) => edit((s) => { s.services.outro = v; })} />
      <Bi label="Phrase d'appel" value={site.services.cta} multiline onChange={(v) => edit((s) => { s.services.cta = v; })} hint="{cta} marque le lien qui copie l'adresse e-mail." />
      <Bi label="Texte du lien {cta}" value={site.services.ctaLink} onChange={(v) => edit((s) => { s.services.ctaLink = v; })} />
    </Section>
  );
}

function GalleryTab({ site, ctx }: { site: Site; ctx: Ctx }) {
  const { edit } = ctx;
  return (
    <Section title="Galerie" note="Les images flottent en profondeur dans l'ordre de la liste.">
      <List<Site['gallery'][number]>
        items={site.gallery}
        onChange={(v) => edit((s) => { s.gallery = v; })}
        add={() => ({ img: emptyImg(), title: '', meta: emptyT() })}
        addLabel="Ajouter une image"
        title={(g, i) => g.title || `Image ${i + 1}`}
        render={(g, i) => (
          <>
            <ImageField label="Image" value={g.img} name={g.title || 'galerie'} ctx={ctx} onChange={(v) => edit((s) => { s.gallery[i].img = v; })} />
            <Field label="Titre" value={g.title} onChange={(v) => edit((s) => { s.gallery[i].title = v; })} />
            <Bi label="Légende" value={g.meta} onChange={(v) => edit((s) => { s.gallery[i].meta = v; })} />
          </>
        )}
      />
    </Section>
  );
}

function JournalTab({ blog, editBlog }: { blog: Post[]; editBlog: (fn: (b: Post[]) => void) => void }) {
  return (
    <Section title="Journal" note="Le contenu s'écrit en Markdown : ## pour un intertitre, **gras**, - pour une liste.">
      <List<Post>
        items={blog}
        onChange={(v) => editBlog((b) => { b.splice(0, b.length, ...v); })}
        add={() => ({
          id: String(Date.now()),
          slug: `nouvel-article-${blog.length + 1}`,
          title: 'Nouvel article',
          excerpt: '',
          content: '',
          category: '',
          author: 'Origine Creative',
          publishedAt: new Date().toISOString().slice(0, 10),
          readTime: '3',
        })}
        addLabel="Ajouter un article"
        title={(p) => p.title || 'Sans titre'}
        render={(p, i) => (
          <details className="adm-details">
            <summary>Modifier</summary>
            <Field label="Titre" value={p.title} onChange={(v) => editBlog((b) => { b[i].title = v; })} />
            <Field label="Adresse" value={p.slug} onChange={(v) => editBlog((b) => { b[i].slug = slugify(v); })} hint={`originecreative.com/blog/${p.slug}`} />
            <Field label="Date" type="date" value={p.publishedAt} onChange={(v) => editBlog((b) => { b[i].publishedAt = v; })} />
            <Field label="Résumé" value={p.excerpt} multiline onChange={(v) => editBlog((b) => { b[i].excerpt = v; })} />
            <label className="adm-field">
              <span>Contenu</span>
              <textarea className="adm-long" value={p.content} onChange={(e) => editBlog((b) => { b[i].content = e.target.value; })} rows={18} />
            </label>
          </details>
        )}
      />
    </Section>
  );
}

function ContactTab({ site, ctx }: { site: Site; ctx: Ctx }) {
  const { edit } = ctx;
  const b = site.brief;
  return (
    <>
      <Section title="Coordonnées" note="Utilisées dans le pied de page, la page Contact et la fiche du studio.">
        <Field label="E-mail" type="email" value={site.contact.email} onChange={(v) => edit((s) => { s.contact.email = v; })} />
        <Field label="Téléphone affiché" value={site.contact.phone} onChange={(v) => edit((s) => { s.contact.phone = v; })} />
        <Field label="Lien WhatsApp" value={site.contact.whatsapp} onChange={(v) => edit((s) => { s.contact.whatsapp = v; })} hint="https://wa.me/225…" />
        <Bi label="Message WhatsApp pré-rempli" value={site.contact.whatsappMessage} multiline onChange={(v) => edit((s) => { s.contact.whatsappMessage = v; })} hint="Le premier message proposé par le bouton WhatsApp flottant et celui du pied de page." />
        <Bi label="Lieu" value={site.contact.location} onChange={(v) => edit((s) => { s.contact.location = v; })} />
        <Field label="Lien de consultation stratégique (facultatif)" value={site.contact.booking || ''} onChange={(v) => edit((s) => { s.contact.booking = v; })} hint="Ex. https://calendly.com/… ou https://cal.com/… — le bouton « Consultation stratégique · 20 min » n'apparaît que si ce champ est rempli." />
      </Section>
      <Section title="Brief" note="Le formulaire en plusieurs étapes de la page Contact. Chaque question à choix est une étape ; la dernière étape demande toujours les coordonnées.">
        <Bi label="Titre" value={b.title} onChange={(v) => edit((s) => { s.brief.title = v; })} />
        <Bi label="Introduction" value={b.intro} multiline onChange={(v) => edit((s) => { s.brief.intro = v; })} />
        <List<Site['brief']['steps'][number]>
          items={b.steps}
          onChange={(v) => edit((s) => { s.brief.steps = v; })}
          add={() => ({ question: emptyT(), multiple: false, options: [emptyT()] })}
          addLabel="Ajouter une question"
          title={(st, i) => st.question.fr || `Question ${i + 1}`}
          render={(st, i) => (
            <>
              <Bi label="Question" value={st.question} onChange={(v) => edit((s) => { s.brief.steps[i].question = v; })} />
              <div className="adm-checks">
                <label>
                  <input type="checkbox" checked={st.multiple} onChange={(e) => edit((s) => { s.brief.steps[i].multiple = e.target.checked; })} />
                  Plusieurs réponses possibles
                </label>
              </div>
              <List<T>
                items={st.options}
                onChange={(v) => edit((s) => { s.brief.steps[i].options = v; })}
                add={emptyT}
                addLabel="Ajouter une réponse"
                title={(o, k) => o.fr || `Réponse ${k + 1}`}
                render={(o, k) => <Bi label="Réponse" value={o} onChange={(v) => edit((s) => { s.brief.steps[i].options[k] = v; })} />}
              />
            </>
          )}
        />
        <Bi label="Question ouverte (dernière étape)" value={b.challenge} multiline onChange={(v) => edit((s) => { s.brief.challenge = v; })} />
        <Bi label="Bouton d'envoi" value={b.submit} onChange={(v) => edit((s) => { s.brief.submit = v; })} />
        <List<T>
          items={b.reassurance}
          onChange={(v) => edit((s) => { s.brief.reassurance = v; })}
          add={emptyT}
          addLabel="Ajouter une garantie"
          title={(r, k) => r.fr || `Garantie ${k + 1}`}
          render={(r, k) => <Bi label="Sous le bouton" value={r} onChange={(v) => edit((s) => { s.brief.reassurance[k] = v; })} />}
        />
      </Section>
    </>
  );
}
