// Everything the one-pager says, in French and English. The project texts
// come from the agency's own case data (src/data/projects.json); nothing here
// adds clients, figures or results that the agency has not published.
import blog from '../data/blog.json';

export type Lang = 'fr' | 'en';
type T = { fr: string; en: string };

export const EMAIL = 'Traore@originecreative.com';
export const PHONE_DISPLAY = '+225 07 49 06 55 94';
export const WHATSAPP = 'https://wa.me/2250749065594';

const agri = (stamp: string, v: string) => `/media/${stamp}-CHARTE_GRAPHIQUE_AGRI_BUILD_${v}`;

export type Img = { src: string; small?: string; r: number; alt: T };

function local(base: string, r: number, alt: T): Img {
  return { src: base + '.jpg', small: base + '-720.jpg', r, alt };
}

const R_AGRI = 1.5968;

export const IMG = {
  agriCover: local('/media/1772109241630-cover_CHARTE_GRAPHIQUE_AGRI_BUILD_v256', R_AGRI, {
    fr: 'Casque de chantier aux couleurs AGRI BUILD',
    en: 'A hard hat in the AGRI BUILD colours',
  }),
  agriTitle: local(agri('1772109301619', 'v2'), R_AGRI, { fr: 'Couverture de la charte graphique AGRI BUILD', en: 'Cover of the AGRI BUILD brand guidelines' }),
  agriLogo: local(agri('1772109301650', 'v25'), R_AGRI, { fr: 'Le logo AGRI BUILD et sa signature', en: 'The AGRI BUILD logo and its tagline' }),
  agriConstruction: local(agri('1772109301679', 'v29'), R_AGRI, { fr: 'Construction du logo sur sa grille', en: 'The logo built on its grid' }),
  agriColors: local(agri('1772109301699', 'v212'), R_AGRI, { fr: 'La palette : bleu, orange, noir et blanc', en: 'The palette: blue, orange, black and white' }),
  agriType: local(agri('1772109301746', 'v215'), R_AGRI, { fr: 'Typographie Intel One', en: 'Intel One typeface' }),
  agriWeights: local(agri('1772109301739', 'v216'), R_AGRI, { fr: 'Graisses typographiques', en: 'Type weights' }),
  agriIcons: local(agri('1772109301706', 'v221'), R_AGRI, { fr: 'Pictogrammes de la marque', en: 'The brand icons' }),
  agriStationery: local(agri('1772109301795', 'v224'), R_AGRI, { fr: 'Papeterie AGRI BUILD', en: 'AGRI BUILD stationery' }),
  agriFolder: local(agri('1772109301872', 'v226'), R_AGRI, { fr: 'Chemise et documents imprimés', en: 'Folder and printed documents' }),
  agriTees: local(agri('1772109301933', 'v230'), R_AGRI, { fr: 'T-shirts de l’équipe', en: 'Team T-shirts' }),
  agriCards: local(agri('1772109302002', 'v232'), R_AGRI, { fr: 'Cartes de visite', en: 'Business cards' }),
  agriVests: local(agri('1772109302046', 'v235'), R_AGRI, { fr: 'Gilets de chantier orange', en: 'Orange site vests' }),
  agriVest: local(agri('1772109302087', 'v236'), R_AGRI, { fr: 'Gilet de chantier, dos', en: 'Site vest, back' }),
  agriEnvelope: local(agri('1772109302147', 'v244'), R_AGRI, { fr: 'Enveloppe et carte', en: 'Envelope and card' }),
  agriLetter: local(agri('1772109302187', 'v245'), R_AGRI, { fr: 'Papier à en-tête', en: 'Letterhead' }),
  agriBillboard: local(agri('1772109302267', 'v250'), R_AGRI, { fr: 'Panneau d’affichage AGRI BUILD', en: 'AGRI BUILD billboard' }),
  agriSale: local(agri('1772109302345', 'v251'), R_AGRI, { fr: 'Panneau « À vendre »', en: '“For sale” sign' }),
  agriHelmet: local(agri('1772109302372', 'v255'), R_AGRI, { fr: 'Casque orange', en: 'Orange hard hat' }),
  katanaCover: local('/media/1772109564259-cover_Capture_d_e_cran_2026-02-26_a__12.39.04', 1.1552, {
    fr: 'Flyers KATANA Prestation', en: 'KATANA Prestation flyers',
  }),
  arafatCover: local('/media/1772109817859-cover_Capture_d_e_cran_2026-02-26_a__12.43.27', 1.6064, {
    fr: 'Pochette d’album en hommage à DJ Arafat', en: 'Album cover in tribute to DJ Arafat',
  }),
  katana1: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/hd/8c84c1242359173.696b5b2922fd1.png', r: 0.7044, alt: { fr: 'Flyer KATANA, recto', en: 'KATANA flyer, front' } },
  katana2: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/df2e03242359173.696b5b2923551.png', r: 1.3333, alt: { fr: 'Flyer KATANA en situation', en: 'KATANA flyer in context' } },
  katana3: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/86e611242359173.696b5b2924086.png', r: 1.3333, alt: { fr: 'Flyers KATANA, détail', en: 'KATANA flyers, detail' } },
  katana4: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/0895b4242359173.696b5b2923b3d.png', r: 1.3333, alt: { fr: 'Flyers KATANA, série', en: 'KATANA flyers, series' } },
  arafat1: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/ab6f7e230756873.687cee59097ec.png', r: 1.7305, alt: { fr: 'Pochette hommage à DJ Arafat', en: 'DJ Arafat tribute cover' } },
  arafat2: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/97a64f230756873.687cee5908488.png', r: 1.7305, alt: { fr: 'Pochette, déclinaison', en: 'Cover, variation' } },
  arafat3: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/d0c8e1230756873.687cee5908c9c.png', r: 1.7305, alt: { fr: 'Pochette, mise en situation', en: 'Cover, mock-up' } },
  arafat4: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/cecef9230756873.687cee59091a4.png', r: 1.7305, alt: { fr: 'Pochette, vinyle', en: 'Cover, vinyl' } },
  arafat5: { src: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/8accca230756873.687cee5909f82.png', r: 1.7305, alt: { fr: 'Pochette, détail', en: 'Cover, detail' } },
} satisfies Record<string, Img>;

// ---- Page copy ----
export const COPY = {
  name: 'Origine Creative',
  title: { fr: 'Branding & Communication', en: 'Branding & Communication' },
  // The intro writes itself in word by word; {agri}, {katana} and {arafat} become links.
  hero: {
    fr: 'Origine Creative est un studio de branding et de communication à Abidjan. Nous concevons des identités comme {agri}, des campagnes comme {katana} et des créations artistiques comme notre hommage à {arafat}.',
    en: 'Origine Creative is a branding and communication studio in Abidjan. We design identities like {agri}, campaigns like {katana} and artistic work like our tribute to {arafat}.',
  },
  heroLinks: { agri: 'AGRI BUILD', katana: 'KATANA', arafat: 'DJ Arafat' },
  studioTitle: { fr: 'Studio', en: 'Studio' },
  expertise: {
    fr: 'Nous intervenons en {strategy}, {identity}, {digital}, {motion} et {art}.',
    en: 'We work across {strategy}, {identity}, {digital}, {motion} and {art}.',
  },
  expertiseLinks: {
    strategy: { fr: 'stratégie de marque', en: 'brand strategy' },
    identity: { fr: 'identité visuelle', en: 'visual identity' },
    digital: { fr: 'communication digitale', en: 'digital communication' },
    motion: { fr: 'motion design', en: 'motion design' },
    art: { fr: 'direction artistique', en: 'art direction' },
  },
  projectsTitle: { fr: 'Projets', en: 'Projects' },
  servicesTitle: { fr: 'Services', en: 'Services' },
  servicesIntro: {
    fr: 'Notre travail se situe à l’intersection de la stratégie, du design et de l’artisanat. Nous partons de votre marché, de votre culture et de vos objectifs, puis nous construisons une image qui tient sur chaque support, du logo au panneau de chantier.',
    en: 'Our work sits at the intersection of strategy, design and craft. We start from your market, your culture and your goals, then build an image that holds on every surface, from the logo to the site hoarding.',
  },
  servicesOutro: {
    fr: 'Nous accompagnons les entreprises qui voient le design comme un levier de croissance, pas comme une décoration.',
    en: 'We work with companies that see design as a lever for growth, not as decoration.',
  },
  servicesCta: {
    fr: 'Si vous cherchez un partenaire qui voit l’ensemble et soigne chaque détail, {cta}.',
    en: 'If you are looking for a partner who sees the whole and still cares for every detail, {cta}.',
  },
  servicesCtaLink: { fr: 'écrivez-nous', en: 'write to us' },
  journalTitle: { fr: 'Journal', en: 'Journal' },
  galleryTitle: { fr: 'Galerie', en: 'Gallery' },
  galleryHint: { fr: 'Défilez pour plonger · Sélectionnez pour regarder de près', en: 'Scroll to dive · Select to look closer' },
  footerLine: { fr: 'Des marques qui marquent.', en: 'Brands that leave a mark.' },
  copied: { fr: 'Adresse copiée', en: 'Address copied' },
  close: { fr: 'Fermer', en: 'Close' },
  prev: { fr: 'Précédent', en: 'Previous' },
  next: { fr: 'Suivant', en: 'Next' },
  contact: { fr: 'Contact', en: 'Contact' },
  legal: { fr: 'Mentions légales', en: 'Legal notice' },
  privacy: { fr: 'Confidentialité', en: 'Privacy' },
  location: { fr: 'Abidjan, Côte d’Ivoire', en: 'Abidjan, Côte d’Ivoire' },
};

// ---- Services ----
export const SERVICES: { title: T; desc: T }[] = [
  {
    title: { fr: 'Stratégie de marque', en: 'Brand strategy' },
    desc: {
      fr: 'Positionnement, architecture et voix de votre marque : un socle solide et différenciant. Audit, plateforme de marque, naming.',
      en: 'Positioning, architecture and voice: a solid, distinctive foundation. Audit, brand platform, naming.',
    },
  },
  {
    title: { fr: 'Identité visuelle', en: 'Visual identity' },
    desc: {
      fr: 'Des systèmes graphiques uniques et mémorables : logo, charte graphique, typographie, couleurs et guidelines.',
      en: 'Distinct, memorable graphic systems: logo, brand guidelines, typography and colour.',
    },
  },
  {
    title: { fr: 'Communication digitale', en: 'Digital communication' },
    desc: {
      fr: 'Sites sur mesure, UI/UX, stratégie social media et gestion de contenus, pensés pour vos utilisateurs et vos objectifs.',
      en: 'Custom websites, UI/UX, social media strategy and content, built around your users and your goals.',
    },
  },
  {
    title: { fr: 'Motion design', en: 'Motion design' },
    desc: {
      fr: 'Animation 2D/3D, vidéos promotionnelles et intros de marque pour donner du mouvement à votre identité.',
      en: '2D/3D animation, promotional films and brand intros that put your identity in motion.',
    },
  },
  {
    title: { fr: 'Direction artistique', en: 'Art direction' },
    desc: {
      fr: 'Shootings, campagnes, scénographie, édition et print : une cohérence visuelle sur tous vos supports.',
      en: 'Shoots, campaigns, set design, editorial and print: one visual line across every channel.',
    },
  },
];

// ---- Projects ----
export type Fact = { label: T; value: T; href?: string };
export type Block =
  | { kind: 'h'; text: T }
  | { kind: 'p'; text: T }
  | { kind: 'quote'; text: T }
  | { kind: 'figure'; images: Img[]; caption?: T }
  | { kind: 'strip'; images: Img[] };

export type Project = {
  slug: string;
  title: string;
  meta: T;
  fill: string;
  cover: Img;
  intro: T[];
  facts: Fact[];
  story: Block[];
};

export const PROJECTS: Project[] = [
  {
    slug: 'agri-build',
    title: 'AGRI BUILD',
    meta: { fr: 'Identité', en: 'Identity' },
    fill: '#e9eef8',
    cover: IMG.agriCover,
    intro: [
      {
        fr: 'AGRI BUILD est active dans plusieurs domaines clés : agriculture, élevage, commerce, immobilier et vente. Cette diversité reflète l’ampleur de son impact économique et social.',
        en: 'AGRI BUILD works across several key fields: agriculture, livestock, trade, real estate and sales. That range reflects the size of its economic and social footprint.',
      },
      {
        fr: 'La charte graphique garantit une cohérence visuelle et une identité forte sur l’ensemble des supports de communication.',
        en: 'The brand guidelines keep every communication surface consistent and the identity strong.',
      },
    ],
    facts: [
      { label: { fr: 'Client', en: 'Client' }, value: { fr: 'AGRI BUILD', en: 'AGRI BUILD' } },
      { label: { fr: 'Secteurs', en: 'Sectors' }, value: { fr: 'Agriculture, élevage, commerce, immobilier, vente', en: 'Agriculture, livestock, trade, real estate, sales' } },
      { label: { fr: 'Mission', en: 'Scope' }, value: { fr: 'Identité & stratégie de marque', en: 'Identity & brand strategy' } },
      { label: { fr: 'Livrables', en: 'Deliverables' }, value: { fr: 'Logo, charte graphique, print, digital, signalétique', en: 'Logo, guidelines, print, digital, signage' } },
    ],
    story: [
      { kind: 'h', text: { fr: 'Le défi', en: 'The challenge' } },
      {
        kind: 'p',
        text: {
          fr: 'AGRI BUILD opérait dans cinq secteurs sans identité visuelle unifiée. Chaque branche avait développé ses propres supports de son côté, ce qui brouillait le message auprès des clients et des partenaires.',
          en: 'AGRI BUILD operated in five sectors without a unified visual identity. Each branch had made its own materials, which blurred the message for clients and partners.',
        },
      },
      { kind: 'figure', images: [IMG.agriTitle], caption: { fr: 'La charte graphique AGRI BUILD.', en: 'The AGRI BUILD brand guidelines.' } },
      { kind: 'h', text: { fr: 'Notre stratégie', en: 'Our approach' } },
      {
        kind: 'p',
        text: {
          fr: 'Un audit complet de la marque, puis un système d’identité modulaire : un logo déclinable par secteur, une charte qui couvre le print, le digital et la signalétique, et un guide pour garder la cohérence dans le temps.',
          en: 'A full brand audit, then a modular identity system: a logo that adapts per sector, guidelines covering print, digital and signage, and a guide that keeps it consistent over time.',
        },
      },
      { kind: 'figure', images: [IMG.agriLogo, IMG.agriConstruction], caption: { fr: 'Le logo et sa construction.', en: 'The logo and its construction.' } },
      { kind: 'figure', images: [IMG.agriColors], caption: { fr: 'Bleu et orange : la terre et le chantier.', en: 'Blue and orange: the land and the building site.' } },
      { kind: 'figure', images: [IMG.agriType, IMG.agriIcons], caption: { fr: 'Typographie et pictogrammes.', en: 'Type and icons.' } },
      { kind: 'h', text: { fr: 'Le résultat', en: 'The result' } },
      {
        kind: 'p',
        text: {
          fr: 'Une identité professionnelle qui réunit les cinq branches sous une même vision. AGRI BUILD communique désormais d’une seule voix, du papier à en-tête au panneau de chantier.',
          en: 'A professional identity that brings the five branches under one vision. AGRI BUILD now speaks with one voice, from the letterhead to the site hoarding.',
        },
      },
      { kind: 'figure', images: [IMG.agriBillboard], caption: { fr: 'L’identité dans la rue.', en: 'The identity on the street.' } },
      { kind: 'strip', images: [IMG.agriStationery, IMG.agriTees, IMG.agriVests, IMG.agriCards, IMG.agriFolder, IMG.agriVest, IMG.agriEnvelope, IMG.agriLetter, IMG.agriSale, IMG.agriHelmet] },
      {
        kind: 'quote',
        text: {
          fr: '« Origine Creative a su comprendre la complexité de notre activité multisectorielle et l’a traduite en une identité visuelle claire et puissante. »',
          en: '“Origine Creative understood the complexity of our multi-sector business and turned it into a clear, powerful visual identity.”',
        },
      },
    ],
  },
  {
    slug: 'katana',
    title: 'KATANA',
    meta: { fr: 'Communication', en: 'Communication' },
    fill: '#f3e6e3',
    cover: IMG.katanaCover,
    intro: [
      {
        fr: 'Katana Prestation vend des huiles, des pièces et des produits automobiles, aux particuliers comme aux professionnels. L’entreprise accompagne conducteurs, mécaniciens et entreprises dans l’entretien, la performance et la longévité de leurs engins.',
        en: 'Katana Prestation sells oils, parts and car products to individuals and professionals alike, helping drivers, mechanics and companies keep their vehicles running well and for longer.',
      },
    ],
    facts: [
      { label: { fr: 'Client', en: 'Client' }, value: { fr: 'Katana Prestation', en: 'Katana Prestation' } },
      { label: { fr: 'Secteur', en: 'Sector' }, value: { fr: 'Automobile', en: 'Automotive' } },
      { label: { fr: 'Mission', en: 'Scope' }, value: { fr: 'Communication digitale, flyers', en: 'Digital communication, flyers' } },
      {
        label: { fr: 'Lien', en: 'Link' },
        value: { fr: 'Behance ↗', en: 'Behance ↗' },
        href: 'https://www.behance.net/gallery/242359173/FLYER-DESIGN-KATANA-PRESTATION',
      },
    ],
    story: [
      { kind: 'figure', images: [IMG.katana1], caption: { fr: 'Le flyer principal.', en: 'The main flyer.' } },
      { kind: 'figure', images: [IMG.katana2, IMG.katana3], caption: { fr: 'En situation.', en: 'In context.' } },
      { kind: 'figure', images: [IMG.katana4] },
    ],
  },
  {
    slug: 'dj-arafat',
    title: 'DJ Arafat',
    meta: { fr: 'Création artistique', en: 'Artistic work' },
    fill: '#ebe8e3',
    cover: IMG.arafatCover,
    intro: [
      {
        fr: 'Un hommage artistique au légendaire DJ Arafat, icône du coupé-décalé ivoirien. Cette pochette d’album allie photographie et direction artistique pour saisir l’énergie et l’héritage d’un artiste qui a marqué toute une génération.',
        en: 'An artistic tribute to the legendary DJ Arafat, icon of Ivorian coupé-décalé. This album cover brings photography and art direction together to capture the energy and legacy of an artist who marked a generation.',
      },
      {
        fr: 'Il s’agit d’une création personnelle du studio, en mémoire de l’artiste, et non d’une commande.',
        en: 'It is a personal piece by the studio, in the artist’s memory, not a commission.',
      },
    ],
    facts: [
      { label: { fr: 'Nature', en: 'Type' }, value: { fr: 'Création personnelle, hommage', en: 'Personal piece, tribute' } },
      { label: { fr: 'Mission', en: 'Scope' }, value: { fr: 'Direction artistique, pochette d’album', en: 'Art direction, album cover' } },
      {
        label: { fr: 'Lien', en: 'Link' },
        value: { fr: 'Behance ↗', en: 'Behance ↗' },
        href: 'https://www.behance.net/gallery/230756873/DJ-ARAFAT-ALBUM-COVER-(In-Memory)',
      },
    ],
    story: [
      { kind: 'figure', images: [IMG.arafat1] },
      { kind: 'figure', images: [IMG.arafat2, IMG.arafat3], caption: { fr: 'Déclinaisons.', en: 'Variations.' } },
      { kind: 'figure', images: [IMG.arafat4] },
      { kind: 'figure', images: [IMG.arafat5] },
    ],
  },
];

// ---- Studio and method sheets ----
export const STUDIO = {
  title: { fr: 'Le studio', en: 'The studio' },
  line: { fr: 'Studio de branding à Abidjan', en: 'Branding studio in Abidjan' },
  paragraphs: [
    {
      fr: 'Née de la volonté de repenser la communication sur le continent africain, Origine Creative accompagne les marques ambitieuses comme partenaire stratégique.',
      en: 'Born from the wish to rethink communication on the African continent, Origine Creative works with ambitious brands as a strategic partner.',
    },
    {
      fr: 'Le design n’est pas qu’une question d’esthétique, c’est un levier de croissance. Nous construisons des avantages concurrentiels, de l’engagement et du leadership pour nos clients.',
      en: 'Design is not only about looks, it is a lever for growth. We build competitive advantage, engagement and leadership for our clients.',
    },
    {
      fr: 'Nous allions une compréhension fine des contextes culturels locaux à une exigence internationale : l’excellence créative doit toujours servir une vision d’affaires claire.',
      en: 'We pair a close understanding of local culture with international standards: creative excellence should always serve a clear business vision.',
    },
  ] as T[],
  facts: [
    { label: { fr: 'Où', en: 'Where' }, value: { fr: 'Abidjan, Côte d’Ivoire', en: 'Abidjan, Côte d’Ivoire' } },
    { label: { fr: 'Pour qui', en: 'For' }, value: { fr: 'Entreprises et marques ambitieuses, partout sur le continent', en: 'Ambitious companies and brands across the continent' } },
    { label: { fr: 'Valeurs', en: 'Values' }, value: { fr: 'Excellence, audace, impact, authenticité', en: 'Excellence, boldness, impact, authenticity' } },
    { label: { fr: 'Email', en: 'Email' }, value: { fr: EMAIL, en: EMAIL }, href: 'mailto:' + EMAIL },
  ] as Fact[],
};

export const METHOD = {
  title: { fr: 'Méthode', en: 'Method' },
  line: { fr: 'De l’immersion au déploiement', en: 'From immersion to roll-out' },
  intro: {
    fr: 'Une approche rigoureuse, en trois temps, pour que chaque décision créative serve un objectif.',
    en: 'A rigorous approach in three steps, so every creative decision serves a goal.',
  },
  steps: [
    {
      label: { fr: 'Immersion', en: 'Immersion' },
      text: {
        fr: 'Analyse de votre écosystème, identification des leviers de croissance et définition d’un positionnement sur mesure.',
        en: 'We study your landscape, find the levers for growth and define a positioning that fits.',
      },
    },
    {
      label: { fr: 'Conception', en: 'Design' },
      text: {
        fr: 'La stratégie devient une identité visuelle forte, un récit et une expérience.',
        en: 'Strategy becomes a strong visual identity, a story and an experience.',
      },
    },
    {
      label: { fr: 'Déploiement', en: 'Roll-out' },
      text: {
        fr: 'Lancement, diffusion digitale et suivi pour une résonance maximale auprès de votre cible.',
        en: 'Launch, digital reach and follow-up, so it lands with the people it is meant for.',
      },
    },
  ],
};

// ---- Journal ----
export type Post = { slug: string; title: string; date: string; excerpt: string; content: string; fill: string };
const FILLS = ['#dfe5dc', '#e8e2d4', '#e2e4ee'];
export const POSTS: Post[] = (blog as { slug: string; title: string; publishedAt: string; excerpt: string; content: string }[]).map((p, i) => {
  const [y, m] = p.publishedAt.split('-');
  return { slug: p.slug, title: p.title, date: `${m}/${y}`, excerpt: p.excerpt, content: p.content, fill: FILLS[i % FILLS.length] };
});

// ---- Gallery ----
export const GALLERY: { img: Img; title: string; meta: T }[] = [
  { img: IMG.agriCover, title: 'AGRI BUILD', meta: { fr: 'Casque, identité', en: 'Hard hat, identity' } },
  { img: IMG.katana1, title: 'KATANA', meta: { fr: 'Flyer', en: 'Flyer' } },
  { img: IMG.agriTees, title: 'AGRI BUILD', meta: { fr: 'T-shirts', en: 'T-shirts' } },
  { img: IMG.arafat1, title: 'DJ Arafat', meta: { fr: 'Pochette, hommage', en: 'Cover, tribute' } },
  { img: IMG.agriType, title: 'AGRI BUILD', meta: { fr: 'Typographie', en: 'Typography' } },
  { img: IMG.agriBillboard, title: 'AGRI BUILD', meta: { fr: 'Affichage', en: 'Billboard' } },
  { img: IMG.katana2, title: 'KATANA', meta: { fr: 'Flyer en situation', en: 'Flyer in context' } },
  { img: IMG.agriVests, title: 'AGRI BUILD', meta: { fr: 'Gilets de chantier', en: 'Site vests' } },
  { img: IMG.arafat3, title: 'DJ Arafat', meta: { fr: 'Mise en situation', en: 'Mock-up' } },
  { img: IMG.agriLogo, title: 'AGRI BUILD', meta: { fr: 'Logo', en: 'Logo' } },
  { img: IMG.agriStationery, title: 'AGRI BUILD', meta: { fr: 'Papeterie', en: 'Stationery' } },
  { img: IMG.katana3, title: 'KATANA', meta: { fr: 'Détail', en: 'Detail' } },
  { img: IMG.agriSale, title: 'AGRI BUILD', meta: { fr: 'Signalétique', en: 'Signage' } },
  { img: IMG.arafat4, title: 'DJ Arafat', meta: { fr: 'Vinyle', en: 'Vinyl' } },
  { img: IMG.agriColors, title: 'AGRI BUILD', meta: { fr: 'Couleurs', en: 'Colours' } },
  { img: IMG.agriHelmet, title: 'AGRI BUILD', meta: { fr: 'Casque orange', en: 'Orange hard hat' } },
];

export const tr = (t: T, lang: Lang) => t[lang];
