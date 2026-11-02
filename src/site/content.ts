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

export type SlotLink = { key: string; label: T; project?: string };

export type Site = {
  contact: { email: string; phone: string; whatsapp: string; location: T; booking?: string };
  identity: { title: T };
  // text writes itself in word by word; sub carries the {slot} links
  hero: { text: T; sub: T; links: SlotLink[]; ctaProjects: T; ctaContact: T };
  studio: { title: T; line: T; paragraphs: T[]; facts: Fact[] };
  method: { title: T; line: T; intro: T; steps: { label: T; text: T }[] };
  expertise: { text: T; links: SlotLink[] };
  services: { intro: T; items: { title: T; desc: T }[]; outro: T; cta: T; ctaLink: T };
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
};

// ---- Journal ----
const FILLS = ['#dfe5dc', '#e8e2d4', '#e2e4ee'];
export const POSTS = RAW_POSTS.map((p, i) => {
  const [y, m] = p.publishedAt.split('-');
  return { slug: p.slug, title: p.title, date: `${m}/${y}`, excerpt: p.excerpt, content: p.content, fill: FILLS[i % FILLS.length] };
});
