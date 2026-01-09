import { Layout } from "@/components/layout/Layout";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";
import { FileCheck, Copyright, Target, Users, CreditCard, AlertTriangle, Settings, Scale } from "lucide-react";

const sections = [
  {
    icon: Copyright,
    title: "Intellectual Property",
    content: `All content available on this website, including but not limited to text, graphics, logos, images, videos, designs, layouts, and code, is the intellectual property of MS Digital Marketing and is protected under applicable copyright and intellectual property laws. Unauthorized reproduction, distribution, modification, or use of any content without prior written permission is strictly prohibited.`,
  },
  {
    icon: Target,
    title: "Service Delivery",
    content: `MS Digital Marketing provides digital marketing services based on mutually agreed project scope, timelines, deliverables, and pricing. While we strive to achieve optimal results for every client, outcomes may vary depending on market conditions, competition, platform algorithms, industry trends, and client cooperation. We do not guarantee specific rankings, traffic volumes, sales figures, or business outcomes unless explicitly stated in writing.`,
  },
  {
    icon: Users,
    title: "Client Responsibilities",
    content: `Clients are responsible for providing accurate information, necessary content, approvals, access credentials, and materials required for the execution of services. Delays in providing required inputs or approvals may affect project timelines and performance. MS Digital Marketing shall not be held responsible for delays or performance issues caused by incomplete or delayed client communication.`,
  },
  {
    icon: CreditCard,
    title: "Payment Terms",
    content: `All payments must be made in accordance with the agreed pricing terms and schedules. Unless otherwise stated in a written agreement, payments for services are non-refundable once work has commenced. Failure to make timely payments may result in suspension or termination of services without prior notice.`,
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: `MS Digital Marketing shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our website or services. This includes, but is not limited to, loss of data, revenue, business opportunities, or reputation. We are also not responsible for issues arising from third-party platforms, tools, or services such as Google, Meta, hosting providers, or analytics platforms, as these operate under their own policies and terms.`,
  },
  {
    icon: Settings,
    title: "Modifications and Termination",
    content: `We reserve the right to modify, suspend, or terminate access to our website or services at any time in cases of misuse, violation of these terms, non-payment, or unlawful activity. MS Digital Marketing also reserves the right to update these Terms and Conditions at its discretion. Any changes will be effective immediately upon posting on the website, and continued use of the website constitutes acceptance of the updated terms.`,
  },
  {
    icon: Scale,
    title: "Governing Law",
    content: `These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes arising from the use of this website or services shall be subject to the jurisdiction of Indian courts. If you have any questions regarding these Terms and Conditions, you are encouraged to contact MS Digital Marketing through official communication channels.`,
  },
];

const TermsConditions = () => {
  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block">LEGAL</span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Terms & Conditions</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              These Terms and Conditions govern your use of the MS Digital Marketing website and services.
            </p>
          </FadeUp>

          <FadeUp delay={0.2} className="glass-card p-8 mb-12 max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed">
              By accessing this website, engaging our services, or communicating with us, you agree to be bound by these terms. If you do not agree with any part of these Terms and Conditions, you should discontinue use of the website and services immediately.
            </p>
          </FadeUp>

          <StaggerContainer className="max-w-4xl mx-auto space-y-8" staggerDelay={0.1}>
            {sections.map((section, index) => (
              <StaggerItem key={index}>
                <div className="glass-card p-8 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold mb-4">{section.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </Layout>
  );
};

export default TermsConditions;
