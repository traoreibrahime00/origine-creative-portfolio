// Writes one real HTML page per public address after `vite build`:
// /services/digital-experiences → dist/services/digital-experiences.html
// (served at the clean address, see "cleanUrls" in vercel.json).
// The browser then takes the markup over (hydrateRoot in src/main.tsx).
// dist/app.html stays an empty shell for everything else, such as /admin.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const dist = path.resolve(process.cwd(), 'dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, routes } = await import(pathToFileURL(path.resolve(process.cwd(), 'dist-ssr/entry-server.js')).href);

fs.writeFileSync(path.join(dist, 'app.html'), template);

for (const url of routes) {
    const { html, head } = await render(url);
    const page = template
        .replace('</head>', `    ${head}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
    const file = url === '/' ? 'index.html' : `${url.slice(1)}.html`;
    fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
    fs.writeFileSync(path.join(dist, file), page);
}

console.log(`✅ Prerendered ${routes.length} pages`);
