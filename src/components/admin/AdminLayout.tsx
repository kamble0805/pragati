import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wrench,
  FolderOpen,
  Mail,
  FileText,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Shield,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Services",
      href: "/admin/services",
      icon: Wrench,
    },
    {
      label: "Portfolio",
      href: "/admin/portfolio",
      icon: FolderOpen,
    },
    {
      label: "Blog",
      href: "/admin/blog",
      icon: FileText,
    },
    {
      label: "Contact Submissions",
      href: "/admin/contacts",
      icon: Mail,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Shield, // I need to import Shield from lucide-react first
    },
    {
      label: "Site Content",
      href: "/admin/site-content",
      icon: LayoutTemplate,
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border/50 bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <span className="editorial-heading text-lg">Admin Panel</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border/50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div className="p-6 border-b border-border/50">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Site</span>
              </Link>
              <h1 className="editorial-heading text-xl">Pragati Admin</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-sm transition-colors",
                    isActive(item.href)
                      ? "bg-accent/20 text-foreground"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="body-text">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
              <div className="mb-3 px-4">
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'Admin'}
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh-0px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
