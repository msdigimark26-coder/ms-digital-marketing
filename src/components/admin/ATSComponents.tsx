import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { careersSupabase } from "@/integrations/supabase/careersClient";
import { toast } from "sonner";
import {
    Star,
    FileText,
    Calendar,
    Tag,
    Download,
    Filter,
    X,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface ATSFiltersProps {
    onFilterChange: (filters: any) => void;
}

export const ATSFilters = ({ onFilterChange }: ATSFiltersProps) => {
    const [filters, setFilters] = useState({
        status: "all",
        scoreMin: 0,
        scoreMax: 100,
        starred: false,
        search: "",
    });

    const updateFilters = (newFilters: any) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange(updated);
    };

    const clearFilters = () => {
        const reset = {
            status: "all",
            scoreMin: 0,
            scoreMax: 100,
            starred: false,
            search: "",
        };
        setFilters(reset);
        onFilterChange(reset);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs text-slate-400 hover:text-white"
                >
                    Clear All
                </Button>
            </div>

            {/* Search */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Search
                </label>
                <Input
                    placeholder="Name, email, skills..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="bg-black/40 border-white/5"
                />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                </label>
                <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilters({ status: value })}
                >
                    <SelectTrigger className="bg-black/40 border-white/5">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Reviewed">Reviewed</SelectItem>
                        <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="Interviewed">Interviewed</SelectItem>
                        <SelectItem value="Hired">Hired</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Score Range */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ATS Score Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.scoreMin}
                        onChange={(e) =>
                            updateFilters({ scoreMin: parseInt(e.target.value) || 0 })
                        }
                        placeholder="Min"
                        className="bg-black/40 border-white/5"
                    />
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.scoreMax}
                        onChange={(e) =>
                            updateFilters({ scoreMax: parseInt(e.target.value) || 100 })
                        }
                        placeholder="Max"
                        className="bg-black/40 border-white/5"
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{filters.scoreMin}</span>
                    <span>{filters.scoreMax}</span>
                </div>
            </div>

            {/* Starred Only */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={filters.starred}
                    onChange={(e) => updateFilters({ starred: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-white">Starred Applications Only</span>
            </label>
        </div>
    );
};

// ATS Score Badge Component
export const ATSScoreBadge = ({ score }: { score: number }) => {
    const getScoreColor = () => {
        if (score >= 80) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        if (score >= 60) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        if (score >= 40) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    };

    const getScoreLabel = () => {
        if (score >= 80) return "Excellent Match";
        if (score >= 60) return "Good Match";
        if (score >= 40) return "Fair Match";
        return "Poor Match";
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor()}`}
            >
                {score}
            </div>
            <span className="text-[10px] text-slate-500">{getScoreLabel()}</span>
        </div>
    );
};

// Notes Dialog Component
interface NotesDialogProps {
    applicationId: string;
    applicantName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const NotesDialog = ({
    applicationId,
    applicantName,
    isOpen,
    onClose,
}: NotesDialogProps) => {
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState("");
    const [noteType, setNoteType] = useState("general");
    const [loading, setLoading] = useState(false);

    const fetchNotes = async () => {
        const { data, error } = await careersSupabase
            .from("application_notes")
            .select("*")
            .eq("application_id", applicationId)
            .order("created_at", { ascending: false });

        if (!error) setNotes(data || []);
    };

    const addNote = async () => {
        if (!newNote.trim()) return;

        setLoading(true);
        const { error } = await careersSupabase.from("application_notes").insert({
            application_id: applicationId,
            note: newNote,
            note_type: noteType,
            created_by: "Admin", // TODO: Get from auth context
        });

        if (error) {
            toast.error("Failed to add note");
        } else {
            toast.success("Note added successfully");
            setNewNote("");
            fetchNotes();
        }
        setLoading(false);
    };

    // Fetch notes when dialog opens
    if (isOpen && notes.length === 0) {
        fetchNotes();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0F0A1F] border-white/10 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Application Notes - {applicantName}
                    </DialogTitle>
                </DialogHeader>

                {/* Add New Note */}
                <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-bold text-white">Add New Note</span>
                    </div>

                    <Select value={noteType} onValueChange={setNoteType}>
                        <SelectTrigger className="bg-black/40 border-white/5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">📝 General Note</SelectItem>
                            <SelectItem value="interview">🎤 Interview Note</SelectItem>
                            <SelectItem value="email">📧 Email Sent</SelectItem>
                            <SelectItem value="call">📞 Phone Call</SelectItem>
                        </SelectContent>
                    </Select>

                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write your note here..."
                        rows={4}
                        className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none resize-none"
                    />

                    <Button
                        onClick={addNote}
                        disabled={loading || !newNote.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Add Note
                    </Button>
                </div>

                {/* Notes History */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Note History ({notes.length})
                    </h3>

                    {notes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No notes yet. Add your first note above.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="p-4 bg-white/5 border border-white/5 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-purple-400 uppercase">
                                            {note.note_type === "general" && "📝 General"}
                                            {note.note_type === "interview" && "🎤 Interview"}
                                            {note.note_type === "email" && "📧 Email"}
                                            {note.note_type === "call" && "📞 Call"}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(note.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {note.note}
                                    </p>
                                    {note.created_by && (
                                        <div className="mt-2 text-xs text-slate-500">
                                            By: {note.created_by}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Export to CSV Function
export const exportApplicationsToCSV = (applications: any[]) => {
    const headers = [
        "Name",
        "Email",
        "Phone",
        "Role",
        "Status",
        "ATS Score",
        "Applied Date",
        "Interview Date",
        "Portfolio",
    ];

    const rows = applications.map((app) => [
        app.full_name,
        app.email,
        app.phone,
        app.job_openings?.title || "N/A",
        app.status,
        app.ats_score || 0,
        new Date(app.applied_at).toLocaleDateString(),
        app.interview_date
            ? new Date(app.interview_date).toLocaleDateString()
            : "Not Scheduled",
        app.portfolio_url || "N/A",
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
        csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${applications.length} applications to CSV`);
};

// Calculate ATS Score
export const calculateATSScore = (application: any, jobOpening: any): number => {
    let score = 0;

    // Extract keywords from job
    const jobKeywords = [
        ...jobOpening.focus_areas,
        ...jobOpening.requirements.toLowerCase().split(/\s+/),
    ].filter((word) => word.length > 3);

    // Check cover letter for keywords (50 points)
    if (application.cover_letter) {
        const coverText = application.cover_letter.toLowerCase();
        const matches = jobKeywords.filter((keyword) =>
            coverText.includes(keyword.toLowerCase())
        );
        score += Math.min((matches.length / jobKeywords.length) * 50, 50);
    }

    // Portfolio presence (10 points)
    if (application.portfolio_url) score += 10;

    // Response time bonus (20 points)
    const hoursToApply =
        (new Date(application.applied_at).getTime() -
            new Date(jobOpening.created_at).getTime()) /
        (1000 * 60 * 60);
    if (hoursToApply < 24) score += 20;
    else if (hoursToApply < 72) score += 10;

    // Phone provided (10 points)
    if (application.phone) score += 10;

    // Professional email domain (10 points)
    const emailDomain = application.email.split("@")[1];
    if (!["gmail.com", "yahoo.com", "hotmail.com"].includes(emailDomain)) {
        score += 10;
    }

    return Math.min(Math.round(score), 100);
};
