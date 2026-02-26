/* eslint-disable @typescript-eslint/no-explicit-any */
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
                    const cleaned = anyImages.map((url: string) => url.replace(/\\/g, ''));
                    const files: Record<string, string> = {};
                    for (const url of cleaned) {
                      const filename = url.split('/').pop() || "";
                      const isHighRes = url.includes('/max_1200/') || url.includes('/1400/') || url.includes('/fs/') || url.includes('/max_3840/') || url.includes('/source/');
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

        if (req.url === '/api/content' && req.method === 'GET') {
          const filePath = path.resolve(__dirname, './src/data/content.json')
          if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(data)
          } else {
            res.setHeader('Content-Type', 'application/json')
            res.end('{}')
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
            } catch {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to write data' }))
            }
          })
          return
        }

        if (req.url === '/api/content' && (req.method === 'POST' || req.method === 'PUT')) {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            const filePath = path.resolve(__dirname, './src/data/content.json')
            try {
              fs.writeFileSync(filePath, body)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to write content data' }))
            }
          })
          return
        }

        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk.toString() })
          req.on('end', async () => {
            try {
              const { GoogleGenerativeAI, SchemaType } = await import('@google/generative-ai');
              const { loadEnv } = await import('vite');
              const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
              const apiKey = env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "dummy";

              const { history, userMessage, systemContext } = JSON.parse(body);

              const genAI = new GoogleGenerativeAI(apiKey);
              const systemInstruction = `TU ES : un assistant IA expert en branding, communication et stratégie de marque pour l'agence de communication africaine moderne "Origine Creative".

🎯 OBJECTIF PRINCIPAL  
Ton rôle est d'accueillir chaleureusement les visiteurs du site, comprendre leurs besoins en communication/branding et collecter leurs informations de contact de manière naturelle et fluide, comme un vrai consultant humain.

🧠 PERSONNALITÉ & TON  
- Ton humain, chaleureux et professionnel  
- Naturel, conversationnel (jamais robotique)  
- Proactif mais jamais insistant  
- Clair et rassurant  
- Culture business africaine moderne  
- Utilise le vouvoiement (sauf si on te tutoie)
- Phrases courtes et fluides  
- Pas de jargon inutile  
- Tu dois pouvoir te servir du contexte des projets de l'agence pour répondre (voir contexte ci-dessous). Utilise du formatage markdown (gras, listes) pour aérer tes réponses.

⚠️ RÈGLES IMPORTANTES  
- Ne pose jamais trop de questions d'un coup. Maximum UNE question à la fois.
- Si le client demande s'il y a des exemples de projets, sers-t'en pour lui répondre de manière précise et nomme les projets, sans être trop exhaustif non plus.

🪄 DÉROULÉ DE CONVERSATION :
1️⃣ QUALIFICATION DU BESOIN: Identifie d'abord le besoin principal.
2️⃣ APPROFONDISSEMENT INTELLIGENT: Collecte les infos utiles (Nom entreprise, Secteur, Cible, Urgence).
3️⃣ COLLECTE DES CONTACTS: Demande le Nom de la personne et son Email.

⚙️ ACTION DE SOUMISSION:
Quand tu as obtenu 1) Le Nom, 2) L'Email et 3) Le résumé du projet, utilise OBLIGATOIREMENT l'outil 'submit_client_lead' pour clore la conversation et envoyer les données à l'équipe.

📚 CONTEXTE DE L'AGENCE (RAG):
${systemContext || "Portefeuille: Agri Build, Equinoxe, Katana..."}`;

              const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction,
                tools: [{
                  functionDeclarations: [
                    {
                      name: "submit_client_lead",
                      description: "Appelle cette fonction dès que tu as obtenu le nom, l'email et le résumé du projet du prospect pour finaliser la collecte et avertir l'équipe.",
                      parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                          nom: { type: SchemaType.STRING, description: "Nom complet du prospect" },
                          email: { type: SchemaType.STRING, description: "Adresse email du prospect" },
                          projet: { type: SchemaType.STRING, description: "Résumé complet du besoin" }
                        },
                        required: ["nom", "email", "projet"]
                      }
                    }
                  ]
                }]
              });

              const chatSession = model.startChat({ history });

              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.setHeader('Transfer-Encoding', 'chunked');

              const result = await chatSession.sendMessageStream(userMessage);

              for await (const chunk of result.stream) {
                const calls = chunk.functionCalls();
                if (calls && calls.length > 0) {
                  const call = calls[0];
                  if (call.name === "submit_client_lead") {
                    const args: any = call.args;
                    try {
                      await fetch('https://formspree.io/f/mdalyybw', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                          "Nom (Via IA)": args.nom || "Inconnu",
                          "Email": args.email || "Inconnu",
                          "Résumé Projet (Via IA)": args.projet || "Non défini",
                          "Méthode": "Assistant IA Gemini"
                        }),
                      });
                    } catch (e) { console.error("Formspree Error", e); }

                    res.write('__SUBMITTED__');
                    res.end();
                    return;
                  }
                }

                try {
                  const textChunk = chunk.text();
                  if (textChunk) res.write(textChunk);
                } catch (e) { }
              }

              res.end();
            } catch (error: any) {
              console.error("Local Chat API Error:", error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          });
          return;
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
              const matches = content.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
              if (!matches || matches.length !== 3) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid base64 format' }));
                return;
              }

              const buffer = Buffer.from(matches[2], 'base64');
              const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

              const uploadsDir = path.resolve(__dirname, './public/uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              const filePath = path.join(uploadsDir, uniqueFilename);
              fs.writeFileSync(filePath, buffer);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ url: `/uploads/${uniqueFilename}` }));
            } catch {
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
