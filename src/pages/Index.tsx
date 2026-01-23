import { Suspense, lazy } from "react";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";

// Lazy load non-critical sections
const ServicesSection = lazy(() => import("@/components/home/ServicesSection").then(m => ({ default: m.ServicesSection })));
const PortfolioSection = lazy(() => import("@/components/home/PortfolioSection").then(m => ({ default: m.PortfolioSection })));
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const WhyUsSection = lazy(() => import("@/components/home/WhyUsSection").then(m => ({ default: m.WhyUsSection })));
const CTASection = lazy(() => import("@/components/home/CTASection").then(m => ({ default: m.CTASection })));
const NotificationSection = lazy(() => import("@/components/home/NotificationSection").then(m => ({ default: m.NotificationSection })));
const BlogPreviewSection = lazy(() => import("@/components/home/BlogPreviewSection").then(m => ({ default: m.BlogPreviewSection })));
const CertificationsSection = lazy(() => import("@/components/home/CertificationsSection").then(m => ({ default: m.CertificationsSection })));
import { Button } from "@/components/ui/button";

const BookQuickCallButton = () => (
  <div className="fixed bottom-4 left-4">
    <Button
      className="bg-gradient-primary text-white hover:opacity-90 transition-opacity shadow-lg"
      onClick={() => window.open('https://topmate.io/ms_digimark/1868704', '_blank')}
    >
      Book 1:1 Quick Call
    </Button>
  </div>
);

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
        <ServicesSection />
        <PortfolioSection />
        <CertificationsSection />
        <TestimonialsSection />
        <WhyUsSection />
        <BlogPreviewSection />
        <CTASection />
        <NotificationSection />
      </Suspense>
      <BookQuickCallButton />
    </Layout>
  );
};

export default Index;
