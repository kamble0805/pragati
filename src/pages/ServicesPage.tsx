import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useServices, Service } from "@/contexts/ServicesContext";
import ImageCarousel from "@/components/ImageCarousel";
import DetailModal from "@/components/DetailModal";
import ReactMarkdown from "react-markdown";

const ServicesPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { getActiveServices } = useServices();

  const services = getActiveServices();

  // Intersection observer for animations
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <section ref={sectionRef} className="section-padding">
          <div className="container-editorial">
            <div className={`mb-12 md:mb-16 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
              <h1 className="editorial-heading text-4xl md:text-5xl lg:text-6xl mb-6">
                Our Services
              </h1>
              <p className="body-text text-muted-foreground max-w-2xl">
                From concept to completion, we offer comprehensive interior design services
                tailored to bring your vision to life with precision and artistry.
              </p>
            </div>

            {/* Services Grid */}
            {services.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`group relative rounded-sm cursor-pointer overflow-hidden
                      bg-card border border-border/30
                      transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                      hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10
                      hover:border-foreground/20
                      ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 100 + 200}ms` }}
                  >
                    {/* Service Image Carousel */}
                    {service.images && service.images.length > 0 && (
                      <div className="relative">
                        <ImageCarousel
                          images={service.images}
                          alt={service.title}
                          aspectRatio="aspect-[4/3]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}

                    <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 
                      transition-opacity duration-[400ms] pointer-events-none
                      bg-gradient-to-b from-foreground/[0.02] to-transparent" />

                    <div className="relative z-10 p-8 md:p-10">
                      <h3 className="editorial-heading text-xl md:text-2xl mb-4 text-foreground
                        transition-all duration-300 ease-out
                        group-hover:translate-y-[-2px] group-hover:scale-[1.02] origin-left">
                        {service.title}
                      </h3>
                      <div className="body-text text-muted-foreground text-sm leading-relaxed line-clamp-2 prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                        <ReactMarkdown>{service.description}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-8 right-8 h-px 
                      bg-gradient-to-r from-transparent via-accent/50 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="body-text text-muted-foreground">No services available at the moment.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Detail Modal */}
      <DetailModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.title || ""}
        description={selectedService?.description || ""}
        images={selectedService?.images || []}
      />
    </div>
  );
};

export default ServicesPage;
