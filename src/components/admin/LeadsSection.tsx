import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Search, Filter, Mail, Phone, Clock, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    message: string;
    created_at: string;
}

export const LeadsSection = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("leads")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error: any) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from("leads")
                .update({ status })
                .eq("id", id);
            if (error) throw error;
            toast.success("Status updated");
            fetchLeads();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const deleteLead = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const { error } = await supabase
                .from("leads")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Lead deleted");
            fetchLeads();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredLeads = leads.filter(l =>
        (l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "all" || l.status === filterStatus)
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Leads Management</h2>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Capture and convert your potential clients</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-900/20">
                    <Plus className="mr-2 h-4 w-4" /> Add Manual Lead
                </Button>
            </div>

            <div className="bg-[#110C1D] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/20 border-white/5 text-slate-200 h-10 rounded-lg focus:ring-1 focus:ring-purple-500/20 focus:border-purple-500/30"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500/20 h-10 text-slate-300 min-w-[140px]"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                    </select>
                    <Button variant="outline" size="icon" className="border-white/5 bg-black/20 h-10 w-10 text-slate-400 hover:text-white hover:bg-white/5">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-500 opacity-20" />
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="bg-[#110C1D] border border-white/5 rounded-xl p-20 text-center text-slate-500 italic border-dashed">
                        No leads found matching your criteria.
                    </div>
                ) : (
                    filteredLeads.map((lead) => (
                        <motion.div
                            layout
                            key={lead.id}
                            className="bg-[#110C1D] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-white/10 transition-all shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row gap-6 flex-1 min-w-0">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-lg font-bold text-purple-400 flex-shrink-0">
                                    {lead.name.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg text-slate-200 group-hover:text-white transition-colors">{lead.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' :
                                            lead.status === 'contacted' ? 'bg-teal-500/10 text-teal-400 border-teal-500/10' :
                                                'bg-white/5 text-slate-500 border-white/5'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Mail className="h-3 w-3" /> {lead.email}
                                        </div>
                                        {lead.phone && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Phone className="h-3 w-3" /> {lead.phone}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock className="h-3 w-3" /> {new Date(lead.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {lead.message && (
                                        <p className="mt-3 text-sm text-slate-400 line-clamp-1 italic">"{lead.message}"</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                <select
                                    className="flex-1 md:flex-none bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-purple-500/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    value={lead.status}
                                    onChange={e => updateStatus(lead.id, e.target.value)}
                                >
                                    <option value="new">Set New</option>
                                    <option value="contacted">Set Contacted</option>
                                    <option value="closed">Set Closed</option>
                                </select>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => deleteLead(lead.id)}
                                    className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
