# Custom Icon Upload & Color Picker - Implementation Summary

## 🎯 What's Needed

Due to file size constraints, here's what needs to be added to the `ServicesShowcaseSection.tsx` component:

## ✅ Already Done:
1. ✅ Added IoT/Tech icons (Cpu, Wifi, Database, Cloud, Server, etc.) - 16 new icons!
2. ✅ Updated imports
3. ✅ Added state variables for custom icons
4. ✅ Extended COLOR_OPTIONS with hex values

## 🔧 Functions to Add:

### 1. Icon Upload Handler
```typescript
const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File size must be under 2MB");
        return;
    }

    setCustomIconFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
        setCustomIconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-enable custom icon mode
    setForm({ ...form, use_custom_icon: true });
};

const uploadIconToSupabase = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `service-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await servicesSupabase.storage
            .from('service-icons')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = servicesSupabase.storage
            .from('service-icons')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error: any) {
        console.error('Error uploading icon:', error);
        toast.error(`Upload failed: ${error.message}`);
        return null;
    } finally {
        setUploading(false);
    }
};
```

### 2. Update handleSave Function
Add this BEFORE the database insert/update:
```typescript
let iconUrl = form.icon_url;

// If user uploaded a custom icon, upload it first
if (customIconFile && form.use_custom_icon) {
    const uploadedUrl = await uploadIconToSupabase(customIconFile);
    if (uploadedUrl) {
        iconUrl = uploadedUrl;
    } else {
        setSaving(false);
        return; // Don't save if upload failed
    }
}

// Then include in the database operation:
const serviceData = {
    ...form,
    icon_url: iconUrl,
    updated_at: new Date().toISOString()
};
```

### 3. Update resetForm Function
```typescript
const resetForm = () => {
    setForm({
        title: "",
        description: "",
        icon_name: "code",
        icon_color: "pink",
        custom_icon_color: "",
        is_popular: false,
        is_active: true,
        learn_more_url: "",
        use_custom_icon: false,
        icon_url: "",
    });
    setCustomIconFile(null);
    setCustomIconPreview(null);
    setIsAdding(false);
    setEditingId(null);
    setErrors({});
};
```

### 4. Update handleEdit Function
```typescript
const handleEdit = (s: ServiceShowcase) => {
    setForm({
        title: s.title,
        description: s.description,
        icon_name: s.icon_name,
        icon_color: s.icon_color,
        custom_icon_color: s.custom_icon_color || "",
        is_popular: s.is_popular,
        is_active: s.is_active,
        learn_more_url: s.learn_more_url || "",
        use_custom_icon: s.use_custom_icon || false,
        icon_url: s.icon_url || "",
    });
    
    // Show preview if custom icon exists
    if (s.use_custom_icon && s.icon_url) {
        setCustomIconPreview(s.icon_url);
    }
    
    setEditingId(s.id);
    setIsAdding(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

## 🎨 UI Elements to Add in the Form:

### Custom Icon Upload Section (Add after Icon Selection):
```tsx
{/* Custom Icon Upload */}
<div className="space-y-4 pt-4 border-t border-white/10">
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
            Custom Icon Upload
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={form.use_custom_icon}
                onChange={e => {
                    setForm({ ...form, use_custom_icon: e.target.checked });
                    if (!e.target.checked) {
                        setCustomIconFile(null);
                        setCustomIconPreview(null);
                    }
                }}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary"
            />
            <span className="text-xs text-slate-400">Use Custom Icon</span>
        </label>
    </div>

    {form.use_custom_icon && (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
            />
            
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-white/5 hover:bg-white/10 border border-white/10"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            {customIconFile ? 'Change Icon' : 'Upload Icon'}
                        </>
                    )}
                </Button>

                {customIconPreview && (
                    <div className="relative w-16 h-16 rounded-lg bg-white/5 border border-white/10 p-2">
                        <img 
                            src={customIconPreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setCustomIconFile(null);
                                setCustomIconPreview(null);
                                setForm({ ...form, icon_url: "" });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
            
            <p className="text-xs text-slate-400">
                Upload PNG/SVG • Max 2MB • 512x512px recommended
            </p>
        </>
    )}
</div>
```

### Custom Color Picker (Add after Color Selection):
```tsx
{/* Custom Hex Color */}
<div className="space-y-2">
    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
        Custom Color (Hex)
        <span className="text-xs text-slate-500">(Optional)</span>
    </label>
    <div className="flex gap-2 items-center">
        <Input
            type="text"
            placeholder="#FF5733"
            value={form.custom_icon_color}
            onChange={e => setForm({ ...form, custom_icon_color: e.target.value })}
            className="bg-white/5 border-white/10 focus:border-primary/50 h-10 font-mono text-sm"
            maxLength={7}
        />
        <input
            type="color"
            value={form.custom_icon_color || "#ec4899"}
            onChange={e => setForm({ ...form, custom_icon_color: e.target.value })}
            className="w-10 h-10 rounded border-2 border-white/10 cursor-pointer bg-transparent"
        />
        {form.custom_icon_color && (
            <div 
                className="w-10 h-10 rounded border-2 border-white/20"
                style={{ backgroundColor: form.custom_icon_color }}
            />
        )}
    </div>
    <p className="text-xs text-slate-400">
        Leave empty to use preset color. Format: #RRGGBB
    </p>
</div>
```

## 📖 Instructions:

1. **Run the database migration first** (already provided)
2. **Add the functions above** to ServicesShowcaseSection.tsx
3. **Add the UI elements** in the form section
4. **Update the service card display** to show custom icons

The complete working component is too large to paste here, but these additions will enable:
- ✅ Custom icon uploads from computer
- ✅ Hex color picker
- ✅ 16 new IoT/Tech icons
- ✅ Storage in Supabase
- ✅ Preview before saving

Would you like me to create these as separate smaller files you can copy-paste?
