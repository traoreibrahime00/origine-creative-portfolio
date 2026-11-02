// What the one-pager says lives in two files that /admin edits:
// src/data/site.json (texts, projects, services, gallery, contact) and
// src/data/blog.json (journal). This module types them and keeps the small
// interface labels that are not meant to be edited.
import siteData from '../data/site.json';
import blog from '../data/blog.json';

export type Lang = 'fr' | 'en';
export type T = { fr: string; en: string };
export type Img = { src: string; small?: string; r: number; alt: T };
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

// Each service has its own page at /services/:slug, written for search engines
export type Service = {
  slug: string;
  title: T;
  // desc is the one-line hook (list and page header); benefit says what the client gains
  desc: T;
  benefit: T;
  seoTitle: T;
  seoDescription: T;
  intro: T[];
  deliverables: T[];
  projects: string[];
  faq: { q: T; a: T }[];
};

export type SlotLink = { key: string; label: T; project?: string };

// The guided brief on /contact: one screen per choice step, then the contact details
export type BriefStep = { question: T; multiple: boolean; options: T[] };
export type Brief = { title: T; intro: T; steps: BriefStep[]; challenge: T; submit: T; reassurance: T[] };

export type Site = {
  contact: { email: string; phone: string; whatsapp: string; whatsappMessage: T; location: T; booking?: string };
  brief: Brief;
  identity: { title: T };
  // text writes itself in word by word; sub carries the {slot} links
  hero: { eyebrow: T; text: T; sub: T; links: SlotLink[]; ctaProjects: T; ctaContact: T };
  manifesto: { title: T; paragraphs: T[] };
  studio: { title: T; line: T; paragraphs: T[]; facts: Fact[] };
  method: { title: T; line: T; intro: T; steps: { label: T; text: T }[] };
  expertise: { text: T; links: SlotLink[] };
  services: { intro: T; items: Service[]; outro: T; cta: T; ctaLink: T };
  projects: Project[];
  gallery: { img: Img; title: string; meta: T }[];
  footerLine: T;
};

export type Post = {
  id?: string | number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  coverImage?: string;
  author?: string;
  publishedAt: string;
  readTime?: string | number;
};

export const SITE = siteData as Site;
export const RAW_POSTS = blog as Post[];

export const EMAIL = SITE.contact.email;
export const PHONE_DISPLAY = SITE.contact.phone;
export const WHATSAPP = SITE.contact.whatsapp;
export const PROJECTS = SITE.projects;
export const SERVICES = SITE.services.items;
export const STUDIO = SITE.studio;
export const METHOD = SITE.method;
export const GALLERY = SITE.gallery;

// WhatsApp link that opens with a first message already written
export const whatsappLink = (text: string) => `${WHATSAPP}${WHATSAPP.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;

// Interface labels
export const COPY = {
  name: 'Origine Creative',
  studioTitle: { fr: 'Studio', en: 'Studio' },
  projectsTitle: { fr: 'Projets', en: 'Projects' },
  servicesTitle: { fr: 'Services', en: 'Services' },
  journalTitle: { fr: 'Journal', en: 'Journal' },
  galleryTitle: { fr: 'Galerie', en: 'Gallery' },
  galleryHint: { fr: 'Défilez pour plonger · Sélectionnez pour regarder de près', en: 'Scroll to dive · Select to look closer' },
  copied: { fr: 'Adresse copiée', en: 'Address copied' },
  close: { fr: 'Fermer', en: 'Close' },
  prev: { fr: 'Précédent', en: 'Previous' },
  next: { fr: 'Suivant', en: 'Next' },
  contact: { fr: 'Contact', en: 'Contact' },
  legal: { fr: 'Mentions légales', en: 'Legal notice' },
  privacy: { fr: 'Confidentialité', en: 'Privacy' },
  theme: { fr: 'Mode sombre', en: 'Dark mode' },
  more: { fr: 'Découvrir ce pôle', en: 'Explore this area' },
  deliverables: { fr: 'Ce que nous livrons', en: 'What we deliver' },
  method: { fr: 'Notre méthode', en: 'Our method' },
  related: { fr: 'Projets liés', en: 'Related projects' },
  faq: { fr: 'Questions fréquentes', en: 'Questions' },
  start: { fr: 'Démarrer un projet', en: 'Start a project' },
  manifesto: { fr: 'Manifeste', en: 'Manifesto' },
  whatsappCta: { fr: 'Discuter d’un projet sur WhatsApp', en: 'Talk about a project on WhatsApp' },
  booking: { fr: 'Consultation stratégique · 20 min', en: 'Strategy call · 20 min' },
};

// ---- Journal ----
const FILLS = ['#dfe5dc', '#e8e2d4', '#e2e4ee'];
export const POSTS = RAW_POSTS.map((p, i) => {
  const [y, m] = p.publishedAt.split('-');
  return { slug: p.slug, title: p.title, date: `${m}/${y}`, excerpt: p.excerpt, content: p.content, fill: FILLS[i % FILLS.length] };
});
