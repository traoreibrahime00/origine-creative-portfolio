import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';
import ReactMarkdown from 'react-markdown';
import aiRobotAnimation from '../assets/ai-robot.json';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
};

const STORAGE_KEY = 'origine_ai_chat_history';
const SUBMITTED_KEY = 'origine_ai_chat_submitted';

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [randomPos, setRandomPos] = useState({ x: 0, y: 0 });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Load history
    useEffect(() => {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        const savedSubmitted = localStorage.getItem(SUBMITTED_KEY);

        if (savedSubmitted === 'true') {
            setIsSubmitted(true);
        }

        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (parsed && parsed.length > 0) {
                    setMessages(parsed);
                    return;
                }
            } catch (e) {
                console.error("Failed to load chat history", e);
            }
        }

        // Initial Message
        setMessages([{
            id: Date.now().toString(),
            text: "Bonjour 👋 Je suis l'assistant de l'agence Origine Creative. Je peux vous aider à clarifier votre besoin en communication ou branding en quelques questions rapides. Qu'aimeriez-vous mettre en place actuellement ?",
            sender: 'bot'
        }]);
    }, []);

    // Save history
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    // Random floating movement
    useEffect(() => {
        if (isOpen) {
            setRandomPos({ x: 0, y: 0 });
            return;
        }

        const moveBot = () => {
            // Disable floating movement on mobile screens
            if (window.innerWidth < 768) {
                setRandomPos({ x: 0, y: 0 });
                return;
            }
            const rx = Math.floor(Math.random() * -150);
            const ry = Math.floor(Math.random() * -200);
            setRandomPos({ x: rx, y: ry });
        };

        const initialTimer = setTimeout(moveBot, 2000);
        const interval = setInterval(() => {
            moveBot();
        }, 4000 + Math.random() * 2000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isTyping || isSubmitted) return;

        const userText = inputValue.trim();
        setInputValue('');

        const newUserMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
        // Create an empty bot message that we will stream into
        const botMsgId = (Date.now() + 1).toString();
        const initialBotMsg: Message = { id: botMsgId, text: '', sender: 'bot' };

        const currentHistory = [...messages, newUserMsg];
        setMessages([...currentHistory, initialBotMsg]);
        setIsTyping(true);

        try {
            // Optional: get basic system context (fetching from our existing local API or static data)
            let systemContext = "";
            try {
                const [projectsRes, contentRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/content')
                ]);
                const projects = await projectsRes.json();
                const content = await contentRes.json();
                systemContext = `CONTEXTE PROJETS: ${JSON.stringify(projects.slice(0, 5))} \n\n CONTENU SITE: ${JSON.stringify(content)}`;
            } catch (e) { /* ignore */ }

            // Convert to history format for the API
            const apiHistory = messages
                .filter((m, idx) => !(idx === 0 && m.sender === 'bot'))
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: apiHistory,
                    userMessage: userText,
                    systemContext
                })
            });

            if (!response.ok) {
                throw new Error("API response error");
            }

            // Stream parsing
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';
            let isLeadSubmitted = false;

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunkText = decoder.decode(value);
                    if (chunkText.includes('__SUBMITTED__')) {
                        isLeadSubmitted = true;
                        break;
                    }

                    accumulatedText += chunkText;

                    // Update state live
                    setMessages(prev => prev.map(m =>
                        m.id === botMsgId ? { ...m, text: accumulatedText } : m
                    ));
                }
            }

            if (isLeadSubmitted) {
                setIsSubmitted(true);
                localStorage.setItem(SUBMITTED_KEY, 'true');
                setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== botMsgId);
                    return [...filtered, {
                        id: Date.now().toString(),
                        text: "✅ **Mission accomplie !**\n\nMerci pour ces informations précieuses. J'ai transmis votre dossier à l'équipe stratégie d'Origine Creative. Un consultant va étudier votre profil et reviendra vers vous très vite.\n\nÀ très bientôt !",
                        sender: 'bot'
                    }];
                });
            } else if (!accumulatedText.trim()) {
                setMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, text: "Oups... Mon réseau a eu un petit hoquet. Pouvez-vous répéter ?" } : m
                ));
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, text: "Oups... Erreur technique. L'API est peut-être injoignable." } : m
            ));
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SUBMITTED_KEY);
        setIsSubmitted(false);
        setMessages([{
            id: Date.now().toString(),
            text: "Bonjour 👋 Je suis l'assistant de l'agence Origine Creative. L'historique a été réinitialisé. Comment puis-je vous aider ?",
            sender: 'bot'
        }]);
    };

    return (
        <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[100] flex flex-col items-end">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                animate={!isOpen ? { x: randomPos.x, y: randomPos.y } : { x: 0, y: 0 }}
                transition={{ duration: 5, ease: "easeInOut" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`relative flex items-center justify-center z-10 transition-all duration-300 ${isOpen ? 'w-14 h-14 rounded-full bg-[hsl(var(--accent-red))] text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_0_15px_rgba(229,77,53,0.3)] hover:drop-shadow-[0_0_30px_rgba(229,77,53,0.6)]'}`}
                data-cursor="CHAT"
            >
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

                {!isOpen && !isSubmitted && messages.length > 1 && (
                    <span className="absolute top-0 right-0 sm:top-4 sm:right-4 w-4 h-4 rounded-full bg-[hsl(var(--accent-red))] border-2 border-zinc-950 animate-pulse"></span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-24 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                    >
                        <div className="bg-zinc-900 border-b border-white/10 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
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
                            <button onClick={handleClearHistory} className="text-[10px] uppercase text-white/30 hover:text-white transition-colors tracking-widest">
                                Reset
                            </button>
                        </div>

                        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4" onWheelCapture={(e) => e.stopPropagation()}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx === messages.length - 1 ? 0.1 : 0 }}
                                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-zinc-800 text-white self-end rounded-br-sm' : 'bg-white/5 text-white/90 border border-white/5 self-start rounded-bl-sm prose prose-invert prose-sm prose-p:my-1 prose-strong:text-white prose-ul:my-1 prose-li:my-0'}`}
                                >
                                    {msg.sender === 'bot' ? (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

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
                            <div className="p-4 bg-zinc-900 border-t border-white/5 text-center flex flex-col items-center gap-2">
                                <span className="text-xs text-[hsl(var(--accent-red))] uppercase tracking-widest font-bold">Demande Sécurisée & Envoyée</span>
                                <button onClick={handleClearHistory} className="text-xs text-white/50 underline hover:text-white">Refaire une simulation</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
