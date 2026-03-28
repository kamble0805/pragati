import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageCarousel from "@/components/ImageCarousel";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description: string;
  images: string[];
  badge?: string;
}

const DetailModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  images,
  badge,
}: DetailModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 bg-card border-border overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm
            hover:bg-background transition-colors duration-200"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>

        {/* Image Section */}
        {images && images.length > 0 && (
          <div className="relative">
            <ImageCarousel
              images={images}
              alt={title}
              aspectRatio="aspect-[16/10]"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 md:p-8">
          <DialogHeader className="text-left space-y-3 mb-4">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="editorial-heading text-2xl md:text-3xl text-foreground">
                {title}
              </DialogTitle>
              {badge && (
                <span className="text-xs tracking-widest uppercase text-muted-foreground/70 
                  bg-muted px-3 py-1 rounded-sm whitespace-nowrap">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-accent font-medium">{subtitle}</p>
            )}
          </DialogHeader>

          <div className="body-text text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailModal;
