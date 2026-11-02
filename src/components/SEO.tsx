import { Helmet } from 'react-helmet-async';
import { SITE } from '../site/content';

export const SITE_URL = 'https://originecreative.com';

interface SEOProps {
    title?: string;
    description?: string;
    // Path of the page, e.g. "/services/digital-experiences"
    path?: string;
    image?: string;
    type?: 'website' | 'article';
    // Extra schema.org objects for this page (a Service, an Article…)
    schema?: object[];
}

// The studio itself, on every page
const ORGANIZATION = {
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: 'Origine Creative',
    alternateName: 'Origine Creative Agency',
    description: 'Agence de branding et de communication à Abidjan : stratégie de marque, identité visuelle, direction artistique, motion design et communication digitale.',
    slogan: SITE.hero.text.fr.replace(/[{}]/g, ''),
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.png`,
    email: SITE.contact.email,
    telephone: SITE.contact.phone,
    address: { '@type': 'PostalAddress', addressLocality: 'Abidjan', addressCountry: 'CI' },
    areaServed: [
        { '@type': 'City', name: 'Abidjan' },
        { '@type': 'Country', name: 'Côte d’Ivoire' },
        { '@type': 'Place', name: 'Afrique de l’Ouest' },
    ],
    knowsAbout: ['Branding', 'Stratégie de marque', 'Identité visuelle', 'Création de logo', 'Direction artistique', 'Motion design', 'Communication digitale', 'Agence de communication'],
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: SITE.services.items.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.title.fr, url: `${SITE_URL}/services/${s.slug}` },
        })),
    },
};

// The site, so search engines tie its pages to the studio
const WEBSITE = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Origine Creative',
    url: SITE_URL,
    inLanguage: 'fr',
    publisher: { '@id': `${SITE_URL}/#organization` },
};

export function SEO({
    title = 'Origine Creative — Agence de branding et de communication à Abidjan',
    description = 'Agence de branding et de communication à Abidjan : stratégie de marque, création de logo et d’identité visuelle, direction artistique, motion design et communication digitale.',
    path = '/',
    image = `${SITE_URL}/og-image.png`,
    type = 'website',
    schema = [],
}: SEOProps) {
    const url = SITE_URL + (path === '/' ? '/' : path.replace(/\/$/, ''));
    const graph = { '@context': 'https://schema.org', '@graph': [ORGANIZATION, WEBSITE, ...schema] };

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="Origine Creative" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <script type="application/ld+json">{JSON.stringify(graph)}</script>
        </Helmet>
    );
}
