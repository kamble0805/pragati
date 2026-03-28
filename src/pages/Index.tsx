import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ReactMarkdown from "react-markdown";
import ValuePrinciples from "@/components/ValuePrinciples";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

// Import images
import heroImage from "@/assets/hero-interior.jpg";
import beforeImage from "@/assets/before-renovation.jpg";
import afterImage from "@/assets/after-renovation.jpg";

const Index = () => {
  const [heroData, setHeroData] = useState<any>(null);
  const [beforeAfterData, setBeforeAfterData] = useState<any>(null);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/hero`)
      .then(res => res.json())
      .then(data => setHeroData(data))
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_URL}/before-after`)
      .then(res => res.json())
      .then(data => setBeforeAfterData(data))
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_URL}/portfolio?limit=3`)
      .then(res => res.json())
      .then(data => {
        const baseUrl = new URL(import.meta.env.VITE_API_URL).origin;
        const fixedData = data.map((project: any) => {
          const fixedImages = Array.isArray(project.images)
            ? project.images.map((img: string) => {
              if (img.startsWith('http')) return img;
              const cleanImg = img.startsWith('/') ? img.slice(1) : img;
              if (cleanImg.startsWith('assets/')) return `${baseUrl}/${cleanImg}`;
              return `${baseUrl}/assets/${cleanImg}`;
            })
            : [];
          return { ...project, images: fixedImages };
        });
        setFeaturedProjects(fixedData);
      })
      .catch(err => console.error("Failed to fetch featured projects:", err));

    fetch(`${import.meta.env.VITE_API_URL}/services?limit=3`)
      .then(res => res.json())
      .then(data => {
        const baseUrl = new URL(import.meta.env.VITE_API_URL).origin;
        const fixedData = data.map((service: any) => {
          let fixedImages: string[] = [];

          // 1. Try to parse 'images' column
          if (service.images) {
            try {
              const parsed = typeof service.images === 'string' ? JSON.parse(service.images) : service.images;
              if (Array.isArray(parsed)) {
                fixedImages = parsed;
              }
            } catch (e) { }
          }

          // 2. Fallback to image_url if no images found
          if (fixedImages.length === 0 && service.image_url) {
            fixedImages = [service.image_url];
          }

          // 3. Fix paths
          const processedImages = fixedImages.map((img: string) => {
            if (img.startsWith('http')) return img;
            const cleanImg = img.startsWith('/') ? img.slice(1) : img;
            if (cleanImg.startsWith('assets/')) return `${baseUrl}/${cleanImg}`;
            return `${baseUrl}/assets/${cleanImg}`;
          });

          return { ...service, images: processedImages };
        });
        setFeaturedServices(fixedData);
      })
      .catch(err => console.error("Failed to fetch featured services:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero heroImage={heroData ? `/assets/${heroData.image_url}` : heroImage} />
      <ValuePrinciples />

      {/* Featured Services Preview */}
      <section className="section-padding bg-secondary/30">
        <div className="container-editorial">
          <div className="mb-12">
            <h2 className="editorial-heading text-3xl md:text-4xl mb-4">Our Services</h2>
            <p className="body-text text-muted-foreground max-w-xl">
              Comprehensive interior design services tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {featuredServices.map((service) => (
              <div key={service.id} className="bg-card border border-border/50 p-6 md:p-8 rounded-sm hover:-translate-y-1 transition-transform duration-300">
                <h3 className="editorial-heading text-xl mb-3">{service.title}</h3>
                <div className="body-text text-muted-foreground text-sm line-clamp-3 mb-4 prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                  <ReactMarkdown>{service.description}</ReactMarkdown>
                </div>
                {service.images && service.images.length > 0 && (
                  <div className="aspect-video w-full overflow-hidden mb-4 rounded-sm">
                    <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <a href="/services" className="btn-primary min-w-[200px] text-center">
              View All Services
            </a>
          </div>
        </div>
      </section>

      {/* Featured Portfolio Preview */}
      <section className="section-padding">
        <div className="container-editorial">
          <div className="mb-12">
            <h2 className="editorial-heading text-3xl md:text-4xl mb-4">Selected Works</h2>
            <p className="body-text text-muted-foreground max-w-xl">
              Highlights from our recent design projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {featuredProjects.map((project) => (
              <a key={project.id} href="/portfolio" className="group block">
                <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-muted">
                  {project.images && project.images.length > 0 ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <h3 className="editorial-heading text-lg mb-1 group-hover:text-accent transition-colors">{project.title}</h3>
                <p className="body-text text-xs tracking-widest uppercase text-muted-foreground">{project.category}</p>
              </a>
            ))}
          </div>

          <div className="flex justify-center">
            <a href="/portfolio" className="btn-outline min-w-[200px] text-center">
              View All Projects
            </a>
          </div>
        </div>
      </section>

      <BeforeAfterSlider
        beforeImage={beforeAfterData ? `/assets/${beforeAfterData.before_image}` : beforeImage}
        afterImage={beforeAfterData ? `/assets/${beforeAfterData.after_image}` : afterImage}
      />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Index;
