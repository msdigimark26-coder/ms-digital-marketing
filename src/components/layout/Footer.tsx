import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight
} from "lucide-react";
import { Clock } from "@/components/ui/Clock";

const footerLinks = {
  services: [
    { name: "SEO & Content Marketing", path: "/services#seo" },
    { name: "Social Media Marketing", path: "/services#social" },
    { name: "PPC & Paid Advertising", path: "/services#ppc" },
    { name: "Web Design & Development", path: "/services#web" },
    { name: "Video & Photo Editing", path: "/services#media" },
    { name: "UI/UX Design", path: "/services#uiux" },
    { name: "3D Modeling", path: "/services#3d" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Testimonials", path: "/testimonials" },
    { name: "Careers", path: "/careers" },
    { name: "Contact", path: "/contact" },
    { name: "Payments", path: "/payments" },
    { name: "Admin Portal", path: "/admin" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/msdigimark26/?utm_source=ig_web_button_share_sheet", label: "Instagram" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/ms-digi-mark-7b45083a2/", label: "LinkedIn" },
];

export const Footer = () => {
  return (
    <footer className="relative bg-card border-t border-border/50 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-neon-blue/10 rounded-full blur-3xl" />

      {/* Large typographic watermark (decorative) */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden z-0">
        <span
          aria-hidden="true"
          className="block w-full text-left select-none font-display leading-none"
          style={{
            fontSize: 'clamp(80px, 22vw, 420px)',
            transform: 'translateY(18%)',
            color: 'rgba(255,255,255,0.06)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 0.85,
            whiteSpace: 'nowrap',
          }}
        >
          MS DIGI MARK
        </span>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-2xl font-bold text-gradient">
                MS DIGI MARK
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Transforming brands through innovative digital marketing strategies.
              We create experiences that captivate and convert.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg glass hover:border-primary/50 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-foreground">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-foreground">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-foreground">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:Msdigimark26@gmail.com"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="p-2 rounded-lg glass">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>Msdigimark26@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+916382422115"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="p-2 rounded-lg glass">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>+91 6382 422 115</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="p-2 rounded-lg glass">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>DURAIRAJ THEVAR STREET, Kochadai, Madurai - 625016</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center md:items-center gap-8 relative">
          <div className="flex flex-col md:flex-row gap-6 flex-1 items-center md:items-start text-center md:text-left">
            <p className="text-muted-foreground text-sm">
              © 2026 MS DIGI MARK. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          {/* Clock in bottom right on desktop, center on mobile */}
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <Clock />
          </div>
        </div>
      </div>
    </footer>
  );
};
