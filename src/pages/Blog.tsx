import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBlog } from "@/contexts/BlogContext";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const sectionRef = useRef<HTMLDivElement>(null);

  const { getPublishedPosts, categories } = useBlog();
  const posts = getPublishedPosts();

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 md:pt-28">
        <section ref={sectionRef} className="section-padding">
          <div className="container-editorial">
            <div className={`mb-12 md:mb-16 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
              <h1 className="editorial-heading text-4xl md:text-5xl lg:text-6xl mb-6">
                Our Blog
              </h1>
              <p className="body-text text-muted-foreground max-w-2xl">
                Insights, inspiration, and expertise from our design studio.
                Explore ideas that shape beautiful living spaces.
              </p>
            </div>

            {/* Category Filter */}
            <div
              className={`flex flex-wrap gap-3 mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: '100ms' }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 text-sm tracking-widest uppercase transition-all duration-300
                    ${activeCategory === category
                      ? 'bg-foreground text-background'
                      : 'bg-transparent border border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Blog Posts Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug || post.id}`}
                    className={`group cursor-pointer block ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 100 + 200}ms` }}
                  >
                    <article>
                      {/* Post Image or Placeholder */}
                      <div className="relative overflow-hidden mb-5 aspect-[16/10] bg-card border border-border/30 rounded-sm">
                        {post.images && post.images.length > 0 ? (
                          <img
                            src={post.images[0]}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-muted">
                            <span className="text-6xl text-muted-foreground/20 font-serif">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
                      </div>

                      {/* Category & Date */}
                      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                        <span className="tracking-widest uppercase text-accent">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="editorial-heading text-xl md:text-2xl mb-3 group-hover:text-accent transition-colors duration-300">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="body-text text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Read More */}
                      <span className="inline-flex items-center gap-2 text-sm text-foreground group-hover:text-accent transition-colors duration-300">
                        Read More
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="body-text text-muted-foreground">
                  No blog posts available in this category.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
