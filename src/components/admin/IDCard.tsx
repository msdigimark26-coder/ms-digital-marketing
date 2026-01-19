import { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Shield, RefreshCw, X, Check, PanelRightClose, Camera, QrCode } from "lucide-react";
import { toast } from "sonner";
import { toPng } from 'html-to-image';
import bwipjs from 'bwip-js';

interface IDCardProps {
    user: {
        id: string;
        username: string;
        full_name?: string;
        email: string;
        role: string;
        avatar_url?: string;
        employee_id?: string;
        department?: string;
        id_card_status?: string;
        id_card_issued_at?: string;
        biometric_enabled?: boolean;
    };
    onClose?: () => void;
    onReissue?: () => void;
}

const BarcodeCanvas = ({ value }: { value: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            try {
                bwipjs.toCanvas(canvasRef.current, {
                    bcid: 'code128',       // Barcode type
                    text: value,          // Text to encode
                    scale: 3,             // 3x scaling factor
                    height: 10,           // Bar height, in millimeters
                    includetext: false,   // Don't show text below barcode as we do it manually
                    textxalign: 'center', // Always good to set
                    barcolor: '000000',   // Black bars
                });
            } catch (e) {
                console.error('Barcode generation error:', e);
            }
        }
    }, [value]);

    return (
        <div className="bg-white rounded-lg p-2.5 w-[90%] flex flex-col items-center gap-1.5 shadow-sm border border-slate-200">
            <canvas ref={canvasRef} className="max-w-full h-12" />
            <div className="text-[11px] font-black text-black tracking-[0.3em] font-mono leading-none">{value}</div>
        </div>
    );
};

