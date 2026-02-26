import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// For Vercel Edge/Serverless logic
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { history, userMessage } = req.body;

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
${req.body.systemContext || "Agri Build, Equinoxe, Katana..."}
`;

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

        // Enable streaming to the client
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.flushHeaders();

        const resultStream = await chatSession.sendMessageStream(userMessage);

        for await (const chunk of resultStream.stream) {
            const calls = chunk.functionCalls();
            if (calls && calls.length > 0) {
                const call = calls[0];
                if (call.name === "submit_client_lead") {
                    const args: any = call.args;

                    // Execute Formspree Webhook on the Server !
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

            if (chunk.text) {
                try {
                    const textChunk = chunk.text();
                    res.write(textChunk);
                } catch (e) { /* ignore chunk format errors */ }
            }
        }

        res.end();
    } catch (error: any) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: error.message });
    }
}
