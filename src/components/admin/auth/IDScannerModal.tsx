import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Shield, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface IDScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userData: any) => void;
    userId?: string;
}

export const IDScannerModal: React.FC<IDScannerModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    userId
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "scanning" | "success" | "error">("loading");
    const [statusMessage, setStatusMessage] = useState("Initializing identity scanner...");
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = async (mode: "user" | "environment") => {
        if (!isOpen) return;

        try {
            // Stop any existing tracks
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            setStatus("loading");
            setStatusMessage(`Accessing ${mode === 'user' ? 'Front' : 'Back'} Camera...`);

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: 1280, height: 720 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                setStream(newStream);
            }
        } catch (err) {
            console.error("Camera error:", err);
            setStatus("error");
            setStatusMessage("Camera access denied or device not found.");
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera(facingMode);
        } else {
            // Cleanup when closing
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            setIsVideoReady(false);
            setStatus("loading");
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const toggleCamera = () => {
        const newMode = facingMode === "user" ? "environment" : "user";
        setFacingMode(newMode);
        startCamera(newMode);
    };

    const handleVideoReady = () => {
        setIsVideoReady(true);
        setStatus("ready");
        setStatusMessage("Align the ID Card barcode in the frame");
    };

    // Function to stop the camera stream
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log("Camera track stopped:", track.label);
            });
            setStream(null);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
        }
    };

    const startScanning = () => {
        setStatus("scanning");
        setStatusMessage("Scanning Secure Barcode...");

        // Simulated scanning loop
        setTimeout(async () => {
            try {
                if (!userId) {
                    setStatus("error");
                    setStatusMessage("Scanner Error: No user ID provided.");
                    return;
                }

                const { data, error } = await supabase
                    .from("portal_users")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (data && !error) {
                    if (data.id_card_status !== 'Active') {
                        setStatus("error");
                        setStatusMessage(`ACCESS DENIED: ID is ${data.id_card_status}`);
                        return;
                    }

                    setStatus("success");
                    setStatusMessage("Identity Verified Successfully.");
                    toast.success("ID Token Validated.");

                    // STOP THE CAMERA IMMEDIATELY
                    stopCamera();

                    setTimeout(() => {
                        onSuccess(data);
                    }, 1000);
                } else {
                    setStatus("error");
                    setStatusMessage("Invalid ID: Database lookup failed.");
                }
            } catch (err) {
                setStatus("error");
                setStatusMessage("Network error during verification.");
            }
        }, 2500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                stopCamera();
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-md bg-[#070412] border-blue-500/30 text-white backdrop-blur-2xl px-6 py-8">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-center flex items-center justify-center gap-3 tracking-tight">
                        <QrCode className="w-8 h-8 text-blue-500" />
                        ID PROTOCOL SCAN
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-500 font-medium mt-2">
                        Scan the secure barcode on your MS DIGIMARK identity card.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-full aspect-[4/3] bg-black/40 rounded-[2rem] overflow-hidden border-2 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] group">
                        {status === "loading" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#070412]/80 backdrop-blur-md">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                <span className="text-xs font-black text-blue-400 tracking-widest animate-pulse">BOOTING SCANNER...</span>
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            onLoadedMetadata={handleVideoReady}
                            className={`w-full h-full object-cover transition-opacity duration-700 ${isVideoReady ? "opacity-100" : "opacity-0"}`}
                        />

                        {/* tech frame */}
                        <div className="absolute inset-0 z-20 pointer-events-none p-10">
                            <div className="w-full h-full border border-blue-500/20 rounded-2xl relative">
                                <div className="absolute -top-1 -left-1 w-12 h-12 border-l-4 border-t-4 border-blue-500 rounded-tl-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                <div className="absolute -top-1 -right-1 w-12 h-12 border-r-4 border-t-4 border-blue-500 rounded-tr-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-l-4 border-b-4 border-blue-500 rounded-bl-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-r-4 border-b-4 border-blue-500 rounded-br-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/10"></div>
                                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-blue-500/10"></div>
                            </div>
                        </div>

                        {/* Scanner Beam */}
                        {(status === "scanning" || status === "ready") && isVideoReady && (
                            <motion.div
                                animate={{ top: ["15%", "85%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                className="absolute left-[10%] right-[10%] h-[2px] bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,1),0_0_40px_rgba(59,130,246,0.4)] z-30"
                            />
                        )}

                        {status === "success" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-md z-40 transition-all duration-500">
                                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                    <CheckCircle2 className="w-14 h-14 text-white" />
                                </div>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-md z-40 transition-all duration-500">
                                <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                    <AlertTriangle className="w-14 h-14 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Camera Switch Floating Button */}
                        {isVideoReady && status !== "success" && (
                            <button
                                onClick={toggleCamera}
                                className="absolute bottom-6 right-6 z-40 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl transition-all shadow-xl"
                            >
                                <RefreshCw className="w-5 h-5 text-white" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className={`text-sm font-black tracking-widest uppercase text-center ${status === 'error' ? 'text-red-400' :
                            status === 'success' ? 'text-green-400' :
                                'text-blue-400'
                            }`}>
                            {statusMessage}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full mb-1 ${isVideoReady ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_10px_rgba(34,197,94,0.5)]`}></div>
                                <span className="text-[8px] text-slate-500 font-bold uppercase">CAM</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full mb-1 ${status === 'scanning' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                <span className="text-[8px] text-slate-500 font-bold uppercase">SENSOR</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full mb-1 ${userId ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-[8px] text-slate-500 font-bold uppercase">SEC-KEY</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center mt-10">
                    <Button
                        variant="outline"
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="bg-transparent border-white/10 hover:bg-white/5 text-slate-400 rounded-2xl h-14 px-8 font-black uppercase tracking-tighter"
                    >
                        Abort
                    </Button>
                    <Button
                        onClick={startScanning}
                        disabled={status === 'scanning' || status === 'success' || !isVideoReady}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-14 px-12 uppercase tracking-tight shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
                    >
                        {status === 'scanning' && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                        {status === 'error' ? 'Retry Session' : 'Identify Admin'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

