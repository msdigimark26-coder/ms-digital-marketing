import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Smartphone, CreditCard, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Payments() {
  const [copied, setCopied] = useState(false);
  const upiId = "saisankeet@okhdfcbank";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { icon: Shield, text: "SSL Encrypted" },
    { icon: CheckCircle, text: "Instant Verification" },
    { icon: Smartphone, text: "All UPI Apps" }
  ];

  return (
    <Layout>
      <section className="min-h-screen relative overflow-hidden bg-background pt-24 pb-16">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

            {/* Left Side - Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm font-medium mb-6 w-fit"
              >
                <CreditCard className="w-4 h-4" />
                Secure Payment Gateway
              </motion.div>

              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
                MS DIGIMARK <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Payment
                </span>
              </h1>

              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Quick and secure UPI payments. Scan the QR code or use the UPI ID to complete your transaction instantly.
              </p>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <Shield className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm font-medium">
                  All transactions are encrypted and secure with 256-bit SSL
                </span>
              </div>
            </motion.div>

            {/* Right Side - Payment Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              <div className="relative">
                {/* Card */}
                <div className="relative bg-[#0F0A1F] border border-white/10 rounded-2xl p-8 shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 mb-4">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 font-bold text-sm uppercase tracking-wider">Payment Portal</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">MS DIGIMARK PAY</h2>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dsaisankeet%40okhdfcbank%26pn%3DMS%2520Digital%2520Marketing%26cu%3DINR"
                        alt="UPI QR Code"
                        className="w-56 h-56 rounded-lg"
                      />
                      {/* Corner Accents */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-purple-500 rounded-tl"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-500 rounded-tr"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-purple-500 rounded-bl"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-purple-500 rounded-br"></div>
                    </div>
                  </div>

                  {/* UPI ID */}
                  <div className="mb-6">
                    <p className="text-center text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">UPI ID</p>
                    <div className="flex items-center justify-center gap-2 p-3 bg-black/20 border border-white/5 rounded-lg">
                      <code className="text-purple-300 font-mono text-sm">{upiId}</code>
                      <button
                        onClick={copyToClipboard}
                        className="p-1.5 hover:bg-white/5 rounded transition-colors"
                        title="Copy UPI ID"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-center mb-6">
                    <p className="text-white font-semibold text-lg mb-2">Scan with any UPI app</p>
                    <p className="text-slate-400 text-sm">Google Pay • PhonePe • Paytm • BHIM</p>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-white/5">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-slate-400">256-bit SSL Encrypted • 100% Secure</span>
                  </div>
                </div>
              </div>

              {/* Support Text */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Need help? Contact us at{" "}
                <a href="mailto:msdigimark26@gmail.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  msdigimark26@gmail.com
                </a>
              </p>
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
