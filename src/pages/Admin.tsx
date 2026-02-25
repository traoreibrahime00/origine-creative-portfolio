import { useState, useEffect } from 'react';
import { Trash2, Plus, Save, ArrowUp, ArrowDown, Upload, Type, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

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

export function Admin() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setLoading(false);
            });
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

    const handleAddProject = () => {
        const newProject: Project = {
            id: Date.now(),
            title: "Nouveau Projet",
            category: "Branding",
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
            } catch (e) {
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
        saveProjects(projects);
    };

    if (loading) return <div className="p-20 text-white min-h-screen">Chargement...</div>;

    return (
        <div className="min-h-screen text-white pt-24 pb-20 px-4 md:px-10">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Gestion des Projets</h1>
                        <p className="text-white/50 text-sm">Espace d'administration simple pour ajouter ou modifier vos projets.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-sm text-[hsl(var(--accent-red))]">{status}</span>
                        <button
                            onClick={triggerSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-all"
                        >
                            <Save size={18} /> Sauvegarder
                        </button>
                        <button
                            onClick={handleAddProject}
                            className="flex items-center gap-2 bg-[hsl(var(--accent-red))] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all"
                        >
                            <Plus size={18} /> Ajouter
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
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
                                        <option value="Branding">Branding</option>
                                        <option value="Digital">Digital</option>
                                        <option value="Motion">Motion</option>
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
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">URL de l'image (facultatif)</label>
                                    <input
                                        type="text"
                                        value={project.imageUrl || ''}
                                        placeholder="/images/projet1.jpg ou https://..."
                                        onChange={(e) => handleChange(project.id, 'imageUrl', e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:border-[hsl(var(--accent-red))] outline-none"
                                    />
                                    <p className="text-xs text-white/40">Mettez une URL commençant par /images/... et placez l'image dans le dossier public/images/</p>
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
