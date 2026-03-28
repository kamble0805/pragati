import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Plus, Upload, Save, Pencil } from "lucide-react";
import axios from "axios";

// --- Types ---
interface HeroSection { id?: number; title: string; subtitle: string; image_url: string; }
interface NavbarLink { id: number; name: string; href: string; display_order: number; }
interface Testimonial { id: number; quote: string; author: string; location: string; display_order: number; }
interface Principle { id: number; title: string; description: string; image_url: string; display_order: number; }
interface Philosophy { id?: number; title: string; content: string; image_url: string; }
interface BeforeAfter { id?: number; title: string; description: string; before_image: string; after_image: string; }
interface Category { id: number; name: string; display_order: number; }

// --- Components ---

const ImageUpload = ({ onUpload, currentImage }: { onUpload: (url: string) => void, currentImage?: string }) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('image', e.target.files[0]);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData);
            const url = `/assets/${res.data.filePath}`; // Assuming backend saves to 'uploads' served at /assets
            onUpload(url);
        } catch (error) {
            toast({ variant: "destructive", title: "Upload Failed" });
        }
    };

    return (
        <div className="flex gap-4 items-center">
            {currentImage && <img src={currentImage} className="w-20 h-20 object-cover rounded border" alt="Preview" />}
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} size="sm">
                <Upload className="w-4 h-4 mr-2" /> Upload Image
            </Button>
            <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={handleUpload} />
        </div>
    );
};

// --- Generic List Manager (Navbar, Categories, etc) ---
// Note: To save space, implementing specific editors below.

const HeroEditor = () => {
    const [data, setData] = useState<HeroSection>({ title: "", subtitle: "", image_url: "" });
    const { session } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/hero`).then(res => res.data && setData(res.data));
    }, []);

    const handleSave = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/hero`, data, { headers: { Authorization: `Bearer ${session?.token}` } });
            toast({ title: "Hero updated successfully" });
        } catch (e) { toast({ variant: "destructive", title: "Update failed" }); }
    };

    return (
        <div className="space-y-4 max-w-xl">
            <div><Label>Title</Label><Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Textarea value={data.subtitle} onChange={e => setData({ ...data, subtitle: e.target.value })} /></div>
            <div><Label>Image</Label><ImageUpload currentImage={data.image_url} onUpload={url => setData({ ...data, image_url: url })} /></div>
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
        </div>
    );
};

