import { useState, useEffect } from 'react';
import { Trash2, Plus, Save, ArrowUp, ArrowDown, Upload, Type, Image as ImageIcon, Video as VideoIcon, ChevronDown, FileText } from 'lucide-react';
import staticProjects from '../data/projects.json';
import staticArticles from '../data/blog.json';

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
    caseStudy?: {
        challenge: string;
        strategy: string;
        result: string;
        testimonial?: string;
    };
};

type BlogArticle = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    coverImage: string;
    author: string;
    publishedAt: string;
    readTime: number;
};

export function Admin() {
    const [projects, setProjects] = useState<Project[]>(staticProjects as Project[]);
    const [articles, setArticles] = useState<BlogArticle[]>(staticArticles as BlogArticle[]);
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState<'projects' | 'content' | 'blog'>('projects');
    const [expandedCaseStudy, setExpandedCaseStudy] = useState<number | null>(null);

    useEffect(() => {
        // Fetch projects
        fetch('/api/projects')
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

        // Fetch content
        fetch('/api/content')
            .then(res => res.json())
            .then(data => setContent(data))
            .catch(err => console.log("Using static content data (fallback)", err));
    }, []);
    const saveProjects = async (newProjects: Project[]) => {
        setSaving(true);
        setStatus('Sauvegarde en cours...');
        try {
            await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProjects),
            });
            setStatus('Sauvegardé avec succès !');
            setTimeout(() => setStatus(''), 3000);
            setProjects(newProjects);
        } catch (err) {
            console.error(err);
            setStatus("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const saveContent = async () => {
        setSaving(true);
        setStatus('Sauvegarde du contenu...');
        try {
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content),
            });
            setStatus('Contenu sauvegardé avec succès !');
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            console.error(err);
            setStatus("Erreur lors de la sauvegarde du contenu.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddProject = () => {
        const newProject: Project = {
            id: Date.now(),
            title: "Nouveau Projet",
            category: "Identité & Stratégie de Marque",
            desc: "Description du projet...",
            type: "photo",
            link: "",
            imageUrl: "",
        };
        saveProjects([...projects, newProject]);
    };

    const handleDelete = (id: number) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            const updated = projects.filter(p => p.id !== id);
            saveProjects(updated);
        }
    };

    const handleChange = (id: number, field: keyof Project, value: string) => {
        const updated = projects.map(p => p.id === id ? { ...p, [field]: value } : p);
        setProjects(updated);
    };

    const handleLinkChange = async (id: number, url: string) => {
        handleChange(id, 'link', url);
        if (url.startsWith('http')) {
            // Small timeout to not trigger on every keystroke
            setTimeout(async () => {
                const currentProjects = await new Promise<Project[]>(resolve => setProjects(prev => { resolve(prev); return prev; }));
                const project = currentProjects.find(p => p.id === id);
                if (project && project.link === url && (!project.imageUrl || !project.projectImages?.length)) {
                    setStatus("Recherche des images sur le lien...");
                    try {
                        const res = await fetch(`/api/og-image?url=${encodeURIComponent(url)}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.imageUrl || data.projectImages?.length) {
                                setProjects(prev => prev.map(p => p.id === id ? {
                                    ...p,
                                    imageUrl: p.imageUrl || data.imageUrl,
                                    projectImages: data.projectImages?.length ? data.projectImages : p.projectImages
                                } : p));
                                setStatus("Images importées !");
                                setTimeout(() => setStatus(''), 3000);
                            } else {
                                setStatus('');
                            }
                        }
                    } catch {
                        setStatus('');
                    }
                }
            }, 1000);
        }
    };

    const addContentBlock = (projectId: number, type: 'image' | 'video' | 'text') => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            const newBlock: ContentBlock = { id: Math.random().toString(36).substr(2, 9), type, content: '' };
            return { ...p, contentBlocks: [...(p.contentBlocks || []), newBlock] };
        }));
    };

    const updateContentBlock = (projectId: number, blockId: string, content: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                contentBlocks: p.contentBlocks?.map(b => b.id === blockId ? { ...b, content } : b)
            };
        }));
    };

    const removeContentBlock = (projectId: number, blockId: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                contentBlocks: p.contentBlocks?.filter(b => b.id !== blockId)
            };
        }));
    };

    const moveContentBlock = (projectId: number, index: number, direction: 'up' | 'down') => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId || !p.contentBlocks) return p;
            const newBlocks = [...p.contentBlocks];
            if (direction === 'up' && index > 0) {
                [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
            } else if (direction === 'down' && index < newBlocks.length - 1) {
                [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
            }
            return { ...p, contentBlocks: newBlocks };
        }));
    };

    const handleFileUpload = async (projectId: number, blockId: string, file: File) => {
        setStatus("Téléchargement en cours...");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, content: base64 })
                });
                if (res.ok) {
                    const data = await res.json();
                    updateContentBlock(projectId, blockId, data.url);
                    setStatus("Fichier téléchargé !");
                } else {
                    setStatus("Erreur lors du téléchargement");
                }
            } catch {
                setStatus("Erreur lors du téléchargement");
            }
            setTimeout(() => setStatus(''), 3000);
        };
    };

    const handleImageCoverUpload = async (projectId: number, file: File) => {
        setStatus("Téléchargement de l'aperçu en cours...");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: 'cover_' + file.name, content: base64 })
                });
                if (res.ok) {
                    const data = await res.json();
                    handleChange(projectId, 'imageUrl', data.url);
                    setStatus("Aperçu téléchargé !");
                } else {
                    setStatus("Erreur lors du téléchargement");
                }
            } catch {
                setStatus("Erreur lors du téléchargement");
            }
            setTimeout(() => setStatus(''), 3000);
        };
    };

    const handleMultipleFileUpload = async (projectId: number, files: FileList) => {
        setStatus("Téléchargement en cours...");

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            const blockId = Math.random().toString(36).substr(2, 9);

            setProjects(prev => prev.map(p => {
                if (p.id !== projectId) return p;
                const newBlock: ContentBlock = { id: blockId, type, content: '' };
                return { ...p, contentBlocks: [...(p.contentBlocks || []), newBlock] };
            }));

            const reader = new FileReader();
            await new Promise((resolve) => {
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64 = reader.result as string;
                    try {
                        const res = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filename: file.name, content: base64 })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            updateContentBlock(projectId, blockId, data.url);
                        }
                    } catch (e) {
                        console.error("Upload error", e);
                    }
                    resolve(null);
                };
            });
        }

        setStatus("Fichiers téléchargés !");
        setTimeout(() => setStatus(''), 3000);
    };

    const triggerSave = () => {
        if (activeTab === 'projects') {
            saveProjects(projects);
        } else if (activeTab === 'blog') {
            // Blog save — in a real app this would persist to API
            setStatus('Articles sauvegardés !');
            setTimeout(() => setStatus(''), 3000);
        } else {
            saveContent();
        }
    };

    if (loading) return <div className="p-20 text-white min-h-screen">Chargement...</div>;

    return (
        <div className="min-h-screen text-white pt-24 pb-20 px-4 md:px-10">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Administration</h1>
                        <p className="text-white/50 text-sm">Gérez le contenu et les projets de votre agence.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-sm text-[hsl(var(--accent-red))]">{status}</span>
                        <button
                            onClick={triggerSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-all shadow-lg hover:shadow-white/20"
                        >
                            <Save size={18} /> Sauvegarder (Tout)
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 mb-8">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`pb-4 px-2 font-medium tracking-wide border-b-2 transition-colors ${activeTab === 'projects' ? 'border-[hsl(var(--accent-red))] text-white' : 'border-transparent text-white/50 hover:text-white'}`}
                    >
                        Projets (Portfolio)
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-4 px-2 font-medium tracking-wide border-b-2 transition-colors ${activeTab === 'content' ? 'border-[hsl(var(--accent-red))] text-white' : 'border-transparent text-white/50 hover:text-white'}`}
                    >
                        Textes du Site
                    </button>
                    <button
                        onClick={() => setActiveTab('blog')}
                        className={`pb-4 px-2 font-medium tracking-wide border-b-2 transition-colors ${activeTab === 'blog' ? 'border-[hsl(var(--accent-red))] text-white' : 'border-transparent text-white/50 hover:text-white'}`}
                    >
                        <span className="flex items-center gap-2"><FileText size={16} /> Blog</span>
                    </button>
                </div>

                {activeTab === 'projects' && (
                    <div className="space-y-6">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleAddProject}
                                className="flex items-center gap-2 bg-[hsl(var(--accent-red))] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all"
                            >
                                <Plus size={18} /> Nouveau Projet
                            </button>
                        </div>
                        {projects.map((project) => (
                            <div key={project.id} className="bg-zinc-900 border border-white/10 rounded-xl p-6 relative">
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="absolute top-6 right-6 text-white/40 hover:text-red-500 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={20} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Titre du Projet</label>
                                        <input
                                            type="text"
                                            value={project.title}
                                            onChange={(e) => handleChange(project.id, 'title', e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Catégorie</label>
                                        <select
                                            value={project.category}
                                            onChange={(e) => handleChange(project.id, 'category', e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none appearance-none"
                                        >
                                            <option value="Identité & Stratégie de Marque">Identité & Stratégie de Marque</option>
                                            <option value="Communication Digitale">Communication Digitale</option>
                                            <option value="Production Audiovisuelle Premium">Production Audiovisuelle Premium</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Description</label>
                                        <textarea
                                            value={project.desc}
                                            onChange={(e) => handleChange(project.id, 'desc', e.target.value)}
                                            rows={2}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Type (Photo, Video, Lien)</label>
                                        <select
                                            value={project.type || "photo"}
                                            onChange={(e) => handleChange(project.id, 'type', e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none appearance-none"
                                        >
                                            <option value="photo">Photo / Image</option>
                                            <option value="video">Vidéo</option>
                                            <option value="lien">Lien externe</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Lien (facultatif)</label>
                                        <input
                                            type="text"
                                            value={project.link || ''}
                                            placeholder="https://..."
                                            onChange={(e) => handleLinkChange(project.id, e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Image d'Aperçu (Miniature du Projet)</label>
                                        {project.imageUrl && (
                                            <div className="mb-2 w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                                                <img src={project.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex gap-4 items-center mt-2">
                                            <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded cursor-pointer transition-colors text-sm w-fit border border-white/10 shrink-0">
                                                <Upload size={16} />
                                                Télécharger mon Aperçu
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files?.[0] && handleImageCoverUpload(project.id, e.target.files[0])}
                                                />
                                            </label>
                                            <span className="text-xs text-white/40 whitespace-nowrap">ou URL :</span>
                                            <input
                                                type="text"
                                                value={project.imageUrl || ''}
                                                placeholder="https://..."
                                                onChange={(e) => handleChange(project.id, 'imageUrl', e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">C'est l'image qui s'affichera sur la carte du projet dans la galerie (page Projets & Accueil).</p>
                                    </div>

                                </div>

                                {/* Content Builder */}
                                <div className="mt-8 border-t border-white/10 pt-6">
                                    <h3 className="text-lg font-medium mb-4">Contenu du Projet (Vitrine)</h3>
                                    <div className="space-y-4 mb-4">
                                        {(project.contentBlocks || []).map((block, index) => (
                                            <div key={block.id} className="bg-black/50 border border-white/10 rounded-lg p-4 flex gap-4 items-start relative group">
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <button onClick={() => moveContentBlock(project.id, index, 'up')} className="p-1 hover:bg-white/10 rounded"><ArrowUp size={14} /></button>
                                                    <button onClick={() => moveContentBlock(project.id, index, 'down')} className="p-1 hover:bg-white/10 rounded"><ArrowDown size={14} /></button>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider mb-2">
                                                        {block.type === 'image' && <><ImageIcon size={14} /> Image</>}
                                                        {block.type === 'video' && <><VideoIcon size={14} /> Vidéo</>}
                                                        {block.type === 'text' && <><Type size={14} /> Texte</>}
                                                    </div>

                                                    {block.type === 'text' ? (
                                                        <textarea
                                                            value={block.content}
                                                            onChange={(e) => updateContentBlock(project.id, block.id, e.target.value)}
                                                            placeholder="Saisissez votre texte..."
                                                            rows={3}
                                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y"
                                                        />
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {block.content && block.type === 'image' && <img src={block.content} alt="" className="w-full max-w-sm rounded object-cover" />}
                                                            {block.content && block.type === 'video' && <video src={block.content} className="w-full max-w-sm rounded object-cover" controls />}

                                                            <div className="flex gap-4 items-center">
                                                                <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded cursor-pointer transition-colors text-sm">
                                                                    <Upload size={16} />
                                                                    Télécharger {block.type === 'image' ? 'une image' : 'une vidéo'}
                                                                    <input
                                                                        type="file"
                                                                        accept={block.type === 'image' ? 'image/*' : 'video/*'}
                                                                        className="hidden"
                                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(project.id, block.id, e.target.files[0])}
                                                                    />
                                                                </label>
                                                                <span className="text-xs text-white/40">ou collez une URL :</span>
                                                                <input
                                                                    type="text"
                                                                    value={block.content}
                                                                    onChange={(e) => updateContentBlock(project.id, block.id, e.target.value)}
                                                                    placeholder="https://..."
                                                                    className="flex-1 bg-black border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => removeContentBlock(project.id, block.id)}
                                                    className="absolute top-4 right-4 text-white/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => addContentBlock(project.id, 'image')} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-sm px-3 py-1.5 rounded transition-colors"><ImageIcon size={14} /> Ajouter Image</button>
                                        <button onClick={() => addContentBlock(project.id, 'video')} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-sm px-3 py-1.5 rounded transition-colors"><VideoIcon size={14} /> Ajouter Vidéo</button>
                                        <button onClick={() => addContentBlock(project.id, 'text')} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-sm px-3 py-1.5 rounded transition-colors"><Type size={14} /> Ajouter Texte</button>

                                        <div className="w-px h-6 bg-white/10 mx-2 self-center"></div>

                                        <label className="flex items-center gap-1.5 bg-[hsl(var(--accent-red))] hover:bg-red-600 text-sm px-3 py-1.5 justify-center rounded transition-colors cursor-pointer text-white font-medium">
                                            <Upload size={14} /> Téléchargement multiple (Photos/Vidéos)
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => e.target.files && handleMultipleFileUpload(project.id, e.target.files)}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Case Study Accordion */}
                                <div className="mt-6 border-t border-white/10 pt-4">
                                    <button
                                        onClick={() => setExpandedCaseStudy(expandedCaseStudy === project.id ? null : project.id)}
                                        className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors w-full"
                                    >
                                        <ChevronDown size={16} className={`transition-transform ${expandedCaseStudy === project.id ? 'rotate-180' : ''}`} />
                                        Étude de Cas (optionnel)
                                    </button>

                                    {expandedCaseStudy === project.id && (
                                        <div className="mt-4 grid grid-cols-1 gap-4 bg-black/30 rounded-lg p-4 border border-white/5">
                                            <div className="space-y-2">
                                                <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Le Défi</label>
                                                <textarea
                                                    value={project.caseStudy?.challenge || ''}
                                                    onChange={(e) => {
                                                        const updated = projects.map(p => p.id === project.id ? {
                                                            ...p,
                                                            caseStudy: { ...p.caseStudy, challenge: e.target.value, strategy: p.caseStudy?.strategy || '', result: p.caseStudy?.result || '' }
                                                        } : p);
                                                        setProjects(updated);
                                                    }}
                                                    rows={2}
                                                    placeholder="Quel était le problème du client ?"
                                                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Notre Stratégie</label>
                                                <textarea
                                                    value={project.caseStudy?.strategy || ''}
                                                    onChange={(e) => {
                                                        const updated = projects.map(p => p.id === project.id ? {
                                                            ...p,
                                                            caseStudy: { ...p.caseStudy, challenge: p.caseStudy?.challenge || '', strategy: e.target.value, result: p.caseStudy?.result || '' }
                                                        } : p);
                                                        setProjects(updated);
                                                    }}
                                                    rows={2}
                                                    placeholder="Comment avez-vous résolu le problème ?"
                                                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Le Résultat</label>
                                                <textarea
                                                    value={project.caseStudy?.result || ''}
                                                    onChange={(e) => {
                                                        const updated = projects.map(p => p.id === project.id ? {
                                                            ...p,
                                                            caseStudy: { ...p.caseStudy, challenge: p.caseStudy?.challenge || '', strategy: p.caseStudy?.strategy || '', result: e.target.value }
                                                        } : p);
                                                        setProjects(updated);
                                                    }}
                                                    rows={2}
                                                    placeholder="Quels résultats concrets ?"
                                                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Témoignage Client (optionnel)</label>
                                                <input
                                                    type="text"
                                                    value={project.caseStudy?.testimonial || ''}
                                                    onChange={(e) => {
                                                        const updated = projects.map(p => p.id === project.id ? {
                                                            ...p,
                                                            caseStudy: { ...p.caseStudy, challenge: p.caseStudy?.challenge || '', strategy: p.caseStudy?.strategy || '', result: p.caseStudy?.result || '', testimonial: e.target.value }
                                                        } : p);
                                                        setProjects(updated);
                                                    }}
                                                    placeholder="Citation du client..."
                                                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none text-sm italic"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'content' && content && (
                    <div className="space-y-8">
                        {/* Page Accueil */}
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent-red))]"></span>
                                Page Accueil (Hero)
                            </h2>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Ligne 1 du Titre</label>
                                    <input
                                        type="text"
                                        value={content.home?.heroHeadlineLine1 || ''}
                                        onChange={(e) => setContent({ ...content, home: { ...content.home, heroHeadlineLine1: e.target.value } })}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Ligne 2 du Titre (Dégradé)</label>
                                    <input
                                        type="text"
                                        value={content.home?.heroHeadlineLine2 || ''}
                                        onChange={(e) => setContent({ ...content, home: { ...content.home, heroHeadlineLine2: e.target.value } })}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Ligne 3 du Titre</label>
                                    <input
                                        type="text"
                                        value={content.home?.heroHeadlineLine3 || ''}
                                        onChange={(e) => setContent({ ...content, home: { ...content.home, heroHeadlineLine3: e.target.value } })}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Sous-titre (Paragraphe)</label>
                                    <textarea
                                        value={content.home?.heroSubheadline || ''}
                                        onChange={(e) => setContent({ ...content, home: { ...content.home, heroSubheadline: e.target.value } })}
                                        rows={3}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Page A Propos */}
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent-red))]"></span>
                                Page À Propos (Vision)
                            </h2>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Paragraphe 1</label>
                                    <textarea
                                        value={content.apropos?.visionText1 || ''}
                                        onChange={(e) => setContent({ ...content, apropos: { ...content.apropos, visionText1: e.target.value } })}
                                        rows={2}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Paragraphe 2 (Partie en gras)</label>
                                    <input
                                        type="text"
                                        value={content.apropos?.visionText2Bold || ''}
                                        onChange={(e) => setContent({ ...content, apropos: { ...content.apropos, visionText2Bold: e.target.value } })}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white font-bold focus:border-[hsl(var(--accent-red))] outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Paragraphe 2 (Suite)</label>
                                    <textarea
                                        value={content.apropos?.visionText2 || ''}
                                        onChange={(e) => setContent({ ...content, apropos: { ...content.apropos, visionText2: e.target.value } })}
                                        rows={2}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Paragraphe 3</label>
                                    <textarea
                                        value={content.apropos?.visionText3 || ''}
                                        onChange={(e) => setContent({ ...content, apropos: { ...content.apropos, visionText3: e.target.value } })}
                                        rows={2}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y"
                                    />
                                </div>
                                <hr className="border-white/10 my-4" />
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Citation (Texte)</label>
                                    <textarea
                                        value={content.apropos?.quoteText || ''}
                                        onChange={(e) => setContent({ ...content, apropos: { ...content.apropos, quoteText: e.target.value } })}
                                        rows={2}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y italic"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Citation (Auteur)</label>
                                    <input
                                        type="text"
                                        value={content.apropos?.quoteAuthor || ''}
                                        onChange={(e) => setContent({ ...content, apropos: { ...content.apropos, quoteAuthor: e.target.value } })}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-[hsl(var(--accent-red))] focus:border-[hsl(var(--accent-red))] outline-none uppercase text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'blog' && (
                    <div className="space-y-6">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    const newArticle: BlogArticle = {
                                        id: Date.now(),
                                        slug: `article-${Date.now()}`,
                                        title: 'Nouvel Article',
                                        excerpt: '',
                                        content: '',
                                        category: 'Stratégie',
                                        coverImage: '',
                                        author: 'Origine Creative',
                                        publishedAt: new Date().toISOString().split('T')[0],
                                        readTime: 5
                                    };
                                    setArticles([...articles, newArticle]);
                                }}
                                className="flex items-center gap-2 bg-[hsl(var(--accent-red))] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all"
                            >
                                <Plus size={18} /> Nouvel Article
                            </button>
                        </div>
                        {articles.map((article) => (
                            <div key={article.id} className="bg-zinc-900 border border-white/10 rounded-xl p-6 relative">
                                <button
                                    onClick={() => setArticles(articles.filter(a => a.id !== article.id))}
                                    className="absolute top-6 right-6 text-white/40 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Titre</label>
                                        <input
                                            type="text"
                                            value={article.title}
                                            onChange={(e) => setArticles(articles.map(a => a.id === article.id ? { ...a, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : a))}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Catégorie</label>
                                        <select
                                            value={article.category}
                                            onChange={(e) => setArticles(articles.map(a => a.id === article.id ? { ...a, category: e.target.value } : a))}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none appearance-none"
                                        >
                                            <option value="Stratégie">Stratégie</option>
                                            <option value="Digital">Digital</option>
                                            <option value="Branding">Branding</option>
                                            <option value="Design">Design</option>
                                            <option value="Tendances">Tendances</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Extrait (aperçu)</label>
                                        <textarea
                                            value={article.excerpt}
                                            onChange={(e) => setArticles(articles.map(a => a.id === article.id ? { ...a, excerpt: e.target.value } : a))}
                                            rows={2}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Contenu (Markdown)</label>
                                        <textarea
                                            value={article.content}
                                            onChange={(e) => setArticles(articles.map(a => a.id === article.id ? { ...a, content: e.target.value } : a))}
                                            rows={8}
                                            placeholder={"## Mon titre\n\nMon paragraphe avec du **gras** et des [liens](/contact)."}
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none resize-y font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Image de Couverture (URL)</label>
                                        <input
                                            type="text"
                                            value={article.coverImage}
                                            onChange={(e) => setArticles(articles.map(a => a.id === article.id ? { ...a, coverImage: e.target.value } : a))}
                                            placeholder="https://..."
                                            className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Date</label>
                                            <input
                                                type="date"
                                                value={article.publishedAt}
                                                onChange={(e) => setArticles(articles.map(a => a.id === article.id ? { ...a, publishedAt: e.target.value } : a))}
                                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Temps de lecture (min)</label>
                                            <input
                                                type="number"
                                                value={article.readTime}
                                                onChange={(e) => setArticles(articles.map(a => a.id === article.id ? { ...a, readTime: parseInt(e.target.value) || 5 } : a))}
                                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
