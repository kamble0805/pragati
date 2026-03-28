import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Passwords do not match.",
            });
            return;
        }

        setIsLoading(true);

        const { error } = await signUp(email, password);

        if (error) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message || "Could not create admin account.",
            });
        } else {
            toast({
                title: "Success",
                description: "Account created! Please login.",
            });
            navigate("/admin/login");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col bg-zinc-900 text-white p-10 justify-between">
                <div>
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Site
                    </Link>
                </div>
                <div>
                    <h1 className="editorial-heading text-4xl mb-4">Pragati Admin</h1>
                    <p className="body-text text-zinc-400 max-w-sm">
                        Create the first admin account to manage the studio's portfolio, services, and content.
                    </p>
                </div>
                <div className="text-zinc-500 text-sm">
                    © 2024 Pragati Interior Studio
                </div>
            </div>

            <div className="flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="editorial-heading text-2xl font-bold">First Time Setup</h2>
                        <p className="text-muted-foreground mt-2">
                            Create your admin account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white dark:bg-zinc-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white dark:bg-zinc-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmpassword">Confirm Password</Label>
                            <Input
                                id="confirmpassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-white dark:bg-zinc-900"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Create Account
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <Link to="/admin/login" className="text-primary hover:underline">
                            Already have an account? Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
