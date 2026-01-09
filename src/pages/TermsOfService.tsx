import { Layout } from "@/components/layout/Layout";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";
import { FileText, Briefcase, Users, Copyright, CreditCard, Cloud, AlertTriangle, Ban, RefreshCw, Scale } from "lucide-react";

const sections = [
  {
    icon: Briefcase,
    title: "Our Services",
    content: `MS Digital Marketing provides digital marketing–related services including, but not limited to, search engine optimization, social media marketing, paid advertising management, branding, creative design, website development, analytics, and consulting. All services are offered based on mutually agreed scope, timelines, deliverables, and pricing communicated through proposals, emails, messages, or written agreements. While we strive to deliver high-quality services and measurable improvements, results may vary due to market conditions, competition, platform algorithm changes, audience behavior, and the level of cooperation from the client. MS Digital Marketing does not guarantee specific outcomes such as rankings, leads, sales, or revenue unless explicitly stated in a written agreement.`,
  },
  {
    icon: Users,
    title: "Client Responsibilities",
    content: `Clients are responsible for providing accurate, complete, and timely information, including access credentials, content, approvals, and assets required to perform the agreed services. Any delay, inaccuracy, or failure to provide necessary inputs may affect project timelines and outcomes, and MS Digital Marketing shall not be held responsible for such delays or performance limitations. Clients are also responsible for ensuring that any materials provided do not infringe on third-party rights, copyrights, trademarks, or applicable laws.`,
  },
  {
    icon: Copyright,
    title: "Intellectual Property",
    content: `All intellectual property rights related to the website content, branding elements, designs, graphics, text, layouts, and proprietary materials belong to MS Digital Marketing unless otherwise agreed in writing. Unauthorized copying, reproduction, modification, redistribution, or commercial use of any content from this website is strictly prohibited. Upon full payment, clients may receive limited usage rights to deliverables created specifically for them, subject to the agreed terms.`,
  },
  {
    icon: CreditCard,
    title: "Payments and Refunds",
    content: `Payments for services must be made in accordance with the agreed payment schedule. Unless stated otherwise in writing, all payments are non-refundable once the service has commenced. Failure to complete payments on time may result in suspension or termination of services without prior notice. MS Digital Marketing reserves the right to revise pricing for future services or renewals with prior communication.`,
  },
  {
    icon: Cloud,
    title: "Third-Party Services",
    content: `MS Digital Marketing may use third-party tools, platforms, and services such as Google, Meta, hosting providers, analytics tools, or automation software to deliver services. We are not responsible for service disruptions, policy changes, account restrictions, data loss, or performance issues caused by third-party platforms, as they operate under their own terms and conditions. Clients agree to comply with the policies of all third-party platforms used in connection with our services.`,
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, MS Digital Marketing shall not be liable for any indirect, incidental, special, or consequential damages, including loss of revenue, profits, data, business opportunities, or reputation, arising from the use or inability to use our website or services. Our total liability, if any, shall not exceed the amount paid by the client for the specific service giving rise to the claim.`,
  },
  {
    icon: Ban,
    title: "Termination",
    content: `We reserve the right to suspend, restrict, or terminate access to our website or services at any time if we believe there has been misuse, violation of these Terms of Service, unlawful activity, or non-compliance with payment obligations. We also reserve the right to modify or discontinue any part of the website or services without prior notice.`,
  },
  {
    icon: RefreshCw,
    title: "Changes to Terms",
    content: `MS Digital Marketing may update or revise these Terms of Service at any time to reflect changes in legal requirements, business practices, or service offerings. Any updates will be posted on this page, and continued use of the website or services after such changes constitutes acceptance of the revised terms. It is your responsibility to review these Terms of Service periodically.`,
  },
  {
    icon: Scale,
    title: "Governing Law",
    content: `These Terms of Service shall be governed by and interpreted in accordance with the laws of India. Any disputes arising from the use of this website or services shall be subject to the exclusive jurisdiction of the courts located in India. If you have any questions, concerns, or clarifications regarding these Terms of Service, you are encouraged to contact MS Digital Marketing through official communication channels.`,
  },
];

const TermsOfService = () => {
  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block">LEGAL</span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Terms of Service</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              These Terms of Service govern your access to and use of the MS Digital Marketing website, products, and services.
            </p>
          </FadeUp>

          <FadeUp delay={0.2} className="glass-card p-8 mb-12 max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed">
              By visiting this website, submitting enquiries, signing up for services, or engaging with MS Digital Marketing in any form, you agree to comply with and be legally bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue the use of the website and services immediately.
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

export default TermsOfService;
