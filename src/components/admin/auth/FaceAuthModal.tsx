import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import * as faceapi from '@vladmandic/face-api';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface FaceAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (imageUrl: string, logId?: string) => void;
    adminImage: string | null;
    userId: string;
}

export const FaceAuthModal: React.FC<FaceAuthModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    adminImage,
    userId
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "scanning" | "success" | "error">("loading");
    const [statusMessage, setStatusMessage] = useState("Initializing secure face detection...");
    const [isVideoReady, setIsVideoReady] = useState(false);

    // Initialize models and camera
    useEffect(() => {
        let stream: MediaStream | null = null;
        let mounted = true;

        const startCamera = async () => {
            if (!isOpen) return;

            try {
                // Load models
                setStatus("loading");
                setStatusMessage("Loading biometric models...");

                // Load models if not already loaded
                if (!faceapi.nets.ssdMobilenetv1.params) {
                    await Promise.all([
                        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                    ]);
                }

                if (!mounted) return;

                // Start video
                setStatusMessage("Accessing secure camera feed...");
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 } // Optimize for standard webcam
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for onLoadedMetadata to set isVideoReady
                }

            } catch (err) {
                console.error("Face auth init error:", err);
                setStatus("error");
                setStatusMessage("Camera access denied or model load failed. Check permissions.");
                toast.error("Failed to initialize face authentication system.");
            }
        };

        if (isOpen) {
            startCamera();
        } else {
            // Reset state when closed
            setIsVideoReady(false);
            setStatus("loading");
        }

        return () => {
            mounted = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const handleVideoReady = () => {
        setIsVideoReady(true);
        setStatus("ready");
        setStatusMessage("Position your face in the frame");
    };

    const handleVerify = async () => {
        if (!videoRef.current || !isVideoReady) {
            setStatus("error");
            setStatusMessage("Camera not ready. Please wait.");
            return;
        }

        if (!adminImage) {
            setStatus("error");
            setStatusMessage("No registered admin face found. Contact super admin.");
            return;
        }

        setStatus("scanning");
        setStatusMessage("Analyzing biometrics...");

        try {
            // DETECT FACE FROM WEBCAM
            const video = videoRef.current;

            // Ensure video has dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                throw new Error("Video dimensions zero");
            }

            const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

            if (!detections) {
                setStatus("ready");
                setStatusMessage("No face detected in camera view.");
                toast.warning("No face detected. Please look directly at the camera.");
                return;
            }

            // Capture image for audit log
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const currentImage = canvas.toDataURL('image/jpeg');

            // LOAD ADMIN IMAGE AND COMPARE
            let img: HTMLImageElement;
            try {
                // Try fetching with cors mode first
                const response = await fetch(adminImage, { mode: 'cors' });
                if (!response.ok) throw new Error("Failed to fetch admin image");
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                img = await faceapi.fetchImage(objectUrl);
            } catch (err) {
                console.warn("Failed to fetch image via CORS, trying direct load", err);
                // Fallback to direct load (might fail if canvas tainted, but faceapi handles some cases)
                img = await faceapi.fetchImage(adminImage);
            }

            const adminDetections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

            if (!adminDetections) {
                setStatus("error");
                setStatusMessage("Profile picture invalid: No face detected in stored avatar.");
                toast.error("Your profile picture must be a clear face photo.");
                return;
            }

            // Compare descriptors
            const distance = faceapi.euclideanDistance(detections.descriptor, adminDetections.descriptor);
            console.log("Face Match Distance (Lower is better):", distance);

            // Relaxed threshold for better UX (0.6 is standard)
            const threshold = 0.6;

            if (distance < threshold) {
                setStatus("success");
                setStatusMessage("Biometrics Verified. Access Granted.");
                toast.success("Identity confirmed.");

                // Upload captured image to logs
                const { data: uploadData } = await uploadLogImage(currentImage, userId);

                setTimeout(() => {
                    onSuccess(
                        uploadData?.publicUrl || currentImage,
                        uploadData?.logId
                    );
                }, 1000);
            } else {
                setStatus("error");
                const matchScore = Math.max(0, Math.round((1 - distance) * 100));
                setStatusMessage(`Access Denied: Face mismatch (${matchScore}% match)`);
                toast.error("Face does not match profile picture. Switching to ID Scanner...");

                // Log the failed attempt with the image
                await uploadLogImage(currentImage, userId, 'failed');

                // Auto-trigger ID Scanner fallback via parent's onClose
                setTimeout(() => {
                    onClose();
                }, 2000);
            }

        } catch (error) {
            console.error("Verification failed:", error);
            setStatus("error");
            setStatusMessage("Verification process failed. Please try again.");
            toast.error("An error occurred during verification.");
        }
    };

    // Helper to convert base64 to blob reliably
    const base64ToBlob = (base64: string, mimeType = "image/jpeg") => {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeType });
    };

    const uploadLogImage = async (base64Image: string, userId: string, status: 'success' | 'failed' = 'success') => {
        try {
            if (!userId) throw new Error("User ID missing for log upload");

            // Convert to blob manually
            const blob = base64ToBlob(base64Image);
            const fileName = `${userId}/${Date.now()}.jpg`;

            // Standard upload
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('admin_logs')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            let publicUrl = null;

            // Try to get public URL if upload succeeded
            if (!uploadError && uploadData) {
                const { data } = supabase.storage.from('admin_logs').getPublicUrl(fileName);
                publicUrl = data.publicUrl;
            } else {
                console.error("Log image upload failed (Storage Error):", uploadError);
                // FALLBACK: Store the base64 string directly so evidence is never lost.
                // This ensures "No img" does not happen even if Storage is down/blocked.
                publicUrl = base64Image;
            }

            // Insert log entry
            // If upload failed, we still log the attempt, but maybe without image URL if it failed
            const { data: dbData, error: dbError } = await supabase
                .from('admin_login_logs')
                .insert({
                    user_id: userId,
                    status: status,
                    captured_image_url: publicUrl, // Can be null if upload failed
                    login_time: new Date().toISOString(),
                })
                .select()
                .single();

            if (dbError) console.error("Log DB insert error:", dbError);

            return { data: { path: fileName, publicUrl, logId: dbData?.id }, error: null };
        } catch (e) {
            console.error("Upload exception:", e);
            return { data: null, error: e };
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-[#0A051A] border-primary/20 text-white backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display font-bold text-center flex items-center justify-center gap-2">
                        <Camera className="w-6 h-6 text-primary" />
                        Admin Verification
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Secure facial recognition required for access.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-4 space-y-4">
                    <div className="relative w-full aspect-video bg-black/50 rounded-xl overflow-hidden border-2 border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] group">
                        {status === "loading" && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onLoadedMetadata={handleVideoReady}
                            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isVideoReady ? "opacity-100" : "opacity-0"}`}
                        />

                        {/* Tech Face Frame Overlay */}
                        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-20">
                            <div className="flex justify-between">
                                <div className="w-16 h-16 border-l-4 border-t-4 border-primary/50 rounded-tl-3xl shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                                <div className="w-16 h-16 border-r-4 border-t-4 border-primary/50 rounded-tr-3xl shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                            </div>
                            <div className="flex justify-between">
                                <div className="w-16 h-16 border-l-4 border-b-4 border-primary/50 rounded-bl-3xl shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                                <div className="w-16 h-16 border-r-4 border-b-4 border-primary/50 rounded-br-3xl shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                            </div>
                        </div>

                        {/* Scanner Animation */}
                        {(status === "ready" || status === "scanning") && isVideoReady && (
                            <motion.div
                                initial={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "linear"
                                }}
                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(168,85,247,0.8)] z-20 opacity-80"
                            />
                        )}

                        {status === "scanning" && (
                            <div className="absolute inset-0 bg-primary/5 animate-pulse z-10" />
                        )}

                        {status === "success" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm z-30">
                                <CheckCircle2 className="w-16 h-16 text-green-500 drop-shadow-lg" />
                            </div>
                        )}

                        {status === "error" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm z-30">
                                <AlertTriangle className="w-16 h-16 text-red-500 drop-shadow-lg" />
                            </div>
                        )}
                    </div>

                    <div className="w-full text-center space-y-2">
                        <p className={`text-sm font-medium ${status === "error" ? "text-red-400" :
                            status === "success" ? "text-green-400" :
                                "text-primary"
                            } animate-pulse px-4 min-h-[1.25rem]`}>
                            {statusMessage}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 justify-end mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleVerify}
                        disabled={status !== "ready" && status !== "error"} // Allow retry on error
                        className="bg-gradient-primary hover:opacity-90 min-w-[120px]"
                    >
                        {status === "scanning" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {status === "error" ? "Retry" : "Verify Face"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
