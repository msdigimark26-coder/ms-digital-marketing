import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidgets } from "@/components/chat/ChatWidgets";
import { MarqueeSection } from "@/components/home/MarqueeSection";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <MarqueeSection />
      <Footer />
      <ChatWidgets />
    </div>
  );
};
