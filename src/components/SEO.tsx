import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    type?: 'website' | 'article';
    article?: {
        publishedTime: string;
        author: string;
        category: string;
    };
}

export function SEO({
    title = 'Origine Creative | L\'Agence Africaine',
    description = 'Agence de communication globale, branding, et stratégie digitale basée en Afrique.',
    url = 'https://origine-creative.com',
    image = 'https://origine-creative.com/og-image.jpg',
    type = 'website',
    article
}: SEOProps) {

    const schemaOrgJSONLD: any[] = [];

    // Base Organization Schema (always present)
    schemaOrgJSONLD.push({
        '@context': 'http://schema.org',
        '@type': 'Organization',
        name: 'Origine Creative',
        url: 'https://origine-creative.com',
        logo: 'https://origine-creative.com/logo.png', // Or wherever the real logo is
        sameAs: [
            'https://www.linkedin.com/company/originecreative',
            'https://www.instagram.com/origine.creative'
        ]
    });

    // Article Schema for Blog Posts
    if (type === 'article' && article) {
        schemaOrgJSONLD.push({
            '@context': 'http://schema.org',
            '@type': 'Article',
            headline: title,
            image: [image],
            datePublished: new Date(article.publishedTime).toISOString(),
            dateModified: new Date(article.publishedTime).toISOString(),
            author: [{
                '@type': 'Person',
                name: article.author
            }],
            publisher: {
                '@type': 'Organization',
                name: 'Origine Creative',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://origine-creative.com/logo.png'
                }
            },
            description: description,
        });
    }

    return (
        <Helmet>
            {/* Standard Primary Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(schemaOrgJSONLD.length === 1 ? schemaOrgJSONLD[0] : schemaOrgJSONLD)}
            </script>
        </Helmet>
    );
}
