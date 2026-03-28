import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { ContactSubmissionsProvider } from "@/contexts/ContactSubmissionsContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/admin/PrivateRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import ServicesPage from "./pages/ServicesPage";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import NotFound from "./pages/NotFound";

// Admin pages
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Signup";
import Dashboard from "./pages/admin/Dashboard";
import ServicesManager from "./pages/admin/ServicesManager";
import PortfolioManager from "./pages/admin/PortfolioManager";
import ContactSubmissions from "./pages/admin/ContactSubmissions";
import BlogManager from "./pages/admin/BlogManager";
import AdminManager from "./pages/admin/AdminManager";
import SiteManager from "./pages/admin/SiteManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <AuthProvider>
          <ServicesProvider>
            <PortfolioProvider>
              <ContactSubmissionsProvider>
                <BlogProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogDetail />} />

                      {/* Admin routes */}
                      <Route path="/admin/signup" element={<Signup />} />
                      <Route path="/admin/login" element={<Login />} />
                      <Route
                        path="/admin/dashboard"
                        element={
                          <PrivateRoute requireAdmin>
                            <Dashboard />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/admin/services"
                        element={
                          <PrivateRoute requireAdmin>
                            <ServicesManager />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/admin/portfolio"
                        element={
                          <PrivateRoute requireAdmin>
                            <PortfolioManager />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/admin/contacts"
                        element={
                          <PrivateRoute requireAdmin>
                            <ContactSubmissions />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/admin/blog"
                        element={
                          <PrivateRoute requireAdmin>
                            <BlogManager />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <PrivateRoute requireAdmin>
                            <AdminManager />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/admin/site-content"
                        element={
                          <PrivateRoute requireAdmin>
                            <SiteManager />
                          </PrivateRoute>
                        }
                      />
                      {/* Redirect old /admin to new dashboard */}
                      <Route
                        path="/admin"
                        element={
                          <PrivateRoute requireAdmin>
                            <Dashboard />
                          </PrivateRoute>
                        }
                      />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </BlogProvider>
              </ContactSubmissionsProvider>
            </PortfolioProvider>
          </ServicesProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
