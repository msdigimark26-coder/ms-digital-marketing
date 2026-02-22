import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { servicesSupabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";
import {
    Users,
    Briefcase,
    Calendar,
    DollarSign,
    TrendingUp,
    ChevronRight,
    ExternalLink,
    MoreVertical,
    Clock,
    Edit2,
    Loader2
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Icon mapping for dynamic rendering
const ICON_MAP: any = {
    'Users': Users,
    'Briefcase': Briefcase,
    'Calendar': Calendar,
    'DollarSign': DollarSign,
    'TrendingUp': TrendingUp
};

const trafficData = [
    { name: 'Mon', traffic: 3200, conv: 120 },
    { name: 'Tue', traffic: 3800, conv: 150 },
    { name: 'Wed', traffic: 3100, conv: 140 },
    { name: 'Thu', traffic: 4500, conv: 200 },
    { name: 'Fri', traffic: 4200, conv: 180 },
    { name: 'Sat', traffic: 5100, conv: 250 },
    { name: 'Sun', traffic: 5320, conv: 320 },
];

// Memoized StatCard to prevent unnecessary re-renders in the dashboard grid
const StatCard = React.memo(({ stat, index, onUpdate }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ value: stat.value, label: stat.label });
    const Icon = ICON_MAP[stat.icon_key] || Users;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onUpdate(stat.id, form);
        if (success) setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#110C1D] border border-white/5 p-5 relative overflow-hidden group rounded-xl shadow-sm hover:border-white/10 transition-all"
        >
            {isEditing ? (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.title}</span>
                    </div>
                    <Input
                        value={form.value}
                        onChange={e => setForm(prev => ({ ...prev, value: e.target.value }))}
                        className="h-9 bg-black/20 border-white/10 font-bold text-lg text-white"
                        placeholder="Value"
                        autoFocus
                    />
                    <Input
                        value={form.label}
                        onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
                        className="h-8 bg-black/20 border-white/10 text-xs text-slate-400"
                        placeholder="Label"
                    />
                    <div className="flex gap-2 mt-2">
                        <Button type="submit" size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3">Save</Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs text-slate-400" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                </form>
            ) : (
                <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 rounded-lg bg-white/[0.03] text-slate-400 group-hover:text-purple-400 transition-colors border border-white/[0.02]">
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.title}</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                        <div className="mt-1 text-xs text-slate-500 font-medium">{stat.label}</div>
                    </div>

                    <button
                        onClick={() => {
                            setForm({ value: stat.value, label: stat.label });
                            setIsEditing(true);
                        }}
                        className="absolute bottom-0 right-0 p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-md text-white hover:text-white"
                    >
                        <Edit2 className="h-3 w-3" />
                    </button>
                </div>
            )}
        </motion.div>
    );
});

StatCard.displayName = 'StatCard';

