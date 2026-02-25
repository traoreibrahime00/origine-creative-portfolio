import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSession = useRef<any>(null); // To store Gemini chat history

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
                systemInstruction: `Tu es l'assistant de l'agence créative africaine "Origine Creative". Ton rôle est d'accueillir les clients de manière chaleureuse, courte et très professionnelle. 
                Ton objectif est de récupérer 3 informations : Le NOM du client, son EMAIL, et la DESCRIPTION de son PROJET.
                NE POSE SURTOUT PAS TOUTES LES QUESTIONS EN MÊME TEMPS ! Pose-les une par une de manière conversationnelle. Sois très concis (2-3 phrases max).
                
                DÈS QUE TU AS OBTENU CES 3 INFORMATIONS CLAIRES, arrête de discuter. Et réponds UNIQUEMENT et EXACTEMENT avec ce bloc de texte JSON strict (aucun autre mot, aucune salutation) :
                {
                    "nom": "nom_du_client",
                    "email": "email_du_client",
                    "projet": "petit_resume_du_projet"
                }

                Tant que tu n'as pas obtenu les 3 infos, continue la discussion normalement pour avoir ce qui manque.`,
            });

            // Start an empty chat session to keep context
            chatSession.current = model.startChat({
                generationConfig: {
                    temperature: 0.7,
                },
                history: [
                    {
                        role: "user",
                        parts: [{ text: "Bonjour, j'aimerais vous contacter concernant mes futurs envies pour mon agence ou mon entreprise." }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Bonjour ! ✨ Je suis l'assistant IA d'Origine Creative. C'est un plaisir de vous accueillir ! \nPour commencer et bien vous orienter, pourriez-vous me donner votre nom ou celui de votre entreprise ?" }],
                    }
                ]
            });

            // Add the initial message to the UI
            setMessages([{
                id: Date.now().toString(),
                text: "Bonjour ! ✨ Je suis l'assistant virtuel d'Origine Creative. Pour commencer, avec qui ai-je l'honneur de discuter ?",
                sender: 'bot'
            }]);
        };

        if (!chatSession.current) {
            initChat();
        }
    }, []);

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
        if (!inputValue.trim() || isTyping || isSubmitted) return;

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
                        text: `Parfait ${parsedData.nom} ! J'ai bien noté votre demande pour "${parsedData.projet.slice(0, 30)}...". J'ai transmis vos coordonnées à l'équipe. Ils vous contacteront très vite sur ${parsedData.email}. Merci et à très bientôt ! 🚀`,
                        sender: 'bot'
                    }]);
                    setIsSubmitted(true);

                    // Send data to Formspree silently in background
                    await sendToFormspree(parsedData);

                } catch (parseError) {
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
        <div className="fixed bottom-6 right-6 z-[100]">
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-[hsl(var(--accent-red))] text-white shadow-2xl flex items-center justify-center relative overflow-hidden"
                data-cursor="CHAT"
            >
                {/* Glow effect */}
                <span className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 hover:opacity-100 transition-opacity"></span>

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <MessageSquare size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Micro notification dot */}
                {!isOpen && !isSubmitted && messages.length > 1 && (
                    <span className="absolute top-4 right-4 w-3 h-3 rounded-full bg-white border-2 border-[hsl(var(--accent-red))] animate-pulse"></span>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
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
