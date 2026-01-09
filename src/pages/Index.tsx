import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { CTASection } from "@/components/home/CTASection";
import { NotificationSection } from "@/components/home/NotificationSection";
import { Button } from '@/components/ui/button';

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
      <ServicesSection />
      <PortfolioSection />
      <TestimonialsSection />
      <WhyUsSection />
      <CTASection />
      <NotificationSection />
      <BookQuickCallButton />
    </Layout>
  );
};

export default Index;
