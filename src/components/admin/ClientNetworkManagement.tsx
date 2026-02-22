import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Globe, MapPin, Move, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reelsSupabase } from "@/integrations/supabase/reels-client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

interface ClientLocation {
    id: string;
    name: string;
    x_position: number;
    y_position: number;
    is_active: boolean;
}

export const ClientNetworkManagementSection = () => {
    const [locations, setLocations] = useState<ClientLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { user } = useAuth();
    const [formData, setFormData] = useState({ name: "", x_position: 50, y_position: 50 });

    const fetchLocations = async () => {
        setLoading(true);
        const { data, error } = await reelsSupabase
            .from("client_network_locations")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            toast.error("Failed to load locations");
        } else if (data) {
            setLocations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Please enter a location name");
            return;
        }

        try {
            if (editingId) {
                const { error } = await reelsSupabase
                    .from("client_network_locations")
                    .update({
                        name: formData.name,
                        x_position: Number(formData.x_position),
                        y_position: Number(formData.y_position)
                    })
                    .eq("id", editingId);

                if (error) throw error;

                // Log update
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'update',
                    targetType: 'client_network_node',
                    targetId: editingId,
                    targetData: formData,
                    description: `Updated client network node: ${formData.name}`
                });

                toast.success("Location updated successfully");
            } else {
                const { error } = await reelsSupabase
                    .from("client_network_locations")
                    .insert([{
                        name: formData.name,
                        x_position: Number(formData.x_position),
                        y_position: Number(formData.y_position)
                    }]);

                if (error) throw error;

                // Log creation
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'create',
                    targetType: 'client_network_node',
                    targetData: formData,
                    description: `Added new client network node: ${formData.name}`
                });

                toast.success("Location added successfully");
            }

            setFormData({ name: "", x_position: 50, y_position: 50 });
            setIsAdding(false);
            setEditingId(null);
            fetchLocations();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this location?")) return;

        try {
            const { error } = await reelsSupabase
                .from("client_network_locations")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Log deletion
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'delete',
                targetType: 'client_network_node',
                targetId: id,
                description: `Deleted client network node: ${id}`
            });

            toast.success("Location deleted");
            fetchLocations();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    const handleEdit = (loc: ClientLocation) => {
        setFormData({
            name: loc.name,
            x_position: loc.x_position,
            y_position: loc.y_position
        });
        setEditingId(loc.id);
        setIsAdding(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        Client Network <span className="text-primary italic">Manager</span>
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Deploy client nodes across the global connectivity visualization</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchLocations}
                        disabled={loading}
                        className="bg-black/20 border-white/5 text-slate-400 hover:text-white h-10 w-10 flex items-center justify-center rounded-xl group transition-all"
                        title="Refresh locations"
                    >
                        <RefreshCw className={`h-4 w-4 transition-all duration-500 ${loading ? 'animate-spin' : 'group-active:rotate-180'}`} />
                    </Button>
                    <Button
                        onClick={() => { setIsAdding(!isAdding); if (editingId) { setEditingId(null); setFormData({ name: "", x_position: 50, y_position: 50 }); } }}
                        className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2"
                    >
                        {isAdding ? "Cancel" : <><Plus className="h-4 w-4" /> Add Node</>}
                    </Button>
                </div>
            </div>
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest text-[10px]">Location Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. London"
                                    className="bg-black/40 border-white/10 focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest text-[10px]">X Position (0-100%)</label>
                                <Input
                                    type="number"
                                    value={formData.x_position}
                                    onChange={(e) => setFormData({ ...formData, x_position: Number(e.target.value) })}
                                    className="bg-black/40 border-white/10 focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest text-[10px]">Y Position (0-100%)</label>
                                <Input
                                    type="number"
                                    value={formData.y_position}
                                    onChange={(e) => setFormData({ ...formData, y_position: Number(e.target.value) })}
                                    className="bg-black/40 border-white/10 focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <div className="mt-6 border border-dashed border-white/10 rounded-xl p-4 bg-black/20 flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Position Preview</span>
                            <div className="relative w-full aspect-[21/9] bg-[#070510] rounded-lg overflow-hidden border border-white/10">
                                {/* Map Background in Preview */}
                                <svg
                                    viewBox="0 0 1000 480"
                                    className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                >
                                    <path className="text-primary/40" d="M164.5,134.1c-1.3-1-3.6-2.5-6.5-1.1c-1.4,0.7-2.3,2.2-2,3.7c0.4,1.8,2,2.8,3.7,2.8c1.3,0,2.5-0.6,3.3-1.6 C165.7,136.6,165.8,135.1,164.5,134.1z M221.7,117.1c-2,0-3.9,0.5-5.6,1.4c-2.3,1.3-3.6,3.7-3.3,6.3c0.4,4,3.7,7.1,7.7,7.1 c2,0,3.9-0.5,5.6-1.4c2.3-1.3,3.6-3.7,3.3-6.3C229,120.2,225.7,117.1,221.7,117.1z M117.5,152.1c-1.2-4.1-5-7.1-9.3-7.1 c-2.4,0-4.6,0.9-6.3,2.5c-3.1,2.8-3.9,7.4-1.9,11.2c1.9,3.5,5.6,5.5,9.5,5c3.2-0.4,5.9-2.5,7.3-5.4 C117.7,156.4,117.8,154.2,117.5,152.1z M864.5,127.1c-1.2-4.1-5-7.1-9.3-7.1c-2.4,0-4.6,0.9-6.3,2.5c-3.1,2.8-3.9,7.4-1.9,11.2 c1.9,3.5,5.6,5.5,9.5,5c3.2-0.4,5.9-2.5,7.3-5.4C864.7,131.4,864.8,129.2,864.5,127.1z" fill="currentColor" />
                                    <g className="text-white/10">
                                        <path d="M150,120 L180,110 L220,115 L250,140 L240,180 L200,220 L160,200 L140,160 Z" fill="currentColor" />
                                        <path d="M300,280 L350,260 L380,300 L360,380 L300,420 L270,380 L280,320 Z" fill="currentColor" />
                                        <path d="M480,100 L550,80 L600,100 L620,150 L580,200 L500,180 L470,140 Z" fill="currentColor" />
                                        <path d="M500,220 L580,210 L650,250 L630,350 L550,400 L480,350 L470,280 Z" fill="currentColor" />
                                        <path d="M650,100 L850,80 L920,150 L880,300 L750,350 L680,200 Z" fill="currentColor" />
                                        <path d="M780,380 L850,370 L880,420 L820,450 L770,430 Z" fill="currentColor" />
                                    </g>
                                    <rect width="1000" height="480" fill="url(#techGridPreview)" />
                                    <defs>
                                        <pattern id="techGridPreview" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                </svg>

                                <div
                                    className="absolute w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300"
                                    style={{ left: `${formData.x_position}%`, top: `${formData.y_position}%` }}
                                >
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/95 text-white text-[9px] px-2 py-0.5 rounded border border-white/10 whitespace-nowrap shadow-2xl">
                                        {formData.name || "Preview"}
                                    </div>
                                    <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-3 italic text-center px-4">
                                Use the X (horizontal) and Y (vertical) percentage values to position the dot on the world map.
                                0% is top/left, 100% is bottom/right.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name: "", x_position: 50, y_position: 50 }); }}
                                className="border-white/10 hover:bg-white/5 text-slate-300"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-primary hover:bg-primary/90 text-white px-8"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {editingId ? "Update Location" : "Save Location"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc) => (
                    <motion.div
                        layout
                        key={loc.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm tracking-tight">{loc.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                                        X: {loc.x_position}%
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                                        Y: {loc.y_position}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(loc)}
                                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                                title="Edit Location"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(loc.id)}
                                className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all"
                                title="Delete Location"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {loading && locations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                    <Globe className="h-10 w-10 text-white/10 animate-pulse mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Fetching worldwide nodes...</p>
                </div>
            )}
        </div>
    );
};
