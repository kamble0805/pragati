import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, UserPlus, Shield } from "lucide-react";
import axios from "axios";

interface AdminUser {
    id: number;
    email: string;
    created_at: string;
}

const AdminManager = () => {
    const { session } = useAuth();
    const token = session?.token;
    const { toast } = useToast();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Fetch Admins
    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(response.data);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAdmins();
        }
    }, [token]);

    // Add Admin
    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newPassword) return;

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                { email: newEmail, password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: "Success",
                description: "New admin added successfully.",
            });

            setNewEmail("");
            setNewPassword("");
            setIsAdding(false);
            fetchAdmins();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.error || "Failed to add admin",
            });
        }
    };

    // Delete Admin
    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this admin? This cannot be undone.")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/auth/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: "Deleted",
                description: "Admin user removed.",
            });

            fetchAdmins();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete admin.",
            });
        }
    };

    return (
        <AdminLayout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Shield className="h-8 w-8 text-primary" />
                            Admin Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage system administrators and their access.
                        </p>
                    </div>
                    <Button onClick={() => setIsAdding(!isAdding)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isAdding ? "Cancel" : "Add New Admin"}
                    </Button>
                </div>

                {isAdding && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border mb-8 max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Add New Administrator</h2>
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="admin@pragati.com"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Create Admin</Button>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">Loading admins...</TableCell>
                                </TableRow>
                            ) : admins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">No admins found.</TableCell>
                                </TableRow>
                            ) : (
                                admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell>{admin.id}</TableCell>
                                        <TableCell className="font-medium">{admin.email}</TableCell>
                                        <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(admin.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminManager;
