import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useContentProtection } from "./hooks/useContentProtection";
import Admin from "./pages/Admin";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import CEO from "./pages/CEO";
import Payments from "./pages/Payments";
import Privacy from "./pages/Privacy";
import TermsOfService from "./pages/TermsOfService";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import WebDesign from "./pages/services/WebDesign";
import SEOServices from "./pages/services/SEOServices";
import MetaAds from "./pages/services/MetaAds";
import GoogleAds from "./pages/services/GoogleAds";
import VideoPhotoEditing from "./pages/services/VideoPhotoEditing";
import ThreeDModeling from "./pages/services/ThreeDModeling";

const queryClient = new QueryClient();

// Content Protection Wrapper - must be inside BrowserRouter
const ProtectedRoutes = () => {
  useContentProtection();

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/web-design" element={<WebDesign />} />
        <Route path="/services/seo-services" element={<SEOServices />} />
        <Route path="/services/meta-ads" element={<MetaAds />} />
        <Route path="/services/google-ads" element={<GoogleAds />} />
        <Route path="/services/video-photo-editing" element={<VideoPhotoEditing />} />
        <Route path="/services/3d-modeling" element={<ThreeDModeling />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/ceo" element={<CEO />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CustomCursor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProtectedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
