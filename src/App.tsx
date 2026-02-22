import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Preloader } from "@/components/ui/Preloader";
import { Suspense, lazy } from "react";
import { ReelPopup } from "@/components/home/ReelPopup";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Contact = lazy(() => import("./pages/Contact"));
const CEO = lazy(() => import("./pages/CEO"));
const Payments = lazy(() => import("./pages/Payments"));
const Privacy = lazy(() => import("./pages/Privacy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const Careers = lazy(() => import("./pages/Careers"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const WebDesign = lazy(() => import("./pages/services/WebDesign"));
const SEOServices = lazy(() => import("./pages/services/SEOServices"));
const MetaAds = lazy(() => import("./pages/services/MetaAds"));
const GoogleAds = lazy(() => import("./pages/services/GoogleAds"));
const VideoPhotoEditing = lazy(() => import("./pages/services/VideoPhotoEditing"));
const ThreeDModeling = lazy(() => import("./pages/services/ThreeDModeling"));
const SocialMediaMarketing = lazy(() => import("./pages/services/SocialMediaMarketing"));
const PPCPaidAdvertising = lazy(() => import("./pages/services/PPCPaidAdvertising"));
const UIUXDesign = lazy(() => import("./pages/services/UIUXDesign"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="fixed inset-0 bg-[#0A051A] flex items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ScrollProgress />
      <CustomCursor />
      <Preloader />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/web-design" element={<WebDesign />} />
                <Route path="/services/seo-services" element={<SEOServices />} />
                <Route path="/services/meta-ads" element={<MetaAds />} />
                <Route path="/services/google-ads" element={<GoogleAds />} />
                <Route path="/services/video-photo-editing" element={<VideoPhotoEditing />} />
                <Route path="/services/3d-modeling" element={<ThreeDModeling />} />
                <Route path="/services/social-media-marketing" element={<SocialMediaMarketing />} />
                <Route path="/services/ppc-paid-advertising" element={<PPCPaidAdvertising />} />
                <Route path="/services/uiux-design" element={<UIUXDesign />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/careers/:id" element={<JobDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/ceo" element={<CEO />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <ReelPopup />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
