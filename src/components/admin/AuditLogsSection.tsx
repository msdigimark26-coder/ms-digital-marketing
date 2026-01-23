import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { servicesSupabase } from "@/integrations/supabase/servicesClient";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, Download, Trash2, FileText } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export const AuditLogsSection = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [viewingLog, setViewingLog] = useState<any>(null);
    const [isActivityLoading, setIsActivityLoading] = useState(true);

    useEffect(() => {
        const session = sessionStorage.getItem("ms-admin-session");
        if (session) {
            setCurrentUser(JSON.parse(session));
        }
    }, []);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        action: () => Promise<void> | void;
        variant?: "default" | "destructive";
        confirmText?: string;
    }>({
        open: false,
        title: "",
        description: "",
        action: () => { },
    });

    useEffect(() => {
        fetchLogs();
        fetchActivityLogs();

        // Real-time updates for Session Logs
        const sessionChannel = supabase
            .channel('admin_audit_logs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_login_logs' }, () => {
                fetchLogs();
            })
            .subscribe();

        // Real-time updates for Activity Logs
        const activityChannel = servicesSupabase
            .channel('admin_activity_logs_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_activity_logs' }, () => {
                fetchActivityLogs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sessionChannel);
            servicesSupabase.removeChannel(activityChannel);
        };
    }, []);

    const fetchActivityLogs = async () => {
        try {
            setIsActivityLoading(true);
            const { data, error } = await servicesSupabase
                .from("admin_activity_logs")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                // If the table doesn't exist yet, it's fine, just show empty
                if (error.code === '42P01') {
                    setActivityLogs([]);
                } else {
                    throw error;
                }
            } else {
                setActivityLogs(data || []);
            }
        } catch (error) {
            console.error("Error fetching activity logs:", error);
        } finally {
            setIsActivityLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from("admin_login_logs")
                .select(`
                    *,
                    portal_users (
                        username,
                        avatar_url,
                        role
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            toast.error("Failed to fetch audit logs");
        } finally {
            setIsLoading(false);
        }
    };

    const confirmAction = (
        title: string,
        description: string,
        action: () => Promise<void> | void,
        variant: "default" | "destructive" = "default",
        confirmText: string = "Continue"
    ) => {
        setConfirmDialog({
            open: true,
            title,
            description,
            action,
            variant,
            confirmText
        });
    };

    const handleDelete = (logId: string) => {
        confirmAction(
            "Delete Audit Record",
            "Are you sure you want to permanently delete this audit record? This action cannot be undone.",
            async () => {
                try {
                    const { error } = await supabase
                        .from('admin_login_logs')
                        .delete()
                        .eq('id', logId);

                    if (error) throw error;
                    toast.success("Log record deleted successfully.");
                    setLogs(prev => prev.filter(log => log.id !== logId));
                    setSelectedLogs(prev => prev.filter(id => id !== logId));
                } catch (err: any) {
                    console.error("Failed to delete log:", err);
                    toast.error("Failed to delete log record: " + err.message);
                }
            },
            "destructive",
            "Delete Record"
        );
    };

    const handleBulkDelete = () => {
        if (selectedLogs.length === 0) return;
        confirmAction(
            "Delete Multiple Records",
            `Are you sure you want to delete ${selectedLogs.length} selected records? This action cannot be undone.`,
            async () => {
                try {
                    const { error } = await supabase
                        .from('admin_login_logs')
                        .delete()
                        .in('id', selectedLogs);

                    if (error) throw error;
                    toast.success(`${selectedLogs.length} records deleted successfully.`);
                    setLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
                    setSelectedLogs([]);
                } catch (err: any) {
                    console.error("Failed to delete logs:", err);
                    toast.error("Failed to delete selected records: " + err.message);
                }
            },
            "destructive",
            `Delete ${selectedLogs.length} Records`
        );
    };

    const handleExportCSV = () => {
        if (logs.length === 0) {
            toast.warning("No logs to export.");
            return;
        }

        confirmAction(
            "Export to CSV",
            "Are you sure you want to download the audit logs as a CSV file?",
            () => {
                try {
                    const csvHeader = ["User ID", "Username", "Role", "Login Time", "Logout Time", "Duration", "Status", "Evidence URL", "Log ID"];
                    const csvRows = logs.map(log => {
                        const duration = log.logout_time ? formatDistance(new Date(log.login_time), new Date(log.logout_time)) : "Active";
                        return [
                            log.user_id,
                            log.portal_users?.username || "Unknown",
                            log.portal_users?.role || "admin",
                            log.login_time,
                            log.logout_time || "N/A",
                            duration,
                            log.status,
                            log.captured_image_url || "N/A",
                            log.id
                        ].map(item => `"${item}"`).join(",");
                    });

                    const csvContent = "data:text/csv;charset=utf-8," + [csvHeader.join(","), ...csvRows].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `audit_logs_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Audit logs exported to CSV.");
                } catch (error: any) {
                    console.error("Export CSV Error:", error);
                    toast.error("Failed to export CSV: " + error.message);
                }
            },
            "default",
            "Download CSV"
        );
    };

    const handleExportPDF = () => {
        if (logs.length === 0) {
            toast.warning("No logs to export.");
            return;
        }

        confirmAction(
            "Export Secure PDF",
            "This will generate a password-protected PDF ($msdigimark@2026) with a verifiable QR code, uploaded to secure cloud storage. Proceed?",
            async () => {
                const toastId = toast.loading("Initializing Secure PDF Engine...");

                try {
                    // Import dynamically to avoid circle deps if any, though utils usually fine
                    const { generateAuditLogPDF } = await import("@/utils/pdfGenerator");

                    const filename = await generateAuditLogPDF(logs, (progressMsg) => {
                        toast.loading(progressMsg, { id: toastId });
                    });

                    toast.success("Secure PDF generated successfully!", { id: toastId });

                    // Optional: Auto-download the file as well
                    const { data } = supabase.storage.from('admin_logs').getPublicUrl(filename);
                    if (data?.publicUrl) {
                        const link = document.createElement("a");
                        link.href = data.publicUrl;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }

                } catch (error: any) {
                    console.error("Export PDF Error:", error);
                    toast.error("Failed to generate PDF: " + error.message, { id: toastId });
                }
            },
            "default",
            "Download Secure PDF"
        );
    };

    const calculateDuration = (start: string, end: string | null) => {
        if (!end) return "Active";
        try {
            return formatDistance(new Date(start), new Date(end));
        } catch (e) {
            return "Invalid Date";
        }
    };

    const filteredLogs = logs.filter(log =>
        log.portal_users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.portal_users?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllSelected = filteredLogs.length > 0 && selectedLogs.length === filteredLogs.length;

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLogs(filteredLogs.map(log => log.id));
        } else {
            setSelectedLogs([]);
        }
    };

    const toggleSelectLog = (logId: string) => {
        if (selectedLogs.includes(logId)) {
            setSelectedLogs(selectedLogs.filter(id => id !== logId));
        } else {
            setSelectedLogs([...selectedLogs, logId]);
        }
    };

    // Check if user has permission to delete (Super Admin or Manager)
    const canDelete = ['super_admin', 'superadmin', 'manager'].includes(currentUser?.role || '');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Audit Center</h2>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Monitor system security and administrative activities.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-10 bg-black/20 border-white/5 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 h-10 rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportPDF} className="border-white/5 bg-[#110C1D] hover:bg-white/5 text-slate-400 hover:text-white h-10 px-3 rounded-lg gap-2">
                            <FileText className="h-4 w-4 text-red-500/70" />
                            <span className="text-xs font-semibold">PDF Report</span>
                        </Button>
                        <Button variant="outline" onClick={handleExportCSV} className="border-white/5 bg-[#110C1D] hover:bg-white/5 text-slate-400 hover:text-white h-10 px-3 rounded-lg gap-2">
                            <Download className="h-4 w-4 text-emerald-500/70" />
                            <span className="text-xs font-semibold">Export CSV</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="sessions" className="w-full">
                <TabsList className="bg-black/40 border border-white/5 p-1 mb-6">
                    <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                        Session Logs
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                        Activity Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sessions">
                    <div className="bg-[#110C1D] border border-white/5 rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-400" />
                            <h3 className="font-semibold text-white">Access History</h3>
                        </div>
                        <div className="max-h-[600px] overflow-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-white/[0.02] sticky top-0 backdrop-blur-sm z-10">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="w-[50px] pl-6">
                                            {canDelete && (
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                                                    className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                />
                                            )}
                                        </TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">User</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Role</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Login Time</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Session</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Evidence</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-20 text-slate-500">Retrieving security records...</TableCell>
                                        </TableRow>
                                    ) : filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-20 text-slate-500 font-medium">No login logs found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow key={log.id} className="hover:bg-white/[0.02] border-white/5 transition-colors group">
                                                <TableCell className="pl-6">
                                                    {canDelete && (
                                                        <Checkbox
                                                            checked={selectedLogs.includes(log.id)}
                                                            onCheckedChange={() => toggleSelectLog(log.id)}
                                                            className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 ring-1 ring-white/10">
                                                            <AvatarImage src={log.portal_users?.avatar_url || ""} />
                                                            <AvatarFallback className="bg-purple-500/10 text-[10px] text-purple-400 font-bold">
                                                                {log.portal_users?.username?.substring(0, 2).toUpperCase() || "U"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors">{log.portal_users?.username || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/5">
                                                        {log.portal_users?.role || "admin"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                                                        {format(new Date(log.login_time), "MMM d, HH:mm")}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-sm">
                                                    <div className="flex flex-col gap-0.5">
                                                        {log.logout_time ? (
                                                            <span className="text-xs text-slate-500">
                                                                {calculateDuration(log.login_time, log.logout_time)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                </span>
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${log.status === 'success'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/10'
                                                        }`}>
                                                        {log.status === 'success' ? 'Authorized' : 'Failed'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {log.captured_image_url ? (
                                                        <a href={log.captured_image_url} target="_blank" rel="noopener noreferrer" className="block w-8 h-8 rounded-md overflow-hidden ring-1 ring-white/10 hover:ring-purple-500/50 transition-all hover:scale-105">
                                                            <img src={log.captured_image_url} alt="Evidence" className="w-full h-full object-cover" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600 italic">No img</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(log.id)}
                                                            className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="activity">
                    <div className="bg-[#110C1D] border border-white/5 rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-400" />
                            <h3 className="font-semibold text-white">System Activities</h3>
                        </div>
                        <div className="max-h-[600px] overflow-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-white/[0.02] sticky top-0 backdrop-blur-sm z-10">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider pl-6">Admin</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Action</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Target</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Description</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider">Timestamp</TableHead>
                                        <TableHead className="text-slate-500 text-xs font-bold uppercase tracking-wider text-right pr-6">Data</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isActivityLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-slate-500">Gathering activity data...</TableCell>
                                        </TableRow>
                                    ) : activityLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-slate-500 font-medium">No activity logs recorded yet.</TableCell>
                                        </TableRow>
                                    ) : (
                                        activityLogs.map((log) => (
                                            <TableRow key={log.id} className="hover:bg-white/[0.02] border-white/5 transition-colors group">
                                                <TableCell className="pl-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-slate-300">{log.admin_name || "Unknown"}</span>
                                                        <span className="text-[10px] text-slate-500">{log.admin_email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${log.action_type === 'delete'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                        }`}>
                                                        {log.action_type}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded">
                                                        {log.target_type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm text-slate-300 max-w-md truncate" title={log.description}>
                                                        {log.description}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-sm whitespace-nowrap">
                                                    {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setViewingLog(log)}
                                                        className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1.5"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Inspect</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Inspect Data Dialog */}
            <Dialog open={!!viewingLog} onOpenChange={(open) => !open && setViewingLog(null)}>
                <DialogContent className="bg-[#0F0A1F] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Audit Inspection: {viewingLog?.action_type} {viewingLog?.target_type}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            ID: {viewingLog?.target_id} | Time: {viewingLog?.created_at && format(new Date(viewingLog.created_at), "PPpp")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto bg-black/40 rounded-lg p-4 font-mono text-xs custom-scrollbar border border-white/5">
                        <pre className="text-blue-300">
                            {JSON.stringify(viewingLog?.target_data, null, 2)}
                        </pre>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest font-bold">
                            <div>
                                <span className="text-slate-500 block mb-1">Source IP</span>
                                <span className="text-slate-300">{viewingLog?.ip_address || "Hidden by Proxy"}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-1">Device/Agent</span>
                                <span className="text-slate-300 truncate block" title={viewingLog?.user_agent}>
                                    {viewingLog?.user_agent || "N/A"}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" onClick={() => setViewingLog(null)} className="h-9 rounded-lg border-white/10 hover:bg-white/5">
                                Close
                            </Button>
                            {viewingLog?.action_type === 'delete' && (
                                <Button className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-2" disabled>
                                    <Download className="h-4 w-4" />
                                    Restore Data (Coming Soon)
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent className="bg-[#110C1D] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.preventDefault();
                                await confirmDialog.action();
                                setConfirmDialog(prev => ({ ...prev, open: false }));
                            }}
                            className={`${confirmDialog.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"} text-white border-none`}
                        >
                            {confirmDialog.confirmText || "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