export const DashboardSection = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const fetchAllData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // 1. Fetch Stats
            const { data: statsData } = await supabase
                .from('dashboard_stats')
                .select('*')
                .order('sort_order', { ascending: true });

            if (statsData) setStats(statsData);

            // 2. Fetch Recent Leads (Limit 5)
            const leadsClient = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            const { data: leadsData } = await leadsClient
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (leadsData) setLeads(leadsData || []);

            // 3. Fetch Active Projects (Limit 4)
            const projectsClient = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            const { data: projectsData } = await projectsClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);

            if (projectsData) setProjects(projectsData || []);

            // 4. Fetch Recent Payments (Limit 4 from Account 1)
            const { data: paymentsData } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);

            if (paymentsData) setPayments(paymentsData || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [supabase, servicesSupabase]);

    useEffect(() => {
        fetchAllData(true);
    }, [fetchAllData]);

    const handleStatUpdate = useCallback(async (id: string, formData: { value: string, label: string }) => {
        try {
            const { error } = await supabase
                .from('dashboard_stats')
                .update({ value: formData.value, label: formData.label })
                .eq('id', id);

            if (error) throw error;

            // Log statistic update
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'update',
                targetType: 'dashboard_stat',
                targetId: id,
                targetData: formData,
                description: `Updated dashboard statistic: ${id}`
            });

            toast.success("Statistic updated");
            fetchAllData(false); // Refresh data without showing global loader
            return true;
        } catch (error: any) {
            toast.error("Failed to update: " + error.message);
            return false;
        }
    }, [supabase, fetchAllData]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };


    if (loading && stats.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500/50" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.length > 0 ? stats.map((stat, i) => (
                    <StatCard
                        key={stat.id}
                        stat={stat}
                        index={i}
                        onUpdate={handleStatUpdate}
                    />
                )) : (
                    <div className="col-span-5 text-center text-slate-500 py-10 text-sm">No stats available</div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Leads */}
                <div className="bg-[#110C1D] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-sm">
                    <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
                        <h3 className="font-semibold text-slate-200 text-sm">Recent Leads</h3>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-white" onClick={() => window.location.href = '#'}>
                            View All <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-transparent text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium text-center">Status</th>
                                    <th className="px-6 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leads.map((lead, i) => (
                                    <tr key={lead.id || i} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-sm text-slate-300 group-hover:text-white transition-colors">{lead.name}</div>
                                            <div className="text-[11px] text-slate-500">{lead.email}</div>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-500 font-mono">{formatTimeAgo(lead.created_at)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' :
                                                lead.status === 'contacted' ? 'bg-teal-500/10 text-teal-400 border-teal-500/10' :
                                                    'bg-white/5 text-slate-400 border-white/5'
                                                }`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button className="p-1 px-2 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-xs text-slate-500 hover:text-white">
                                                Active
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs">
                                            No recent leads found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Traffic Overview */}
                <div className="bg-[#110C1D] border border-white/5 rounded-xl p-6 flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-semibold text-slate-200 text-sm">Traffic Overview</h3>
                        </div>
                        <div className="flex gap-1 bg-black/20 p-0.5 rounded-md border border-white/5">
                            {['7d', '30d', '90d'].map(t => (
                                <button key={t} className={`px-2.5 py-1 text-[10px] rounded-[4px] transition-all font-medium ${t === '7d' ? 'bg-[#1F1730] text-white shadow-sm border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[220px] w-full -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#110C1D',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: '#fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="traffic"
                                    stroke="#A855F7"
                                    fillOpacity={1}
                                    fill="url(#colorTraffic)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-6 pt-6 border-t border-white/5">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Visits</div>
                            <div className="text-lg font-bold text-white mt-1">5,320</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Conv.</div>
                            <div className="text-lg font-bold text-white mt-1">1,290</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Rate</div>
                            <div className="text-lg font-bold text-emerald-400 mt-1">4.8%</div>
                        </div>
                    </div>
                </div>

                {/* Active Projects */}
                <div className="bg-[#110C1D] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-sm">
                    <div className="px-6 py-4 flex justify-between items-center bg-white/[0.01] border-b border-white/5">
                        <h3 className="font-semibold text-slate-200 text-sm">Active Project Tracker</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-slate-500 hover:text-white"
                            onClick={() => {
                                localStorage.setItem("ms-admin-active-tab", "portfolio");
                                window.location.reload();
                            }}
                        >
                            View Tracker <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {projects.map((project, i) => (
                            <div key={project.id || i} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`h-8 w-8 rounded-md flex items-center justify-center bg-${project.color || 'blue'}-500/10 text-${project.color || 'blue'}-400 border border-${project.color || 'blue'}-500/10`}>
                                        <Briefcase className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-sm text-slate-200 truncate">{project.title}</div>
                                        <div className="text-[11px] text-slate-500">{project.client}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:block w-20">
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full bg-purple-500/80`} style={{ width: `${project.progress}%` }} />
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap border ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                                        project.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' :
                                            'bg-violet-500/10 text-violet-400 border-violet-500/10'
                                        }`}>
                                        {project.status?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-[#110C1D] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-sm">
                    <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
                        <h3 className="font-semibold text-slate-200 text-sm">Recent Payments</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-slate-500 hover:text-white"
                            onClick={() => {
                                localStorage.setItem("ms-admin-active-tab", "payments");
                                window.location.reload();
                            }}
                        >
                            View All <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-transparent text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-3 font-medium">Client</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                    <th className="px-6 py-3 font-medium">Service</th>
                                    <th className="px-6 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.map((payment, i) => (
                                    <tr key={payment.id || i} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-sm text-slate-300">{payment.client_name}</div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {formatTimeAgo(payment.payment_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium text-emerald-400 font-mono">₹{payment.amount}</td>
                                        <td className="px-6 py-3">
                                            <span className="text-[10px] bg-white/[0.03] px-2 py-0.5 rounded text-slate-400 border border-white/5">
                                                {payment.service}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button className="p-1.5 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-slate-500 hover:text-white">
                                                <ExternalLink className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs">
                                            No recent payments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
