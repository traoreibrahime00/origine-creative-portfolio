import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';
import { RevealLine, RevealWords } from '../components/TextReveal';
import { useState } from 'react';
import articles from '../data/blog.json';

const categories = ['Tous', ...Array.from(new Set(articles.map(a => a.category)))];

export function Blog() {
    const [activeCategory, setActiveCategory] = useState('Tous');

    const sortedArticles = [...articles].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const filteredArticles = activeCategory === 'Tous'
        ? sortedArticles
        : sortedArticles.filter(a => a.category === activeCategory);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-7 md:px-12 lg:px-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[hsl(var(--accent-red))]"></div>
                            <span className="uppercase text-xs tracking-widest font-medium text-[hsl(var(--accent-red))]">Blog</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                            <RevealWords text="Réflexions" delayOffset={0.2} /> <RevealLine delay={0.4}><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">Stratégiques</span></RevealLine>
                        </h1>
                        <p className="text-white/60 text-lg mt-6 max-w-xl">
                            Insights, analyses et perspectives sur le branding, la communication digitale et le design en Afrique.
                        </p>
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

                {/* Featured Article (first one) */}
                {filteredArticles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-16"
                    >
                        <Link
                            to={`/blog/${filteredArticles[0].slug}`}
                            className="group grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:border-white/20 transition-all"
                            data-cursor="LIRE"
                        >
                            <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                                <img
                                    src={filteredArticles[0].coverImage}
                                    alt={filteredArticles[0].title}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="px-3 py-1 bg-[hsl(var(--accent-red))]/10 text-[hsl(var(--accent-red))] text-xs font-medium rounded-full border border-[hsl(var(--accent-red))]/20">
                                        {filteredArticles[0].category}
                                    </span>
                                    <span className="text-white/40 text-sm flex items-center gap-1.5">
                                        <Calendar size={14} /> {formatDate(filteredArticles[0].publishedAt)}
                                    </span>
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4 group-hover:text-[hsl(var(--accent-red))] transition-colors leading-tight">
                                    {filteredArticles[0].title}
                                </h2>
                                <p className="text-white/60 leading-relaxed mb-6 line-clamp-3">
                                    {filteredArticles[0].excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/40 text-sm flex items-center gap-1.5">
                                        <Clock size={14} /> {filteredArticles[0].readTime} min de lecture
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[hsl(var(--accent-red))] transition-colors">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Grid of remaining articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArticles.slice(1).map((article, idx) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                            <Link
                                to={`/blog/${article.slug}`}
                                className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all h-full"
                                data-cursor="LIRE"
                            >
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-2.5 py-0.5 bg-white/5 text-white/60 text-[11px] font-medium rounded-full border border-white/10">
                                            {article.category}
                                        </span>
                                        <span className="text-white/30 text-xs">{formatDate(article.publishedAt)}</span>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight mb-3 group-hover:text-[hsl(var(--accent-red))] transition-colors leading-snug">
                                        {article.title}
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <span className="text-white/30 text-xs flex items-center gap-1">
                                            <Clock size={12} /> {article.readTime} min
                                        </span>
                                        <span className="text-[hsl(var(--accent-red))] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            Lire <ArrowUpRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {filteredArticles.length === 0 && (
                    <div className="text-center py-20 text-white/40">
                        <p className="text-xl">Aucun article dans cette catégorie pour le moment.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
