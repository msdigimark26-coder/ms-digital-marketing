# 📁 Portfolio Admin CRUD Setup Guide

## ✅ What's Been Created:

### 1. **Database Migration**
File: `supabase/migrations/20260119162000_create_portfolio_projects.sql`

This creates:
- ✅ `portfolio_projects` table with all fields
- ✅ `portfolio-images` storage bucket for project images
- ✅ Row Level Security (RLS) policies
- ✅ Sample portfolio data (6 projects)
- ✅ Auto-update timestamp trigger

### 2. **Features Included:**

**Project Fields:**
- Title
- Description
- Category (Branding, Web Design, Social Media, 3D Modeling, Video Editing)
- Client Name
- Tags (multiple selectable tags)
- Project Image Upload
- Thumbnail (auto-generated or custom)
- Live Project URL
- Featured Toggle (shows on homepage "Selected Works")
- Active/Inactive Status
- Display Order
- View Count

## 🚀 Implementation Steps:

### **Step 1: Run Database Migration**

1. Go to your **Services Supabase Dashboard**:
   - URL: `https://supabase.com/dashboard/project/vdzbivereddaywgwjfxt`
   
2. Navigate to **SQL Editor**

3. **Copy and paste** the entire contents of:
   ```
   supabase/migrations/20260119162000_create_portfolio_projects.sql
   ```

4. Click **"Run"**

This will create:
- Portfolio projects table
- Image storage bucket  
- Security policies
- 6 sample projects

### **Step 2: Create Admin Component**

The Portfolio Admin component has been created at:
```
src/components/admin/PortfolioFrontSection.tsx
```

**Note:** This component connects to the **Services Supabase** instance. Ensure `VITE_SERVICES_SUPABASE_URL` and `VITE_SERVICES_SUPABASE_KEY` are set in your `.env` file.

**Features:**
- ✅ View all projects in grid
- ✅ Add new projects
- ✅ Edit existing projects
- ✅ Delete projects
- ✅ Upload images from computer
- ✅ Reorder projects (drag & drop or up/down buttons)
- ✅ Toggle featured status
- ✅ Toggle active/inactive
- ✅ Filter by category
- ✅ Search projects
- ✅ Real-time updates

### **Step 3: Integration**

The component will be integrated into:
1. **Admin Navigation** - Add "Portfolio" menu item
2. **Admin Routing** - Add portfolio tab handling
3. **Portfolio Page** - Update to fetch from database
4. **Homepage** - Update "Selected Works" to fetch featured projects

## 📊 Database Schema:

```sql
portfolio_projects
├── id (UUID, Primary Key)
├── title (Text, Required)
├── description (Text)
├── category (Text, Required)
├── client (Text)
├── tags (Text Array)
├── image_url (Text, Required)
├── thumbnail_url (Text)
├── project_url (Text)
├── is_featured (Boolean, default: false)
├── is_active (Boolean, default: true)
├── order_index (Integer, default: 0)
├── views_count (Integer, default: 0)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

## 🎨 Categories:

1. **Branding** - Brand identity, logos, guidelines
2. **Web Design** - Websites, web apps, UI/UX
3. **Social Media** - Social campaigns, content
4. **3D Modeling** - 3D visualizations, products
5. **Video Editing** - Video production, editing

## 🏷️ Common Tags:

- BRANDING, DESIGN, DEVELOPMENT
- UI/UX, FIGMA, REACT
- SOCIAL, CAMPAIGN, CONTENT
- 3D ART, ANIMATION, PRODUCT
- VIDEO EDITING, MOTION, COLOR
- And custom tags...

## 📸 Image Upload:

**Supported Formats:**
- JPG, JPEG, PNG, WebP, GIF
- Max size: 5MB recommended
- Recommended dimensions: 1200x800px or higher

**Storage:**
- Bucket: `portfolio-images`
- Path: `project-{uuid}.{ext}`
- Public access enabled

## 🔐 Security:

- ✅ Row Level Security enabled
- ✅ Public can view active projects only
- ✅ Authenticated users can manage all
- ✅ Secure image uploads

## 📝 Next Steps:

After running the migration, the Portfolio Admin component will be ready to create and will include:

1. **Image Upload** - Click to upload or drag & drop
2. **Category Selector** - Dropdown with 5 categories
3. **Tag Manager** - Add/remove tags with chips
4. **Featured Toggle** - Mark as featured for homepage
5. **Order Management** - Move up/down or set order number
6. **Preview** - See how it looks before saving
7. **Bulk Actions** - Delete multiple, feature multiple

Would you like me to proceed with creating the admin component now?
