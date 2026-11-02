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
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.png`,
    email: SITE.contact.email,
    telephone: SITE.contact.phone,
    address: { '@type': 'PostalAddress', addressLocality: 'Abidjan', addressCountry: 'CI' },
    areaServed: ['Côte d’Ivoire', 'Afrique de l’Ouest'],
};

export function SEO({
    title = 'Origine Creative — Studio créatif · Branding, design, digital',
    description = 'Origine Creative est un studio créatif à Abidjan spécialisé dans la construction de marques fortes et la création d’expériences visuelles et digitales.',
    path = '/',
    image = `${SITE_URL}/og-image.png`,
    type = 'website',
    schema = [],
}: SEOProps) {
    const url = SITE_URL + (path === '/' ? '/' : path.replace(/\/$/, ''));
    const graph = { '@context': 'https://schema.org', '@graph': [ORGANIZATION, ...schema] };

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
