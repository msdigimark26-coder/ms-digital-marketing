import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, Clock, Search,
    Filter, Loader2, Download, ExternalLink, Plus, X, Save,
    User, Briefcase, Calendar, CheckCircle2, AlertCircle, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { careersSupabase } from "@/integrations/supabase/careersClient";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

interface Payment {
    id: string;
    client_name: string;
    amount: string | number;
    service: string;
    payment_date: string;
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
}

interface PaymentProof {
    id: string;
    payer_name: string;
    amount: string;
    transaction_id: string;
    screenshot_url: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    created_at: string;
}

export const PaymentsSection = () => {
    const [viewMode, setViewMode] = useState<'ledger' | 'proofs'>('ledger');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [proofs, setProofs] = useState<PaymentProof[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProofs, setLoadingProofs] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        client_name: "",
        amount: "",
        service: "",
        status: "completed" as const,
        payment_date: new Date().toISOString().split('T')[0]
    });

    const fetchPayments = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProofs = useCallback(async () => {
        setLoadingProofs(true);
        try {
            const { data, error } = await careersSupabase
                .from('payment_evidence')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setProofs(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load payment proofs");
        } finally {
            setLoadingProofs(false);
        }
    }, []);

    useEffect(() => {
        if (viewMode === 'ledger') {
            fetchPayments();
        } else {
            fetchProofs();
        }
    }, [viewMode, fetchPayments, fetchProofs]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.client_name || !form.amount) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from("payments")
                .insert([{
                    client_name: form.client_name,
                    amount: form.amount,
                    service: form.service,
                    status: form.status,
                    payment_date: new Date(form.payment_date).toISOString()
                }]);

            if (error) throw error;

            toast.success("Transaction recorded successfully");
            setIsAdding(false);
            setForm({
                client_name: "",
                amount: "",
                service: "",
                status: "completed",
                payment_date: new Date().toISOString().split('T')[0]
            });
            fetchPayments(false);
        } catch (err: any) {
            toast.error(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateProofStatus = async (id: string, status: string) => {
        try {
            const { error } = await careersSupabase
                .from('payment_evidence')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
            toast.success(`Proof set to ${status}`);
            fetchProofs();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const filteredPayments = payments.filter(p =>
        p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.service?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProofs = proofs.filter(p =>
        p.payer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount.toString().replace(/[^0-9.]/g, '')), 0);

    return (
        <div className="space-y-8 animate-fade-in text-white">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient">Financial Center</h2>
                    <p className="text-muted-foreground text-sm font-medium flex items-center gap-2 mt-1">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Manage internal ledger and user-submitted proofs
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-black/40 p-1 rounded-xl border border-white/5 flex gap-1">
                        <button
                            onClick={() => setViewMode('ledger')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'ledger' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Ledger
                        </button>
                        <button
                            onClick={() => setViewMode('proofs')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'proofs' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Proofs
                        </button>
                    </div>

                    <div className="hidden md:flex px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-70">Total Revenue</div>
                        <div className="text-xl font-black font-display flex items-center gap-1">
                            <span className="text-[10px] opacity-50">₹</span>
                            {totalRevenue.toLocaleString()}
                        </div>
                    </div>
                    {viewMode === 'ledger' && (
                        <Button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-gradient-primary h-12 px-6 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
                        >
                            {isAdding ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                            {isAdding ? "Cancel" : "Add Payment"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-3 border-white/10">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={viewMode === 'ledger' ? "Search by client or service..." : "Search by payer or transaction ID..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/20 border-white/5 h-11 pl-12 rounded-xl text-sm text-white"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="ghost" className="flex-1 md:flex-none h-11 px-6 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <Button variant="ghost" className="flex-1 md:flex-none h-11 px-6 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 gap-2" onClick={fetchPayments}>
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Content Switcher */}
            {viewMode === 'ledger' ? (
                <>
                    {/* Add Transaction Form */}
                    <AnimatePresence>
                        {isAdding && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-card p-8 border-primary/20 bg-primary/5 mb-8 relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
                                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">Client Name</label>
                                            <Input
                                                value={form.client_name}
                                                onChange={e => setForm({ ...form, client_name: e.target.value })}
                                                className="bg-black/40 border-white/10 h-11 text-white"
                                                placeholder="e.g. Michael Lee"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">Amount (₹)</label>
                                            <Input
                                                value={form.amount}
                                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                                className="bg-black/40 border-white/10 h-11 text-white"
                                                placeholder="565.00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">Service</label>
                                            <Input
                                                value={form.service}
                                                onChange={e => setForm({ ...form, service: e.target.value })}
                                                className="bg-black/40 border-white/10 h-11 text-white"
                                                placeholder="e.g. Web Design"
                                            />
                                        </div>
                                        <div className="md:col-span-3 flex justify-end gap-3">
                                            <Button type="submit" disabled={saving} className="bg-gradient-primary px-8 h-11 font-bold">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Save to Ledger"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Ledger Table */}
                    <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/5">
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Transaction Details</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {loading ? (
                                        <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></td></tr>
                                    ) : filteredPayments.length === 0 ? (
                                        <tr><td colSpan={4} className="py-20 text-center text-slate-500">No transactions recorded.</td></tr>
                                    ) : filteredPayments.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] group transition-all">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-all">
                                                        {p.status === 'completed' ? <ArrowDownLeft className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{p.client_name}</div>
                                                        <div className="text-[10px] text-slate-500 font-bold tracking-tight mt-0.5">{p.service || 'General Service'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center font-black font-display text-emerald-400 text-lg">₹{Number(p.amount).toLocaleString()}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${p.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                                            p.status === 'failed' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                        }`}>{p.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-slate-500 font-mono italic">
                                                {new Date(p.payment_date || p.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* Proofs Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingProofs ? (
                        <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div>
                    ) : filteredProofs.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <AlertCircle className="h-12 w-12 text-slate-500" />
                                <p className="text-slate-400 font-medium">No payment proofs submitted yet.</p>
                            </div>
                        </div>
                    ) : filteredProofs.map((proof) => (
                        <motion.div
                            key={proof.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="glass-card overflow-hidden border-white/5 flex flex-col bg-white/5 hover:bg-white/[0.08] transition-all shadow-xl"
                        >
                            <div className="aspect-video relative group cursor-pointer" onClick={() => window.open(proof.screenshot_url, '_blank')}>
                                <img src={proof.screenshot_url} alt="Proof" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                                        <ExternalLink className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${proof.status === 'Verified' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                                            proof.status === 'Rejected' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' :
                                                'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                        }`}>
                                        {proof.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <div className="font-bold text-white text-lg truncate">{proof.payer_name}</div>
                                    <div className="text-primary font-black font-display text-base">₹{Number(proof.amount).toLocaleString()}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Transaction ID</div>
                                    <div className="text-[11px] font-mono text-emerald-400 truncate tracking-tight">{proof.transaction_id}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleUpdateProofStatus(proof.id, 'Verified')}
                                        disabled={proof.status === 'Verified'}
                                        className="flex-1 h-9 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                    >
                                        Verify
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateProofStatus(proof.id, 'Rejected')}
                                        disabled={proof.status === 'Rejected'}
                                        className="flex-1 h-9 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => window.open(proof.screenshot_url, '_blank')}
                                        variant="outline"
                                        className="h-9 w-9 p-0 border-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-500 italic font-medium pt-2 border-t border-white/5">
                                    <span>Proof of Payment</span>
                                    <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
