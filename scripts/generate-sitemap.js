import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://origine-creative.com';

function generateSitemap() {
    const sitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');

    // Static Routes
    const staticRoutes = [
        '/',
        '/services',
        '/projets',
        '/blog',
        '/a-propos',
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

    // Add dynamic project routes
    try {
        const projectsPath = path.resolve(process.cwd(), 'src', 'data', 'projects.json');
        if (fs.existsSync(projectsPath)) {
            const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
            projects.forEach((project) => {
                // If the site had detailed project pages via slug, we would map them here. 
                // Currently, projects are handled by modals on the /projets page.
                // But for SEO, we should ensure the /projets page is indexed, which it is in staticRoutes.
                // We'll skip individual project URLs for now since they are rendered via modals on /projets without unique URLs.
                // *If* there are unique URLs for projects later, add them here.
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
