import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, ShieldCheck, Zap, ArrowRight, CheckCircle2, Wallet, Building2, Smartphone, QrCode } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import qrCodeImage from "@/assets/payment-qr.jpeg";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import QRCode from "qrcode";
import { careersSupabase, isCareersSupabaseConfigured } from "@/integrations/supabase/careersClient";
import { Upload, Camera, FileText, Send } from "lucide-react";



const paymentMethods = [
    {
        id: "razorpay",
        name: "Razorpay",
        icon: Building2,
        description: "Pay via Credit/Debit Cards, Net Banking, or UPI",
        color: "from-blue-600 to-indigo-600",
    },
    {
        id: "paytm",
        name: "Paytm",
        icon: Smartphone,
        description: "Fast payments via Paytm Wallet or UPI",
        color: "from-sky-400 to-blue-500",
    },
    {
        id: "upi",
        name: "GPay / PhonePe / UPI",
        icon: Zap,
        description: "Scan and Pay instantly using any UPI app",
        color: "from-emerald-500 to-teal-600",
    },
    {
        id: "card",
        name: "Debit / Credit Card",
        icon: CreditCard,
        description: "Secure payment via Visa, Mastercard, or RuPay",
        color: "from-purple-600 to-pink-600",
    },
];

const Payments = () => {
    const [selectedMethod, setSelectedMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [dynamicQR, setDynamicQR] = useState<string | null>(null);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);

    // Evidence State
    const [payerName, setPayerName] = useState("");
    const [transactionIdInput, setTransactionIdInput] = useState("");
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
    const [paymentVerified, setPaymentVerified] = useState(false);




    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!selectedMethod) {
            toast.error("Please select a payment method");
            return;
        }

        setIsLoading(true);
        // Simulate payment process
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
            toast.success("Redirecting to secure gateway...");
        }, 2000);
    };

    const handleQRClick = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error("Please enter a valid amount first");
            return;
        }

        setIsGeneratingQR(true);
        try {
            const upiUrl = `upi://pay?pa=saisankeet@okhdfcbank&pn=M%20S%20SAISANKEET&am=${amount}&cu=INR`;
            const qrDataUrl = await QRCode.toDataURL(upiUrl, {
                width: 512,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            setDynamicQR(qrDataUrl);
            setIsQRModalOpen(true);
        } catch (err) {
            console.error("QR Generation Error:", err);
            toast.error("Failed to generate payment QR");
        } finally {
            setIsGeneratingQR(false);
        }
    };

    const handleEvidenceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!payerName || !transactionIdInput || !screenshotFile) {
            toast.error("Please fill all fields and upload payment screenshot");
            return;
        }

        if (!isCareersSupabaseConfigured) {
            toast.error("Payment system configuration error. Please try again later.");
            return;
        }

        setIsSubmittingEvidence(true);
        try {
            // 1. Upload Screenshot
            const fileExt = screenshotFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `payments/${fileName}`;

            const { error: uploadError, data: uploadData } = await careersSupabase.storage
                .from('payment_evidence')
                .upload(filePath, screenshotFile);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = careersSupabase.storage
                .from('payment_evidence')
                .getPublicUrl(filePath);

            // 3. Save to Database
            const { error: insertError } = await careersSupabase
                .from('payment_evidence')
                .insert({
                    payer_name: payerName,
                    amount: amount,
                    transaction_id: transactionIdInput,
                    screenshot_url: publicUrl,
                    status: 'Pending'
                });

            if (insertError) throw insertError;

            toast.success("Payment evidence submitted successfully!", {
                description: "Our team will verify your payment shortly."
            });
            setPaymentVerified(true);
            setStep(4); // Success step
        } catch (err: any) {
            console.error("Evidence Submission Error:", err);
            toast.error(err.message || "Failed to submit payment evidence");
        } finally {
            setIsSubmittingEvidence(false);
        }
    };




    return (
        <Layout>
            <section className="py-24 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />

                <div className="container mx-auto px-4">
                    <FadeUp className="text-center mb-16">
                        <span className="text-primary font-medium mb-4 block tracking-widest uppercase text-sm">Secure Checkout</span>
                        <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                            <span className="text-gradient">Quick Payments</span>
                        </h1>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                            Choose your preferred payment method and complete your transaction securely.
                        </p>
                    </FadeUp>

                    <div className="max-w-4xl mx-auto">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                                >
                                    {/* Left Side: Order Summary */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="glass-card p-8 border-primary/20 bg-primary/5">
                                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                                <Wallet className="h-5 w-5 text-primary" />
                                                Order Summary
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Service Fee</span>
                                                    <span className="font-medium text-white">Custom Quote</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Processing</span>
                                                    <span className="font-medium text-emerald-400">FREE</span>
                                                </div>
                                                <div className="h-px bg-white/10 my-4" />
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-lg font-bold">Total Amount</span>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                                        <Input
                                                            type="number"
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            placeholder="0.00"
                                                            className="pl-8 bg-black/40 border-white/10 focus:border-primary/50 text-xl font-bold w-32 h-12"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-4">
                                                <div className="flex gap-3">
                                                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                        Your transaction is protected by 256-bit SSL encryption. We never store your card details.
                                                    </p>
                                                </div>

                                                <Button
                                                    onClick={handleQRClick}
                                                    disabled={isGeneratingQR}
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full border-primary/30 hover:bg-primary/5 text-[10px] h-8 gap-2 uppercase tracking-widest font-bold"
                                                >
                                                    {isGeneratingQR ? (
                                                        <div className="w-3 h-3 border border-primary/20 border-t-primary rounded-full animate-spin" />
                                                    ) : (
                                                        <QrCode className="h-3 w-3" />
                                                    )}
                                                    {isGeneratingQR ? "Generating..." : "SCAN QR CODE"}
                                                </Button>


                                                <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
                                                    <DialogContent className="sm:max-w-md bg-[#0A051A]/95 border-primary/20 backdrop-blur-xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-center font-display text-xl">Official Payment QR</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                                            <div className="text-center mb-2">
                                                                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Amount to Pay</span>
                                                                <div className="text-2xl font-black text-primary">₹{amount}</div>
                                                            </div>
                                                            <div className="relative group p-4 bg-white rounded-2xl shadow-2xl shadow-primary/20">
                                                                {dynamicQR ? (
                                                                    <img
                                                                        src={dynamicQR}
                                                                        alt="Payment QR Code"
                                                                        className="w-64 h-64 object-contain rounded-lg transition-transform group-hover:scale-105"
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={qrCodeImage}
                                                                        alt="Fallback QR"
                                                                        className="w-64 h-64 object-contain rounded-lg opacity-50"
                                                                    />
                                                                )}
                                                                <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl pointer-events-none" />
                                                            </div>

                                                            <div className="text-center space-y-2">
                                                                <p className="text-sm font-medium text-white">Scan with any UPI app</p>
                                                                <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm, or BHIM</p>
                                                            </div>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsQRModalOpen(false);
                                                                    setStep(3);
                                                                }}
                                                                className="w-full bg-gradient-primary"
                                                            >
                                                                Done
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>


                                        </div>
                                    </div>

                                    {/* Right Side: Payment Methods */}
                                    <div className="lg:col-span-3">
                                        <form onSubmit={handlePayment} className="space-y-6">
                                            <StaggerContainer className="grid grid-cols-1 gap-4" staggerDelay={0.05}>
                                                {paymentMethods.map((method) => (
                                                    <StaggerItem key={method.id}>
                                                        <label
                                                            className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer group ${selectedMethod === method.id
                                                                ? `border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]`
                                                                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="paymentMethod"
                                                                className="hidden"
                                                                value={method.id}
                                                                onChange={(e) => setSelectedMethod(e.target.value)}
                                                            />
                                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${method.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                                                <method.icon className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{method.name}</h4>
                                                                <p className="text-xs text-muted-foreground">{method.description}</p>
                                                            </div>
                                                            {selectedMethod === method.id && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                                                </motion.div>
                                                            )}
                                                        </label>
                                                    </StaggerItem>
                                                ))}
                                            </StaggerContainer>

                                            <Button
                                                type="submit"
                                                disabled={isLoading || !amount || !selectedMethod}
                                                className="w-full h-14 bg-gradient-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 group relative overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {isLoading ? (
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            Proceed Securely
                                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </span>
                                                <motion.div
                                                    className="absolute inset-0 bg-white/10"
                                                    initial={{ x: "-100%" }}
                                                    whileHover={{ x: "100%" }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </Button>
                                        </form>
                                    </div>
                                </motion.div>
                            ) : step === 2 ? (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card p-12 text-center space-y-8 max-w-xl mx-auto border-emerald-500/20"
                                >
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-bold text-white">Ready for Payment</h2>
                                        <p className="text-muted-foreground">
                                            We are redirecting you to our secure {selectedMethod} gateway to complete the transaction of <span className="text-primary font-bold">₹{amount}</span>.
                                        </p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Transaction ID</span>
                                            <span className="font-mono text-white">#MSD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Mode</span>
                                            <span className="font-medium text-white uppercase">{selectedMethod}</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setStep(3)}
                                        className="w-full h-14 bg-gradient-primary text-white font-bold rounded-2xl shadow-xl gap-2"
                                    >
                                        I've Paid, Submit Proof
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        onClick={() => setStep(1)}
                                        variant="link"
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        Go Back & Edit
                                    </Button>
                                </motion.div>
                            ) : step === 3 ? (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-10 max-w-2xl mx-auto space-y-8"
                                >
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">Submit Payment Evidence</h2>
                                        <p className="text-muted-foreground">Please provide your details and upload the screenshot of your payment.</p>
                                    </div>

                                    <form onSubmit={handleEvidenceSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70 ml-1">Payer Name</label>
                                                <div className="relative">
                                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    <Input
                                                        value={payerName}
                                                        onChange={(e) => setPayerName(e.target.value)}
                                                        placeholder="Enter your full name"
                                                        className="pl-10 bg-white/5 border-white/10"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70 ml-1">UPI Transaction ID</label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                    <Input
                                                        value={transactionIdInput}
                                                        onChange={(e) => setTransactionIdInput(e.target.value)}
                                                        placeholder="12-digit UPI ID"
                                                        className="pl-10 bg-white/5 border-white/10"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70 ml-1">Payment Screenshot</label>
                                            <div
                                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${screenshotFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-primary/50 bg-white/5'}`}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const file = e.dataTransfer.files[0];
                                                    if (file && file.type.startsWith('image/')) setScreenshotFile(file);
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    id="screenshot-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files && setScreenshotFile(e.target.files[0])}
                                                />
                                                <label htmlFor="screenshot-upload" className="cursor-pointer space-y-4 block">
                                                    {screenshotFile ? (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="p-3 bg-emerald-500/20 rounded-full">
                                                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                            </div>
                                                            <div className="text-sm font-medium text-white">{screenshotFile.name}</div>
                                                            <p className="text-xs text-muted-foreground">Click to change screenshot</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="p-3 bg-primary/10 rounded-full">
                                                                <Camera className="h-6 w-6 text-primary" />
                                                            </div>
                                                            <div className="text-sm font-medium text-white">Upload Screenshot</div>
                                                            <p className="text-xs text-muted-foreground">Drag & drop or click to upload proof</p>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmittingEvidence || !screenshotFile || !payerName || !transactionIdInput}
                                            className="w-full h-14 bg-gradient-primary text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2"
                                        >
                                            {isSubmittingEvidence ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    Submitting Evidence...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    Submit Payment Proof
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card p-12 text-center space-y-8 max-w-xl mx-auto border-emerald-500/20"
                                >
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-bold text-white">Payment Received</h2>
                                        <p className="text-muted-foreground">
                                            Thank you, <span className="font-bold text-white">{payerName}</span>! Your payment evidence for <span className="text-primary font-bold">₹{amount}</span> has been submitted.
                                        </p>
                                        <p className="text-xs text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/10">
                                            Transition ID: <span className="font-mono text-emerald-400">{transactionIdInput}</span>
                                        </p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Our finance team will verify the transaction within 30-60 minutes. You will receive a confirmation message once verified.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setStep(1);
                                            setPayerName("");
                                            setTransactionIdInput("");
                                            setScreenshotFile(null);
                                            setAmount("");
                                            setSelectedMethod("");
                                        }}
                                        className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                                    >
                                        Make Another Payment
                                    </Button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Payments;
