import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, ExternalLink } from 'lucide-react';
import { RevealLine, RevealWords } from '../components/TextReveal';
import { Carousel3D } from '../components/Carousel3D';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import staticProjects from '../data/projects.json';

const categories = ['Tous', 'Identité & Stratégie de Marque', 'Communication Digitale', 'Production Audiovisuelle Premium'];

export type ContentBlock = {
    id: string;
    type: 'image' | 'video' | 'text';
    content: string;
};

type Project = {
    id: number;
    title: string;
    category: string;
    desc: string;
    type?: string;
    link?: string;
    imageUrl?: string;
    projectImages?: string[];
    contentBlocks?: ContentBlock[];
};

// Helper: Extract ID and return embed URL if it's Behance or YouTube
const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('behance.net')) {
            const match = urlObj.pathname.match(/(?:gallery|portfolios)\/(\d+)/);
            if (match && match[1]) {
                return `https://www.behance.net/embed/project/${match[1]}?auto_scale=1`;
            }
        }
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            let videoId = urlObj.searchParams.get('v');
            if (urlObj.hostname.includes('youtu.be')) videoId = urlObj.pathname.substring(1);
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch { return null; }
    return null;
};

export function Projets() {
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [projects, setProjects] = useState<Project[]>(staticProjects as Project[]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Lock background scrolling and UI when modal is open
    useEffect(() => {
        if (selectedProject) {
            document.body.style.overflow = 'hidden';

            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setSelectedProject(null);
                }
            };
            window.addEventListener('keydown', handleEsc);

            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleEsc);
            };
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedProject]);

    // Load from local API
    useEffect(() => {
        fetch('/api/projects')
            .then(res => {
                const contentType = res.headers.get("content-type");
                if (!res.ok || !contentType || !contentType.includes("application/json")) {
                    throw new Error("API route not available or didn't return JSON");
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProjects(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.log("Using static projects data (fallback)", err);
                setLoading(false);
            });
    }, []);

    const filteredProjects = activeCategory === 'Tous'
        ? projects
        : projects.filter(p => p.category === activeCategory);

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-7 md:px-12 lg:px-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-[hsl(var(--accent-red))]">Portfolio</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                            <RevealWords text="Réalisations" delayOffset={0.2} /> <RevealLine delay={0.4}><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">Récents</span></RevealLine>
                        </h1>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === cat
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading state */}
                {loading && <div className="text-white/50 animate-pulse">Chargement des projets...</div>}

                {/* Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredProjects.map((project, idx) => (
                        <motion.button
                            onClick={(e) => {
                                const embed = getEmbedUrl(project.link);
                                const hasBlocks = project.contentBlocks && project.contentBlocks.length > 0;
                                const hasImages = project.projectImages && project.projectImages.length > 0;

                                if (hasBlocks || hasImages || embed) {
                                    e.preventDefault();
                                    setSelectedProject(project);
                                } else if (project.link) {
                                    window.open(project.link, '_blank');
                                }
                            }}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            key={project.id}
                            data-cursor="VOIR"
                            className={`group relative rounded-3xl overflow-hidden aspect-[4/5] bg-zinc-900 border border-white/5 cursor-pointer block text-left w-full ${idx % 3 === 1 ? 'lg:translate-y-12' : idx % 3 === 2 ? 'lg:translate-y-24' : ''
                                }`}
                        >
                            {/* Image Placeholder or Actual Image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>

                            {project.imageUrl ? (
                                <motion.img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    initial={{ scale: 1.2 }}
                                    whileInView={{ scale: 1.05 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                                    <span className="text-white/5 font-bold text-4xl transform -rotate-12 select-none">{project.category}</span>
                                </div>
                            )}

                            {/* Content */}
                            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">
                                <div className="self-start inline-block px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest font-medium border border-white/10 text-[hsl(var(--accent-red))]">
                                    {project.category}
                                </div>

                                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-[hsl(var(--accent-red))] transition-colors">{project.title}</h3>
                                    <p className="text-sm text-white/60 line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        {project.desc}
                                    </p>

                                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowUpRight />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Video / Behance Modal */}
                {createPortal(
                    <AnimatePresence>
                        {selectedProject && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-10 bg-black/90 backdrop-blur-md"
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        setSelectedProject(null);
                                    }
                                }}
                            >
                                <div className="relative w-full max-w-7xl h-full flex flex-col bg-zinc-950 sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-4 md:px-8 border-b border-white/10 shrink-0">
                                        <div>
                                            <h3 className="text-xl font-bold">{selectedProject.title}</h3>
                                            <p className="text-sm text-white/50">{selectedProject.category}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <a
                                                href={selectedProject.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                            >
                                                <ExternalLink size={16} /> URL original
                                            </a>
                                            <button
                                                onClick={() => setSelectedProject(null)}
                                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* iframe or image area */}
                                    <div className="flex-1 w-full bg-[#0a0a0a] relative overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                                        {getEmbedUrl(selectedProject.link) ? (
                                            <iframe
                                                src={getEmbedUrl(selectedProject.link) || ''}
                                                className="absolute inset-0 w-full h-full"
                                                allowFullScreen
                                                frameBorder="0"
                                                allow="autoplay; encrypted-media; fullscreen"
                                            />
                                        ) : (
                                            <div className="flex flex-col w-full">
                                                {(() => {
                                                    const allImages = [
                                                        ...(selectedProject.projectImages || []),
                                                        ...(selectedProject.contentBlocks?.filter(b => b.type === 'image' && b.content).map(b => b.content) || [])
                                                    ];

                                                    if (allImages.length > 0) {
                                                        return (
                                                            <div className="flex w-full h-[500px] md:h-[600px] my-4 items-center justify-center overflow-hidden bg-[#0a0a0a] py-4">
                                                                <Carousel3D images={allImages} />
                                                            </div>
                                                        );
                                                    } else if (selectedProject.imageUrl) {
                                                        return (
                                                            <div className="flex w-full h-full min-h-[60vh] bg-[#0a0a0a] items-center justify-center">
                                                                <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-auto block" />
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className="p-20 text-white/50 text-center flex flex-col items-center bg-[#0a0a0a] min-h-[60vh] justify-center">
                                                                <p>Aucun contenu visuel importé.</p>
                                                                {selectedProject.contentBlocks?.length === 0 && (
                                                                    <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="mt-4 px-6 py-2 bg-[hsl(var(--accent-red))] text-white font-medium rounded-full cursor-pointer hover:bg-white hover:text-black transition-colors">Voir le projet original</a>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                })()}

                                                {/* Render Text and Videos below */}
                                                {selectedProject.contentBlocks && selectedProject.contentBlocks.filter(b => b.type !== 'image').length > 0 && (
                                                    <div className="flex flex-col w-full bg-[#0a0a0a]">
                                                        {selectedProject.contentBlocks.filter(b => b.type !== 'image').map((block) => (
                                                            <div key={block.id} className="w-full flex justify-center mt-4">
                                                                {block.type === 'text' && <div className="w-full text-white/90 whitespace-pre-wrap text-lg font-light max-w-4xl px-8 py-8">{block.content}</div>}
                                                                {block.type === 'video' && block.content && <video src={block.content} className="w-full max-w-5xl h-auto block rounded-lg mt-4 shadow-xl px-4" autoPlay loop muted playsInline controls />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Strategic Contextual CTA (Shown at bottom of every project) */}
                                                <div className="w-full bg-[#0a0a0a] py-24 flex justify-center items-center mt-4 relative">
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[hsl(var(--accent-red))] to-transparent opacity-50"></div>
                                                    <div className="text-center px-4 max-w-xl">
                                                        <h4 className="text-3xl font-bold mb-4 tracking-tight">Vous visez ce niveau d'exigence ?</h4>
                                                        <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">Nous accompagnons les acteurs ambitieux pour structurer leur stratégie et déployer une image implacable sur le marché.</p>
                                                        <a href="/contact" className="inline-flex items-center gap-3 bg-[hsl(var(--accent-red))] text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-black transition-all group">
                                                            Initier un projet <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}

            </div>
        </main>
    );
}
