import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import Lottie from 'lottie-react';
import aiRobotAnimation from '../assets/ai-robot.json';

// Initialize the API (Ensure VITE_GEMINI_API_KEY is in your .env / Vercel secrets)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "dummy_key_to_prevent_crash_if_missing");

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
};

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [randomPos, setRandomPos] = useState({ x: 0, y: 0 });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSession = useRef<ChatSession | null>(null); // To store Gemini chat history

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initialize chat session on load
    useEffect(() => {
        const initChat = async () => {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: `TU ES : un assistant IA expert en branding, communication et stratégie de marque pour l'agence de communication africaine moderne "Origine Creative".

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

⚠️ RÈGLES IMPORTANTES  
- Ne pose jamais trop de questions d'un coup  
- Maximum UNE question à la fois  
- Adapte tes questions selon les réponses  
- Va droit au but  
- Reste agréable et engageant  
- Si l'utilisateur est pressé → mode rapide  
- Si l'utilisateur est bavard → mode accompagnement  
- Si l'utilisateur pose une question métier → Réponds comme un expert en branding avant de continuer la qualification.

---
🪄 DÉROULÉ DE CONVERSATION :

1️⃣ QUALIFICATION DU BESOIN
Identifie d'abord le besoin principal parmi : Création de logo, Identité visuelle, Branding, Création de site web, Réseaux sociaux... Pose des questions intelligentes et progressives comme un consultant.

2️⃣ APPROFONDISSEMENT INTELLIGENT
Selon le besoin, collecte seulement les infos utiles : Nom de l'entreprise, Secteur d'activité, Cible principale, Objectif, Niveau d'urgence, Budget indicatif (formulation douce). Pose les questions de façon naturelle, regroupe quand c'est pertinent, évite l'interrogatoire.

3️⃣ COLLECTE DES CONTACTS (conversion)
Quand tu as compris le besoin, demande le Nom de la personne et son Email pour que l'équipe puisse la recontacter avec une proposition.

4️⃣ CLÔTURE (INSTRUCTION TECHNIQUE TRÈS IMPORTANTE)
Dès que tu as clairement identifié les 3 éléments cruciaux : 
1. Le Nom
2. L'Email
3. Le résumé du projet/besoin

Tu dois clôturer la discussion et générer un rapport machine. Pour cela, réponds UNIQUEMENT et EXACTEMENT avec ce bloc de texte JSON strict (AUCUN AUTRE MOT AVANT OU APRÈS CE JSON) :
{
    "nom": "nom_du_contact",
    "email": "email_du_contact",
    "projet": "resume_detaille_du_projet_secteur_et_budget_sil_y_en_a"
}

Tant que tu n'as pas obtenu ces 3 infos vitales, continue la discussion !`,
            });

            // Start an empty chat session to keep context
            chatSession.current = model.startChat({
                generationConfig: {
                    temperature: 0.7,
                },
                history: [
                    {
                        role: "user",
                        parts: [{ text: "Bonjour, je cherche une agence." }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Bonjour 👋 Je suis l'assistant de l'agence Origine Creative. Je peux vous aider à clarifier votre besoin en communication ou branding en quelques questions rapides. Qu'aimeriez-vous mettre en place actuellement ?" }],
                    }
                ]
            });

            // Add the initial message to the UI
            setMessages([{
                id: Date.now().toString(),
                text: "Bonjour 👋 Je suis l'assistant de l'agence Origine Creative. Je peux vous aider à clarifier votre besoin en communication ou branding en quelques questions rapides. Qu'aimeriez-vous mettre en place actuellement ?",
                sender: 'bot'
            }]);
        };

        if (!chatSession.current) {
            initChat();
        }
    }, []);

    // Random floating movement
    useEffect(() => {
        if (isOpen) return;

        const moveBot = () => {
            // Keep it bounded to the bottom right quadrant
            const rx = Math.floor(Math.random() * -150); // Move left up to 150px
            const ry = Math.floor(Math.random() * -200); // Move up up to 200px
            setRandomPos({ x: rx, y: ry });
        };

        // Move initially after a short delay
        const initialTimer = setTimeout(moveBot, 2000);

        // Then move every 4-6 seconds picking random spots
        const interval = setInterval(() => {
            moveBot();
        }, 4000 + Math.random() * 2000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [isOpen]);

    const sendToFormspree = async (data: { nom: string, email: string, projet: string }) => {
        try {
            await fetch('https://formspree.io/f/mdalyybw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "Nom (Via IA)": data.nom,
                    "Email": data.email,
                    "Résumé Projet (Via IA)": data.projet,
                    "Méthode": "Assistant IA Gemini"
                }),
            });
        } catch (error) {
            console.error("Formspree Error:", error);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isTyping || isSubmitted || !chatSession.current) return;

        const userText = inputValue.trim();
        setInputValue('');

        // Add user message to UI
        const newUserMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setIsTyping(true);

        try {
            // Send to Gemini
            const result = await chatSession.current.sendMessage(userText);
            const responseText = result.response.text();

            // Check if response is our JSON trigger
            if (responseText.trim().startsWith('{') && responseText.trim().endsWith('}')) {
                try {
                    const parsedData = JSON.parse(responseText.trim());

                    // Add success message
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        text: `Merci pour ces informations 🙏 Notre équipe branding va analyser votre besoin pour "${parsedData.projet.slice(0, 40)}..." et revenir vers vous très rapidement sur votre adresse ${parsedData.email}. À très bientôt !`,
                        sender: 'bot'
                    }]);
                    setIsSubmitted(true);

                    // Send data to Formspree silently in background
                    await sendToFormspree(parsedData);

                } catch {
                    // Fallback if JSON parsing fails but it looked like JSON
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        text: "Merci ! J'ai bien transmis les informations à notre équipe. À très bientôt !",
                        sender: 'bot'
                    }]);
                    setIsSubmitted(true);
                }
            } else {
                // Normal conversation continues
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    text: responseText,
                    sender: 'bot'
                }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: "Oups... Mon réseau a eu un petit hoquet. Pouvez-vous répéter ?",
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[100] flex flex-col items-end">
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                animate={!isOpen ? {
                    x: randomPos.x,
                    y: randomPos.y,
                } : {
                    x: 0,
                    y: 0,
                }}
                transition={{
                    duration: 5,
                    ease: "easeInOut"
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`relative flex items-center justify-center z-10 transition-all duration-300 ${isOpen ? 'w-14 h-14 rounded-full bg-[hsl(var(--accent-red))] text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_0_15px_rgba(229,77,53,0.3)] hover:drop-shadow-[0_0_30px_rgba(229,77,53,0.6)]'}`}
                data-cursor="CHAT"
            >
                {/* Glow effect for the close button */}
                {isOpen && <span className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 hover:opacity-100 transition-opacity"></span>}

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full h-full flex items-center justify-center pointer-events-none">
                            <Lottie animationData={aiRobotAnimation} loop={true} className="w-full h-full object-contain" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Micro notification dot */}
                {!isOpen && !isSubmitted && messages.length > 1 && (
                    <span className="absolute top-0 right-0 sm:top-4 sm:right-4 w-4 h-4 rounded-full bg-[hsl(var(--accent-red))] border-2 border-zinc-950 animate-pulse"></span>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-24 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-zinc-900 border-b border-white/10 p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[hsl(var(--accent-red))] to-orange-500 p-[2px]">
                                <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
                                    <Sparkles size={18} className="text-[hsl(var(--accent-red))]" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold tracking-tight">Assistant Origine</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-xs text-white/50">IA en ligne</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx === messages.length - 1 ? 0.1 : 0 }}
                                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-zinc-800 text-white self-end rounded-br-sm'
                                        : 'bg-white/5 text-white/90 border border-white/5 self-start rounded-bl-sm'
                                        }`}
                                >
                                    {msg.text}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="bg-white/5 border border-white/5 text-white/50 rounded-2xl rounded-bl-sm p-4 self-start flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        {!isSubmitted ? (
                            <div className="p-4 bg-zinc-900 border-t border-white/5">
                                <form onSubmit={handleSendMessage} className="relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Votre message..."
                                        disabled={isTyping}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-full py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-[hsl(var(--accent-red))] transition-colors disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || isTyping}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[hsl(var(--accent-red))] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-800 transition-colors"
                                    >
                                        {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 bg-zinc-900 border-t border-white/5 text-center">
                                <span className="text-xs text-[hsl(var(--accent-red))] uppercase tracking-widest font-bold">Demande Envoyée</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
