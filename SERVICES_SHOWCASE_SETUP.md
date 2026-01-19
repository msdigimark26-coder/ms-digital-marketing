# Services Showcase CRUD - Setup Guide

## Overview
The Services Showcase feature allows administrators to manage the services displayed on the homepage through a second, dedicated Supabase instance.

## Features
- ✨ Full CRUD operations (Create, Read, Update, Delete)
- 🎨 Custom icon and color selection for each service
- ⭐ Mark services as "Popular" with a badge
- 👁️ Toggle service visibility without deletion
- 🔄 Drag-and-drop style reordering
- 📱 Responsive design with mobile support

## Setup Instructions

### 1. Create a Second Supabase Project
1. Go to [Supabase](https://supabase.com) and create a **new project**
2. This will be dedicated to storing Services Showcase data only
3. Copy the Project URL and Anon Key

### 2. Run the Migration
Execute the migration SQL in your second Supabase project:

```bash
# Navigate to SQL Editor in your Supabase Dashboard
# Copy and run the contents of:
supabase/migrations/20260119150000_create_services_showcase_table.sql
```

Or manually:
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy the entire content of `20260119150000_create_services_showcase_table.sql`
4. Paste and click "Run"

### 3. Configure Environment Variables
Create a `.env` file in the project root (copy from `.env.example`):

```bash
# Main Supabase Instance
VITE_SUPABASE_URL=https://your-main-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-main-anon-key

# Services Supabase Instance (NEW)
VITE_SERVICES_SUPABASE_URL=https://your-services-project.supabase.co
VITE_SERVICES_SUPABASE_KEY=your-services-anon-key
```

### 4. Restart Development Server
```bash
npm run dev
```

## Usage

### Admin Portal
1. Log into the Admin Portal
2. Navigate to **"Services Showcase"** in the sidebar
3. Click **"Add New Service"** to create a service
4. Fill in:
   - **Title**: Service name (e.g., "Web Design & Development")
   - **Description**: Detailed description (minimum 30 characters)
   - **Icon**: Select from 9 pre-built icons
   - **Color**: Choose icon background color
   - **Popular Badge**: Mark as featured service
   - **Active Status**: Show/hide on homepage

### Homepage Display
- Services appear automatically on the homepage in the "What We Do Best" section
- Only "Active" services are shown to visitors
- Services display in the order you set (use up/down arrows)
- Popular services show a "POPULAR" badge

## Database Schema

```sql
services_showcase
├── id (UUID)
├── title (TEXT)
├── description (TEXT)
├── icon_name (TEXT) - Icon identifier
├── icon_color (TEXT) - Color theme
├── is_popular (BOOLEAN) - Show popular badge
├── order_index (INTEGER) - Display order
├── is_active (BOOLEAN) - Visibility toggle
├── learn_more_url (TEXT) - Optional link
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Available Icons
- `code` - Web Development
- `search` - SEO Services
- `share2` - Social Media
- `target` - PPC/Advertising
- `film` - Video Production
- `palette` - UI/UX Design
- `box` - 3D Modeling
- `sparkles` - Premium Services
- `layers` - Other Services

## Available Colors
- Pink, Blue, Green, Purple, Red, Yellow, Cyan

## Troubleshooting

### "Services Supabase Not Configured" Error
- Ensure `VITE_SERVICES_SUPABASE_URL` and `VITE_SERVICES_SUPABASE_KEY` are set in `.env`
- Restart the development server after adding environment variables

### Services Not Appearing on Homepage
- Check that services are marked as **"Active"** in the admin panel
- Verify the second Supabase instance has data
- Check browser console for any errors

### Migration Errors
- Ensure you're running the migration in the **second** Supabase project (not the main one)
- Check that the `services_showcase` table doesn't already exist

## Benefits of Second Supabase Instance
- **Separation of Concerns**: Public-facing content separate from admin data
- **Performance**: Dedicated resources for high-traffic homepage
- **Security**: Different access control for public vs admin data
- **Scalability**: Independent scaling for different data types

## Support
For issues or questions, check the main project documentation or contact support.
