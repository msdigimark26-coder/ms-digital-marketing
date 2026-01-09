import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, Loader2, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface Payment {
    id: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'failed';
    transaction_reference: string | null;
    confirmed_at: string | null;
    created_at: string;
    profiles?: {
        full_name: string;
        email: string;
    };
    invoices?: {
        invoice_number: string;
    };
}

export const PaymentsSection = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*, profiles(full_name, email), invoices(invoice_number)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setPayments(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p =>
        p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoices?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = payments
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Financial Transactions</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Monitor revenue and payment history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 shadow-sm">
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">Total Confirmed Revenue</div>
                        <div className="text-2xl font-bold font-display">${totalRevenue.toLocaleString()}</div>
                    </div>
                    <Button variant="outline" className="h-12 w-12 rounded-xl bg-[#110C1D] border-white/5 hover:bg-white/5 p-0 text-slate-400 hover:text-white">
                        <Download className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by client, reference or invoice..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#110C1D] border-white/5 focus:border-purple-500/30 h-12 pl-12 rounded-xl text-slate-200 focus:ring-1 focus:ring-purple-500/20"
                    />
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-xl bg-[#110C1D] border-white/5 text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-semibold">Filter By Status</span>
                </Button>
            </div>

            <div className="bg-[#110C1D] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-white/5">
                            <tr>
                                <th className="px-4 md:px-8 py-5">Transaction Details</th>
                                <th className="px-4 md:px-8 py-5 text-center">Amount</th>
                                <th className="px-4 md:px-8 py-5 text-center">Status</th>
                                <th className="px-4 md:px-8 py-5">Reference</th>
                                <th className="px-4 md:px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
                                        <p className="text-slate-500">Loading transactions...</p>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <p className="text-slate-500">No transactions matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : filteredPayments.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 md:px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                                {p.status === 'confirmed' ? <ArrowDownLeft className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors">{p.profiles?.full_name || 'System User'}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Invoice: {p.invoices?.invoice_number || 'Internal'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-5 text-center">
                                        <div className="text-lg font-bold font-display text-white">${Number(p.amount).toFixed(2)}</div>
                                        <div className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-4 md:px-8 py-5">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${p.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                                                p.status === 'failed' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/10'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-5">
                                        <div className="text-xs font-mono text-slate-500 truncate max-w-[120px]">{p.transaction_reference || 'N/A'}</div>
                                    </td>
                                    <td className="px-4 md:px-8 py-5 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
