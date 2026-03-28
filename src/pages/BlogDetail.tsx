import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlog } from "@/contexts/BlogContext";
import { Calendar, User, ArrowLeft, Clock } from "lucide-react";

const BlogDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const { posts } = useBlog();
    const [post, setPost] = useState<any>(null);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);

    useEffect(() => {
        // Find post by slug or ID
        if (posts.length > 0 && slug) {
            const foundPost = posts.find(p => p.slug === slug || p.id === slug);
            setPost(foundPost);

            // Get recent posts (latest by date, exclude current post, limit to 5)
            if (foundPost) {
                const recent = posts
                    .filter(p =>
                        p.id !== foundPost.id && // Exclude current post
                        p.is_published // Only published posts
                    )
                    .sort((a, b) => {
                        // Sort by published_at date DESC (newest first)
                        const dateA = new Date(a.published_at).getTime();
                        const dateB = new Date(b.published_at).getTime();
                        return dateB - dateA;
                    })
                    .slice(0, 5); // Limit to 5 recent posts

                setRecentPosts(recent);
            }
        }
    }, [slug, posts]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!post && posts.length > 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="editorial-heading text-4xl mb-4">Post Not Found</h1>
                    <Link to="/blog" className="btn-primary">Back to Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 md:pt-28 pb-16">
                {post ? (
                    <div className="container mx-auto px-4 max-w-7xl">
                        {/* Back Button */}
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>

                        {/* 2-Column Layout: Content (Left) + Sidebar (Right) */}
                        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
                            {/* Main Content - Left Column */}
                            <article className="animate-fade-up">
                                {/* Header */}
                                <header className="mb-8">
                                    <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground flex-wrap">
                                        <span className="tracking-widest uppercase text-accent font-medium">
                                            {post.category}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(post.published_at)}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {post.author}
                                        </span>
                                    </div>

                                    <h1 className="editorial-heading text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
                                        {post.title}
                                    </h1>

                                    <p className="body-text text-lg text-muted-foreground leading-relaxed border-l-2 border-accent/50 pl-6 italic">
                                        {post.excerpt}
                                    </p>
                                </header>

                                {/* Featured Image & Gallery */}
                                {post.images && post.images.length > 0 && (
                                    <div className="mb-10 space-y-4">
                                        {/* Main Featured Image */}
                                        <div className="rounded-sm overflow-hidden aspect-video shadow-lg">
                                            <img
                                                src={post.images[0]}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder.png';
                                                }}
                                            />
                                        </div>

                                        {/* Additional Images Gallery */}
                                        {post.images.length > 1 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {post.images.slice(1).map((image: string, idx: number) => (
                                                    <div key={idx} className="rounded-sm overflow-hidden aspect-video">
                                                        <img
                                                            src={image}
                                                            alt={`${post.title} - Image ${idx + 2}`}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder.png';
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:font-light prose-p:leading-relaxed prose-a:text-accent prose-img:rounded-sm">
                                    {post.content.split('\n\n').map((paragraph: string, idx: number) => (
                                        <p key={idx} className="mb-6">{paragraph}</p>
                                    ))}
                                </div>
                            </article>

                            {/* Sidebar - Recent Posts - Right Column */}
                            <aside className="animate-fade-up lg:order-last order-first" style={{ animationDelay: '0.1s' }}>
                                <div className="lg:sticky lg:top-24">
                                    {/* Sidebar Header */}
                                    <div className="mb-6">
                                        <h2 className="editorial-heading text-2xl flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-accent" />
                                            Recent Posts
                                        </h2>
                                        <div className="h-0.5 w-12 bg-accent mt-2"></div>
                                    </div>

                                    {recentPosts.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentPosts.map((recentPost) => (
                                                <Link
                                                    key={recentPost.id}
                                                    to={`/blog/${recentPost.slug}`}
                                                    className="block group"
                                                >
                                                    <div className="flex gap-3 bg-card border border-border/30 rounded-sm p-3 hover:border-accent/50 hover:shadow-md transition-all duration-300">
                                                        {/* Thumbnail */}
                                                        <div className="flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden">
                                                            {recentPost.images && recentPost.images.length > 0 ? (
                                                                <img
                                                                    src={recentPost.images[0]}
                                                                    alt={recentPost.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = '/placeholder.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                    <span className="text-xs text-muted-foreground">No image</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors mb-1">
                                                                {recentPost.title}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{formatDate(recentPost.published_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-card border border-border/30 rounded-sm p-6 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                No recent posts available
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </aside>
                        </div>
                    </div>
                ) : (
                    // Loading state
                    <div className="container mx-auto px-4 py-20 text-center">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                            <div className="h-64 bg-muted rounded w-full mt-8"></div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogDetail;
