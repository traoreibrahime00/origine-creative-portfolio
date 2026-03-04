import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Clock, Calendar, User } from 'lucide-react';
import articles from '../data/blog.json';

// Simple markdown-to-JSX renderer for blog content
function renderMarkdown(md: string) {
    const lines = md.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // H2
        if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4 tracking-tight">{line.slice(3)}</h2>);
        }
        // H3
        else if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-xl md:text-2xl font-bold text-white mt-10 mb-3 tracking-tight">{line.slice(4)}</h3>);
        }
        // Blockquote
        else if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={i} className="border-l-2 border-[hsl(var(--accent-red))] pl-6 py-2 my-6 text-lg font-display italic text-white/80">
                    {line.slice(2)}
                </blockquote>
            );
        }
        // Ordered list
        else if (/^\d+\.\s/.test(line)) {
            const listItems: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                listItems.push(lines[i].replace(/^\d+\.\s/, ''));
                i++;
            }
            elements.push(
                <ol key={`ol-${i}`} className="space-y-3 my-6 pl-6">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-white/70 leading-relaxed flex gap-3">
                            <span className="text-[hsl(var(--accent-red))] font-bold shrink-0">{idx + 1}.</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                        </li>
                    ))}
                </ol>
            );
            continue;
        }
        // Unordered list
        else if (line.startsWith('- ')) {
            const listItems: string[] = [];
            while (i < lines.length && lines[i].startsWith('- ')) {
                listItems.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <ul key={`ul-${i}`} className="space-y-2 my-6 pl-6">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-white/70 leading-relaxed flex gap-3">
                            <span className="text-[hsl(var(--accent-red))] mt-2 shrink-0">•</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                        </li>
                    ))}
                </ul>
            );
            continue;
        }
        // Empty line
        else if (line.trim() === '') {
            // skip
        }
        // Paragraph
        else {
            elements.push(
                <p key={i} className="text-white/70 leading-relaxed my-4 text-lg" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
            );
        }
        i++;
    }

    return elements;
}

// Format inline markdown: bold, italic, links
function formatInline(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[hsl(var(--accent-red))] hover:underline font-medium">$1</a>');
}

export function BlogArticle() {
    const { slug } = useParams<{ slug: string }>();
    const article = articles.find(a => a.slug === slug);

    if (!article) {
        return <Navigate to="/blog" replace />;
    }

    const relatedArticles = articles.filter(a => a.id !== article.id).slice(0, 2);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-7 md:px-12 lg:px-20">

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                    {/* Back link */}
                    <Link to="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                        <ArrowLeft size={16} /> Retour au blog
                    </Link>

                    {/* Category + Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="px-3 py-1 bg-[hsl(var(--accent-red))]/10 text-[hsl(var(--accent-red))] text-xs font-medium rounded-full border border-[hsl(var(--accent-red))]/20">
                            {article.category}
                        </span>
                        <span className="text-white/40 text-sm flex items-center gap-1.5">
                            <Calendar size={14} /> {formatDate(article.publishedAt)}
                        </span>
                        <span className="text-white/40 text-sm flex items-center gap-1.5">
                            <Clock size={14} /> {article.readTime} min de lecture
                        </span>
                        <span className="text-white/40 text-sm flex items-center gap-1.5">
                            <User size={14} /> {article.author}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-8">
                        {article.title}
                    </h1>

                    {/* Cover Image */}
                    <div className="rounded-2xl overflow-hidden mb-12 aspect-[16/9]">
                        <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Article Content */}
                    <article className="prose-custom">
                        {renderMarkdown(article.content)}
                    </article>

                    {/* CTA */}
                    <div className="mt-16 p-8 md:p-12 bg-white/5 border border-white/10 rounded-[2rem] text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                            Un projet en tête ?
                        </h3>
                        <p className="text-white/60 mb-8 max-w-lg mx-auto">
                            Discutons de comment transformer votre vision en un avantage concurrentiel.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-3 bg-[hsl(var(--accent-red))] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_hsl(var(--accent-red)/0.5)] hover:scale-105 transition-all"
                        >
                            Nous contacter
                            <div className="bg-white text-[hsl(var(--accent-red))] w-8 h-8 rounded-full flex items-center justify-center">
                                <ArrowUpRight size={18} />
                            </div>
                        </Link>
                    </div>

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
                        <div className="mt-20">
                            <h3 className="text-xl font-bold mb-8 tracking-tight">Articles connexes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {relatedArticles.map(a => (
                                    <Link
                                        key={a.id}
                                        to={`/blog/${a.slug}`}
                                        className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden">
                                            <img src={a.coverImage} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        </div>
                                        <div className="p-5">
                                            <span className="text-[11px] text-white/40 uppercase tracking-widest">{a.category}</span>
                                            <h4 className="text-base font-bold mt-1 group-hover:text-[hsl(var(--accent-red))] transition-colors leading-snug">
                                                {a.title}
                                            </h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>
        </main>
    );
}
