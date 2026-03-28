import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, EyeOff, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useServices } from "@/contexts/ServicesContext";

const ServicesManager = () => {
  const { services, addService, updateService, deleteService, toggleServiceVisibility } = useServices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    images: [] as string[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const formData = new FormData();
        formData.append('image', file);

        // Show preview immediately using FileReader
        const reader = new FileReader();
        reader.onloadend = () => {
          // We don't rely only on base64 anymore for main state
          // But valid for quick preview
        };
        reader.readAsDataURL(file);

        // Upload to backend
        fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          body: formData
        })
          .then(res => {
            if (!res.ok) throw new Error("Upload failed");
            return res.json();
          })
          .then(data => {
            // Backend returns { filePath: 'filename.jpg' }
            // We construct full URL for preview and storing in image array
            // The ServicesContext will handle stripping '/assets/' when sending to DB if needed
            // But actually, consistent relative path stored in DB is better.
            const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/assets/${data.filePath}`;

            setImagePreviews(prev => [...prev, imageUrl]);

            // We store the FULL URL for visual consistency in frontend
            // Context/Backend should handle strictly relative path if required
            // For now, let's store the relative path expected by ServiceContext logic: 
            // The context does: .replace('/assets/', '') -> so we give it /assets/filename.jpg
            const assetPath = `/assets/${data.filePath}`;
            setNewService(prev => ({
              ...prev,
              images: [...prev.images, assetPath]
            }));
          })
          .catch(err => {
            console.error("Image upload failed", err);
            toast({
              title: "Upload Error",
              description: "Failed to upload image.",
              variant: "destructive"
            });
          });
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewService((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddService = () => {
    if (!newService.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a service title.",
        variant: "destructive",
      });
      return;
    }

    if (!newService.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a service description.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateService(editingId, {
        title: newService.title,
        description: newService.description,
        images: newService.images,
      });
      toast({
        title: "Success",
        description: "Service updated successfully.",
      });
    } else {
      addService({
        title: newService.title,
        description: newService.description,
        images: newService.images.length > 0 ? newService.images : ["/placeholder.svg"],
        image_url: "", // Handled by context transformation
        is_active: true,
      });
      toast({
        title: "Success",
        description: "Service added successfully.",
      });
    }

    handleDialogChange(false);
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleToggle = (id: string, currentState: boolean) => {
    toggleServiceVisibility(id);
    toast({
      title: "Success",
      description: `Service ${currentState ? "hidden" : "activated"} successfully.`,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteService(id);
      toast({
        title: "Success",
        description: "Service deleted successfully.",
      });
    }
  };

  const handleOpenEdit = (service: any) => {
    setNewService({
      title: service.title,
      description: service.description,
      images: service.images || [],
    });
    setImagePreviews(service.images || []);
    setEditingId(service.id);
    setIsDialogOpen(true);
  };

  // Reset dialog state when closed
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewService({ title: "", description: "", images: [] });
      setImagePreviews([]);
      setEditingId(null);
    }
  };


  return (
    <AdminLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="editorial-heading text-2xl md:text-3xl mb-2">
              Services Manager
            </h1>
            <p className="body-text text-muted-foreground">
              Manage service visibility on your website.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="editorial-heading">{editingId ? "Edit Service" : "Add New Service"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Interior Consultation"
                    value={newService.title}
                    onChange={(e) =>
                      setNewService((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this service..."
                    value={newService.description}
                    onChange={(e) =>
                      setNewService((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Images (Multiple allowed)</Label>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-sm"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-foreground/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload images
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <Button onClick={handleAddService} className="w-full">
                  {editingId ? "Save Changes" : "Add Service"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {services.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <p className="body-text text-muted-foreground">
                No services found. Add your first service.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`border-border/50 transition-all ${service.is_active
                  ? "border-l-4 border-l-accent"
                  : "opacity-60"
                  }`}
              >
                <CardContent className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {service.images && service.images.length > 0 && (
                        <div className="flex gap-1 flex-shrink-0">
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-16 h-16 object-cover rounded-sm"
                          />
                          {service.images.length > 1 && (
                            <span className="text-xs text-muted-foreground self-end">
                              +{service.images.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="editorial-heading text-lg">
                            {service.title}
                          </h3>
                          {service.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-sm">
                              <Eye className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-sm">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="body-text text-muted-foreground text-sm">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={service.is_active}
                      onCheckedChange={() => handleToggle(service.id, service.is_active)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(service)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-card border border-border/50 rounded-sm">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Only active services are displayed on the public
            Services page. Toggle the switch to show or hide a service.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ServicesManager;