export const IDCard = ({ user, onClose, onReissue }: IDCardProps) => {
    const [qrUrl, setQrUrl] = useState<string>("");
    const cardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (user.employee_id) {
            QRCode.toDataURL(user.employee_id, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#1E3A8A',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'H'
            }).then(url => setQrUrl(url));
        }
    }, [user.employee_id]);

    const handleDownloadPNG = async () => {
        if (!cardRef.current) return;

        setIsExporting(true);
        toast.info("Preparing ID Card image...");

        try {
            // Wait a tiny bit for any remaining styles to settle
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 3, // High quality
                backgroundColor: '#ffffff',
            });

            const link = document.createElement('a');
            link.download = `MSDM_ID_${user.employee_id || user.username}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("ID Card downloaded successfully!");
        } catch (err) {
            console.error('Export error:', err);
            toast.error("Failed to export ID Card image.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative group">
            <motion.div
                ref={cardRef}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="w-[320px] h-[520px] bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col items-center relative"
            >
                {/* Lanyard Slot at the top */}
                <div className="absolute top-4 w-14 h-4 bg-slate-100 rounded-full border border-slate-200 z-30 flex items-center justify-center overflow-hidden">
                    <div className="w-10 h-1.5 bg-slate-200 rounded-full"></div>
                </div>

                {/* Top Header Section (Premium Gradient) */}
                <div className="w-full h-[24%] bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#1D4ED8] flex flex-col items-center justify-center pt-8 relative shrink-0">
                    <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                    <div className="flex items-center gap-2.5 z-10 transition-transform group-hover:scale-105 duration-500">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-white font-black text-2xl tracking-tighter drop-shadow-sm">MS</span>
                            <div className="w-5 h-5 text-white animate-pulse">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            </div>
                            <span className="text-white font-extrabold text-2xl tracking-tight ml-1 drop-shadow-sm">DIGIMARK</span>
                        </div>
                    </div>
                    <div className="text-[7px] text-blue-200 font-black tracking-[0.5em] uppercase z-10 opacity-60 -mt-0.5">Global Identification Protocol</div>
                </div>

                {/* Middle Content Section */}
                <div className="w-full flex-1 flex flex-col items-center pt-5 bg-white shrink-0 relative">
                    {/* Holographic accent line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-[3px] border-slate-50 shadow-xl bg-slate-50 transition-all duration-500 group-hover:shadow-2xl group-hover:border-blue-50">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                    <Shield className="w-16 h-16 opacity-20" />
                                </div>
                            )}
                        </div>
                        {/* Status ring */}
                        <div className="absolute -inset-1 rounded-[2rem] border-2 border-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                    </div>

                    <div className="mt-4 flex flex-col items-center">
                        <h2 className="text-xl font-black text-[#1E3A8A] tracking-tight text-center px-4 leading-tight">{user.full_name || user.username}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-blue-600 font-extrabold text-[11px] uppercase tracking-wider">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Details Section (Solid Pro Blue) */}
                <div className="w-full h-[41%] bg-[#1E3A8A] relative flex flex-col items-center pt-4 overflow-hidden shrink-0">
                    {/* Glass lighting effect */}
                    <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white/10 to-transparent"></div>

                    <div className="w-full px-10 space-y-0.5 z-10">
                        {[
                            { label: 'EMPLOYEE ID', value: user.employee_id || 'ID0345' },
                            { label: 'DEPARTMENT', value: user.department || 'Management' },
                            { label: 'ISSUE DATE', value: user.id_card_issued_at ? new Date(user.id_card_issued_at).toLocaleDateString() : '01/19/2026' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-2 -mx-2">
                                <span className="text-[8px] font-black text-blue-200/50 tracking-widest font-sans uppercase">{item.label}</span>
                                <span className="text-[11px] font-bold text-white tracking-wide font-sans">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto w-full flex flex-col items-center pb-6 z-10 gap-1">
                        <BarcodeCanvas value={user.employee_id || 'ID0345'} />
                    </div>

                    {/* Pro Mesh Background */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-[60px]"></div>
                </div>
            </motion.div>

            {/* Micro-Interaction QR Area */}
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 hidden md:flex">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileHover={{ scale: 1.1 }}
                    className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 relative group/qr"
                >
                    <div className="relative">
                        {qrUrl ? (
                            <img src={qrUrl} alt="QR Code" className="w-16 h-16 rounded-lg" />
                        ) : (
                            <div className="w-16 h-16 bg-slate-50 animate-pulse rounded-lg" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover/qr:opacity-100 transition-opacity rounded-lg">
                            <QrCode className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1E3A8A] text-white text-[10px] font-bold rounded-full whitespace-nowrap hidden group-hover/qr:block">
                        Scan for Instant Verification
                    </div>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownloadPNG}
                    disabled={isExporting}
                    className="w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                >
                    {isExporting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                </motion.button>
            </div>

            {/* Mobile Actions Panel */}
            <div className="mt-8 flex gap-3 justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 md:hidden">
                <button
                    onClick={handleDownloadPNG}
                    disabled={isExporting}
                    className="flex-1 max-w-[200px] h-12 bg-[#1E3A8A] hover:bg-blue-800 rounded-2xl text-white shadow-xl transition-all flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-widest px-6"
                >
                    {isExporting ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Camera className="h-4 w-4" />
                            Save as PNG
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export const IDCardSidebar = ({ isOpen, user, onClose, onReissue }: { isOpen: boolean, user: any, onClose: () => void, onReissue?: () => void }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 250 }}
                        className="fixed top-0 right-0 h-full w-[440px] bg-[#0A0612] border-l border-white/5 z-[70] shadow-2xl p-10 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight leading-none">Security Node</h3>
                                    <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-black tracking-[0.3em]">Identity Protocol v4.0</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white group">
                                <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center pb-12">
                            <IDCard user={user} onReissue={onReissue} />

                            <div className="mt-14 w-full grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white/[0.03] border border-white/5 rounded-[2rem] flex flex-col gap-3 group hover:bg-white/[0.05] transition-colors">
                                    <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                        <Check className="text-green-500 h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-white uppercase tracking-wider">Access Token</div>
                                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mt-1">Verified by Mainframe</div>
                                    </div>
                                </div>

                                <div className="p-5 bg-white/[0.03] border border-white/5 rounded-[2rem] flex flex-col gap-3 group hover:bg-white/[0.05] transition-colors">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <Shield className="text-blue-500 h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-white uppercase tracking-wider">Biometric</div>
                                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mt-1">
                                            {user.biometric_enabled ? 'Ready for scan' : 'Token Fallback Active'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em]">MS DIGIMARK • GLOBAL</div>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
export const IDCardModal = ({ isOpen, user, onClose }: { isOpen: boolean, user: any, onClose: () => void }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Darker, deeper blur overlay for focus */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Centered Card with unique pop animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10"
                    >
                        {/* Close button for manual dismissal */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/10 hover:rotate-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <IDCard user={user} />

                        {/* Countdown indicator for the 15s auto-hide */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 15, ease: "linear" }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Auto-securing in 15s</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
