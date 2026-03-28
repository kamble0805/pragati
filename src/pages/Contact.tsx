import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields.",
                variant: "destructive"
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contact-submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            const data = await response.json();
            console.log('✅ Contact form submitted:', data);

            toast({
                title: "Success!",
                description: "Your message has been sent. We'll get back to you soon!",
            });

            // Reset form
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });

        } catch (error) {
            console.error('❌ Error submitting contact form:', error);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20 pb-16">
                {/* Hero Section */}
                <section className="container-editorial py-12 md:py-20">
                    <div className="max-w-3xl mx-auto text-center animate-fade-up">
                        <h1 className="editorial-heading text-4xl md:text-5xl lg:text-6xl mb-6">
                            Let's Create Something Beautiful
                        </h1>
                        <p className="body-text text-lg md:text-xl text-muted-foreground">
                            Have a project in mind? We'd love to hear from you. Fill out the form below and we'll get back to you within 24 hours.
                        </p>
                    </div>
                </section>

                {/* Contact Form & Info */}
                <section id="contact-form" className="container-editorial py-12">
                    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* Contact Information */}
                        <div className="space-y-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <div>
                                <h2 className="editorial-heading text-3xl mb-6">Get in Touch</h2>
                                <p className="body-text text-muted-foreground mb-8">
                                    Whether you're looking to transform your home or create a stunning commercial space, we're here to help bring your vision to life.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-sm bg-accent/10 text-accent">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">Email</h3>
                                        <p className="text-muted-foreground">info@pragatidesign.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-sm bg-accent/10 text-accent">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">Phone</h3>
                                        <p className="text-muted-foreground">+91 (123) 456-7890</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-sm bg-accent/10 text-accent">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">Location</h3>
                                        <p className="text-muted-foreground">Mumbai, Maharashtra, India</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border/30">
                                <h3 className="font-medium mb-4">Office Hours</h3>
                                <div className="space-y-2 text-muted-foreground">
                                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                                    <p>Sunday: Closed</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border/30 rounded-sm p-8">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-background border border-border/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-background border border-border/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-background border border-border/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                        placeholder="Briefly describe the purpose of your status"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-background border border-border/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
                                        placeholder="Please provide details about your project, requirements, or any questions you may have..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-muted-foreground text-center">
                                    * All fields are required
                                </p>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
