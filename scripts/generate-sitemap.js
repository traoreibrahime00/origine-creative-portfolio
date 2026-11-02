import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://originecreative.com';

function generateSitemap() {
    const sitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');

    // Static Routes
    const staticRoutes = [
        '/',
        '/services',
        '/projets',
        '/blog',
        '/a-propos',
        '/methode',
        '/contact',
        '/mentions-legales',
        '/politique-de-confidentialite'
    ];

    let urls = '';

    // Add static routes
    staticRoutes.forEach(route => {
        urls += `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add project routes: each project opens at /projets/:slug
    try {
        const sitePath = path.resolve(process.cwd(), 'src', 'data', 'site.json');
        if (fs.existsSync(sitePath)) {
            const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
            (site.projects || []).forEach((project) => {
                urls += `
  <url>
    <loc>${SITE_URL}/projets/${project.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
            });
        }
    } catch (e) {
        console.error('Error reading projects:', e);
    }

    // Add dynamic blog routes
    try {
        const blogPath = path.resolve(process.cwd(), 'src', 'data', 'blog.json');
        if (fs.existsSync(blogPath)) {
            const articles = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
            articles.forEach((article) => {
                urls += `
  <url>
    <loc>${SITE_URL}/blog/${article.slug}</loc>
    <lastmod>${new Date(article.publishedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
            });
        }
    } catch (e) {
        console.error('Error reading blog articles:', e);
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    fs.writeFileSync(sitemapPath, sitemapXml);
    console.log('✅ Sitemap.xml generated successfully in public/sitemap.xml');
}

generateSitemap();
