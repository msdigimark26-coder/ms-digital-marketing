# 🎨 How to Use Custom Icons with Flaticon Integration

## Overview
You can now upload custom icon images or download premium icons from Flaticon for your services showcase.

## Option 1: Uploading Your Own Icons

### Best Practices for Custom Icons:
- **Format**: PNG or SVG (recommended for scalability)
- **Size**: 512x512px minimum (square aspect ratio)
- **Background**: Transparent background preferred
- **File Size**: Under 2MB for optimal loading

### Steps:
1. Go to Admin Portal → Services Showcase
2. Click "Add New Service" or edit existing
3. Click "Upload Custom Icon" button
4. Choose your icon file from your computer
5. Icon will be automatically uploaded and saved

---

## Option 2: Using Flaticon Icons

### Step-by-Step Guide:

#### 1. Browse Flaticon
Visit: https://www.flaticon.com/free-icons/technology

#### 2. Select Your Icon
- Search for specific service-related icons (e.g., "marketing", "design", "video")
- Filter by style (Flat, Linear, Color, etc.)
- Choose free icons or subscribe for premium

#### 3. Download the Icon
**Option A - Free Account (Limited):**
- Click the icon you want
- Click "Download PNG" button (free)
- Choose size: **512px** or **1024px**
- Download to your computer

**Option B - Premium Account:**
- Access to more icons and formats
- Download as PNG or SVG
- Get editable vector files

#### 4. Upload to Admin Portal
1. Go to Admin → Services Showcase
2. Add/Edit service
3. Click "Upload Custom Icon"
4. Select the downloaded icon from Flaticon
5. Set custom color if needed
6. Save

---

## Recommended Icon Categories from Flaticon:

### 🌐 **Web & Digital**
https://www.flaticon.com/packs/web-design-75
- Code icons
- Browser icons
- Website icons

### 📱 **Social Media**
https://www.flaticon.com/packs/social-media-73
- Social network icons
- Communication icons

### 🎯 **Marketing**
https://www.flaticon.com/packs/digital-marketing-20
- Advertising icons
- Analytics icons
- SEO icons

### 🎨 **Design & Creative**
https://www.flaticon.com/packs/graphic-design-30
- Design tool icons
- Color palette icons
- Creative icons

### 📹 **Media & Production**
https://www.flaticon.com/packs/video-production
- Camera icons
- Video editing icons
- Film icons

---

## Custom Color Picker

### Using the Color Picker:
1. In the admin panel, you'll see a color picker
2. Click to open the color selector
3. Choose any color using:
   - **Predefined swatches** (quick selection)
   - **Custom hex code** (precise color matching - type like #FF5733)
   - **Color wheel** (visual selection)
4. Color applies to icon background

### Brand Color Tips:
- Use your brand's primary color for consistency
- Ensure good contrast with white/light icons
- Test visibility on dark backgrounds

---

## Icon Storage & Management

### Where Icons Are Stored:
- All uploaded icons are stored in **Supabase Storage**
- Bucket: `service-icons`
- Public access enabled for display
- Organized by service ID

### File Naming:
Icons are automatically named:
```
service-icons/service-{uuid}.{extension}
```

### Deleting Icons:
- When you delete a service, its icon is also removed
- When you replace an icon, the old one is automatically deleted

---

## Troubleshooting

### Icon Not Uploading?
- Check file size (must be under 2MB)
- Ensure file format is PNG, JPG, or SVG
- Check internet connection

### Icon Not Displaying?
- Refresh the page
- Clear browser cache
- Check that service is marked as "Active"

### Icon Quality Issues?
- Use higher resolution (1024px recommended)
- Ensure transparent background
- Use PNG or SVG format

---

## Advanced: Using Flaticon API (Future Enhancement)

**Note:** This requires Flaticon API subscription

### API Integration (Coming Soon):
```javascript
// Future feature: Search and import directly from admin
- Browse Flaticon library in admin panel
- One-click import
- Automatic attribution
```

---

## Legal & Attribution

### Flaticon Free Plan:
- **Attribution required** for free icons
- Include: "Icons made by {author} from www.flaticon.com"
- Add to your website footer or credits page

### Flaticon Premium Plan:
- No attribution required
- Commercial use allowed
- Access to exclusive icons

### Your Uploaded Icons:
- Ensure you have rights to use
- Follow original creator's license
- Respect copyright

---

## Quick Reference: Icon Upload Workflow

```
1. Find Icon → Flaticon or create your own
2. Download → 512px PNG or SVG
3. Admin Portal → Services Showcase
4. Upload → Click "Upload Custom Icon"
5. Customize → Set color, title, description
6. Save → Icon appears on website automatically
```

---

## Need Help?
- Check Supabase storage dashboard for uploaded files
- Review browser console for upload errors
- Ensure Supabase storage is properly configured
