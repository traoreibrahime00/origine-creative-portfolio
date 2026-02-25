import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Simple Vite plugin to serve as an API for saving projects locally
function localProjectsApi() {
  return {
    name: 'local-projects-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/og-image') && req.method === 'GET') {
          const targetUrl = new URL(req.url, `http://${req.headers.host}`).searchParams.get('url');
          if (targetUrl) {
            fetch(targetUrl)
              .then(response => response.text())
              .then(html => {
                let ogImage = '';
                // regex to find og:image
                const match = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                  html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
                if (match) ogImage = match[1];

                let projectImages: string[] = [];
                if (targetUrl.includes('behance.net')) {
                  const anyImages = html.match(/https:\\?\/\\?\/mir-s3-cdn-cf\.behance\.net\\?\/project_modules\\?\/[^"'\s\\]+\.(?:jpg|png|gif|webp|jpeg)/ig);
                  if (anyImages) {
                    let cleaned = anyImages.map((url: string) => url.replace(/\\/g, ''));
                    let files: Record<string, string> = {};
                    for (let url of cleaned) {
                      let filename = url.split('/').pop() || "";
                      let isHighRes = url.includes('/max_1200/') || url.includes('/1400/') || url.includes('/fs/') || url.includes('/max_3840/') || url.includes('/source/');
                      if (isHighRes || !files[filename]) {
                        files[filename] = url;
                      }
                    }
                    projectImages = Object.values(files);
                  }
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ imageUrl: ogImage, projectImages }));
              })
              .catch(err => {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              });
          } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing url' }));
          }
          return;
        }

        if (req.url === '/api/projects' && req.method === 'GET') {
          const filePath = path.resolve(__dirname, './src/data/projects.json')
          if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(data)
          } else {
            res.setHeader('Content-Type', 'application/json')
            res.end('[]')
          }
          return
        }

        if (req.url === '/api/projects' && (req.method === 'POST' || req.method === 'PUT')) {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            const filePath = path.resolve(__dirname, './src/data/projects.json')
            try {
              // we don't need extensive validation for this local personal tool
              fs.writeFileSync(filePath, body)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to write data' }))
            }
          })
          return
        }

        if (req.url === '/api/upload' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const { filename, content } = JSON.parse(body);
              if (!filename || !content) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing filename or content' }));
                return;
              }

              // content is a base64 string, so we need to extract the actual base64 data
              // It looks like: data:image/png;base64,iVBORw0KGgo...
              const matches = content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              if (!matches || matches.length !== 3) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid base64 format' }));
                return;
              }

              const buffer = Buffer.from(matches[2], 'base64');
              const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;

              const uploadsDir = path.resolve(__dirname, './public/uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              const filePath = path.join(uploadsDir, uniqueFilename);
              fs.writeFileSync(filePath, buffer);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ url: `/uploads/${uniqueFilename}` }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to upload' }));
            }
          })
          return;
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localProjectsApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