const NavBarEditor = () => {
    const [links, setLinks] = useState<NavbarLink[]>([]);
    const { session } = useAuth();
    const { toast } = useToast();
    const [newLink, setNewLink] = useState({ name: "", href: "", display_order: 0 });

    const fetchLinks = () => axios.get(`${import.meta.env.VITE_API_URL}/navbar`).then(res => setLinks(res.data));
    useEffect(() => { fetchLinks(); }, []);

    const addLink = async () => {
        await axios.post(`${import.meta.env.VITE_API_URL}/navbar`, newLink, { headers: { Authorization: `Bearer ${session?.token}` } });
        fetchLinks(); setNewLink({ name: "", href: "", display_order: 0 });
    };
    const deleteLink = async (id: number) => {
        if (!confirm("Delete link?")) return;
        await axios.delete(`${import.meta.env.VITE_API_URL}/navbar/${id}`, { headers: { Authorization: `Bearer ${session?.token}` } });
        fetchLinks();
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 items-end border p-4 rounded bg-slate-50 dark:bg-slate-900">
                <div><Label>Name</Label><Input value={newLink.name} onChange={e => setNewLink({ ...newLink, name: e.target.value })} placeholder="Home" /></div>
                <div><Label>Link (Href)</Label><Input value={newLink.href} onChange={e => setNewLink({ ...newLink, href: e.target.value })} placeholder="/" /></div>
                <div><Label>Order</Label><Input type="number" value={newLink.display_order} onChange={e => setNewLink({ ...newLink, display_order: parseInt(e.target.value) })} className="w-20" /></div>
                <Button onClick={addLink}><Plus className="w-4 h-4" /></Button>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Name</TableHead><TableHead>Href</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {links.map(l => (
                        <TableRow key={l.id}>
                            <TableCell>{l.display_order}</TableCell>
                            <TableCell>{l.name}</TableCell>
                            <TableCell>{l.href}</TableCell>
                            <TableCell><Button variant="ghost" size="sm" onClick={() => deleteLink(l.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const CategoriesEditor = () => {
    const [cats, setCats] = useState<Category[]>([]);
    const { session } = useAuth();
    const [newItem, setNewItem] = useState({ name: "", display_order: 0 });
    const fetch = () => axios.get(`${import.meta.env.VITE_API_URL}/categories`).then(res => setCats(res.data));
    useEffect(() => { fetch(); }, []);
    const add = async () => { await axios.post(`${import.meta.env.VITE_API_URL}/categories`, newItem, { headers: { Authorization: `Bearer ${session?.token}` } }); fetch(); setNewItem({ name: "", display_order: 0 }); };
    const del = async (id: number) => { if (confirm("Delete?")) { await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`, { headers: { Authorization: `Bearer ${session?.token}` } }); fetch(); } };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 items-end border p-4 rounded bg-slate-50 dark:bg-slate-900">
                <div><Label>Category Name</Label><Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
                <div><Label>Order</Label><Input type="number" value={newItem.display_order} onChange={e => setNewItem({ ...newItem, display_order: parseInt(e.target.value) })} className="w-20" /></div>
                <Button onClick={add}>Add</Button>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Name</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>{cats.map(c => <TableRow key={c.id}><TableCell>{c.display_order}</TableCell><TableCell>{c.name}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => del(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></TableCell></TableRow>)}</TableBody>
            </Table>
        </div>
    );
};

const PrinciplesEditor = () => {
    const [items, setItems] = useState<Principle[]>([]);
    const { session } = useAuth();
    const [newItem, setNewItem] = useState({ title: "", description: "", image_url: "", display_order: 0 });
    const fetch = () => axios.get(`${import.meta.env.VITE_API_URL}/principles`).then(res => setItems(res.data));
    useEffect(() => { fetch(); }, []);

    const add = async () => {
        await axios.post(`${import.meta.env.VITE_API_URL}/principles`, newItem, { headers: { Authorization: `Bearer ${session?.token}` } });
        fetch(); setNewItem({ title: "", description: "", image_url: "", display_order: 0 });
    };
    const del = async (id: number) => { if (confirm("Delete?")) { await axios.delete(`${import.meta.env.VITE_API_URL}/principles/${id}`, { headers: { Authorization: `Bearer ${session?.token}` } }); fetch(); } };

    return (
        <div className="space-y-6">
            <div className="border p-4 rounded bg-slate-50 dark:bg-slate-900 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div><Label>Title</Label><Input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} /></div>
                    <div><Label>Order</Label><Input type="number" value={newItem.display_order} onChange={e => setNewItem({ ...newItem, display_order: parseInt(e.target.value) })} /></div>
                </div>
                <div><Label>Description</Label><Textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} /></div>
                <div><Label>Image</Label><ImageUpload currentImage={newItem.image_url} onUpload={url => setNewItem({ ...newItem, image_url: url })} /></div>
                <Button onClick={add}>Add Principle</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {items.map(p => (
                    <div key={p.id} className="border p-4 rounded flex gap-4">
                        <img src={p.image_url} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                            <h4 className="font-bold">{p.title}</h4>
                            <p className="text-sm text-muted-foreground">{p.description}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => del(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TestimonialsEditor = () => {
    const [items, setItems] = useState<Testimonial[]>([]);
    const { session } = useAuth();
    const [newItem, setNewItem] = useState({ quote: "", author: "", location: "", display_order: 0 });
    const fetch = () => axios.get(`${import.meta.env.VITE_API_URL}/testimonials`).then(res => setItems(res.data));
    useEffect(() => { fetch(); }, []);
    const add = async () => { await axios.post(`${import.meta.env.VITE_API_URL}/testimonials`, newItem, { headers: { Authorization: `Bearer ${session?.token}` } }); fetch(); setNewItem({ quote: "", author: "", location: "", display_order: 0 }); };
    const del = async (id: number) => { if (confirm("Delete?")) { await axios.delete(`${import.meta.env.VITE_API_URL}/testimonials/${id}`, { headers: { Authorization: `Bearer ${session?.token}` } }); fetch(); } };

    return (
        <div className="space-y-6">
            <div className="border p-4 rounded bg-slate-50 dark:bg-slate-900 space-y-3">
                <div><Label>Quote</Label><Textarea value={newItem.quote} onChange={e => setNewItem({ ...newItem, quote: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-2">
                    <div><Label>Author</Label><Input value={newItem.author} onChange={e => setNewItem({ ...newItem, author: e.target.value })} /></div>
                    <div><Label>Location</Label><Input value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} /></div>
                    <div><Label>Order</Label><Input type="number" value={newItem.display_order} onChange={e => setNewItem({ ...newItem, display_order: parseInt(e.target.value) })} /></div>
                </div>
                <Button onClick={add}>Add Testimonial</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {items.map(t => (
                    <div key={t.id} className="border p-4 rounded">
                        <p className="italic">"{t.quote}"</p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-sm">- {t.author}, {t.location}</span>
                            <Button variant="ghost" size="sm" onClick={() => del(t.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const PhilosophyEditor = () => {
    const [data, setData] = useState<Philosophy>({ title: "", content: "", image_url: "" });
    const { session } = useAuth();
    const { toast } = useToast();
    useEffect(() => { axios.get(`${import.meta.env.VITE_API_URL}/philosophy`).then(res => res.data && setData(res.data)); }, []);
    const save = async () => { await axios.put(`${import.meta.env.VITE_API_URL}/philosophy`, data, { headers: { Authorization: `Bearer ${session?.token}` } }); toast({ title: "Updated" }); };

    return (
        <div className="space-y-4 max-w-xl">
            <div><Label>Title</Label><Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></div>
            <div><Label>Content (About Us)</Label><Textarea rows={6} value={data.content} onChange={e => setData({ ...data, content: e.target.value })} /></div>
            <div><Label>Image</Label><ImageUpload currentImage={data.image_url} onUpload={url => setData({ ...data, image_url: url })} /></div>
            <Button onClick={save}><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
    );
};

const BeforeAfterEditor = () => {
    const [data, setData] = useState<BeforeAfter>({ title: "", description: "", before_image: "", after_image: "" });
    const { session } = useAuth();
    const { toast } = useToast();
    useEffect(() => { axios.get(`${import.meta.env.VITE_API_URL}/before-after`).then(res => res.data && setData(res.data)); }, []);
    const save = async () => { await axios.put(`${import.meta.env.VITE_API_URL}/before-after`, data, { headers: { Authorization: `Bearer ${session?.token}` } }); toast({ title: "Updated" }); };

    return (
        <div className="space-y-4 max-w-xl">
            <div><Label>Title</Label><Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Before Image</Label><ImageUpload currentImage={data.before_image} onUpload={url => setData({ ...data, before_image: url })} /></div>
                <div><Label>After Image</Label><ImageUpload currentImage={data.after_image} onUpload={url => setData({ ...data, after_image: url })} /></div>
            </div>
            <Button onClick={save}><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
    );
};


// --- Main Component ---

const SiteManager = () => {
    return (
        <AdminLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Site Content Manager</h1>
                <Tabs defaultValue="hero">
                    <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
                        <TabsTrigger value="hero">Hero</TabsTrigger>
                        <TabsTrigger value="navbar">Navbar</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="principles">Principles</TabsTrigger>
                        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                        <TabsTrigger value="philosophy">Philosophy (About)</TabsTrigger>
                        <TabsTrigger value="beforeafter">Before/After</TabsTrigger>
                    </TabsList>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded border">
                        <TabsContent value="hero"><HeroEditor /></TabsContent>
                        <TabsContent value="navbar"><NavBarEditor /></TabsContent>
                        <TabsContent value="categories"><CategoriesEditor /></TabsContent>
                        <TabsContent value="principles"><PrinciplesEditor /></TabsContent>
                        <TabsContent value="testimonials"><TestimonialsEditor /></TabsContent>
                        <TabsContent value="philosophy"><PhilosophyEditor /></TabsContent>
                        <TabsContent value="beforeafter"><BeforeAfterEditor /></TabsContent>
                    </div>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default SiteManager;
