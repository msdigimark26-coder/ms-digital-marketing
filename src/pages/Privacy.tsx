import { Layout } from "@/components/layout/Layout";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";
import { Shield, Eye, Cookie, Lock, Share2, Link2, UserCheck, RefreshCw } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: `When you visit our website, we may collect personal information such as your name, email address, phone number, company name, and any other details you voluntarily provide through contact forms, enquiry forms, onboarding forms, or communication channels such as email, WhatsApp, or live chat. In addition to personal information, we may automatically collect certain non-personal data including IP address, browser type, device information, operating system, pages visited, time spent on the site, and referring URLs. This information helps us understand user behavior and improve website performance, content relevance, and overall user experience.`,
  },
  {
    icon: Shield,
    title: "How We Use Your Information",
    content: `The information collected by MS Digital Marketing is used primarily to respond to enquiries, provide requested services, manage client relationships, communicate updates, deliver project-related information, and improve our marketing strategies. We may also use collected data for internal analytics, website optimization, service enhancement, and marketing performance evaluation. From time to time, we may send promotional or informational communication related to our services; however, users always have the option to opt out of such communications.`,
  },
  {
    icon: Cookie,
    title: "Cookies and Tracking",
    content: `Our website may use cookies and similar tracking technologies to enhance functionality, analyze traffic, and personalize user experience. Cookies help us remember user preferences, track engagement, and improve site navigation. You can choose to disable cookies through your browser settings; however, doing so may limit certain features or functionality of the website.`,
  },
  {
    icon: Lock,
    title: "Data Security",
    content: `MS Digital Marketing takes reasonable technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use secure servers, restricted access controls, and standard security protocols to safeguard stored data. While we make every effort to protect your information, no method of online transmission or electronic storage is completely secure, and we cannot guarantee absolute data security.`,
  },
  {
    icon: Share2,
    title: "Information Sharing",
    content: `We do not sell, rent, or trade your personal information to third parties. Your data may be shared only with trusted service providers who assist us in operating our website, conducting business, or delivering services, provided they agree to keep this information confidential. We may also disclose information when required by law, legal process, or governmental authority, or to protect our rights, property, or safety.`,
  },
  {
    icon: Link2,
    title: "Third-Party Links",
    content: `Our website may contain links to third-party websites, tools, or platforms for additional resources or services. MS Digital Marketing is not responsible for the privacy practices, content, or security of such external websites. Users are encouraged to review the privacy policies of third-party sites before sharing any personal information.`,
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    content: `Users have the right to access, update, correct, or request deletion of their personal information held by us, subject to legal and contractual obligations. Requests regarding personal data may be submitted through our official contact channels, and we will respond within a reasonable timeframe.`,
  },
  {
    icon: RefreshCw,
    title: "Policy Updates",
    content: `MS Digital Marketing reserves the right to update or modify this Privacy Policy at any time to reflect changes in legal requirements, business practices, or technological advancements. Any updates will be posted on this page, and continued use of the website after such changes constitutes acceptance of the revised policy. If you have any questions or concerns regarding this Privacy Policy or how your information is handled, you are encouraged to contact us directly.`,
  },
];

const Privacy = () => {
  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block">LEGAL</span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Privacy Policy</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              MS Digital Marketing is committed to protecting the privacy and personal information of every visitor, client, and user who accesses our website or uses our services.
            </p>
          </FadeUp>

          <FadeUp delay={0.2} className="glass-card p-8 mb-12 max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy explains how we collect, use, store, and safeguard your information when you interact with our website, communicate with us, or engage our digital marketing services. By accessing this website, you agree to the terms outlined in this policy and consent to the collection and use of information in accordance with these practices.
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

export default Privacy;
