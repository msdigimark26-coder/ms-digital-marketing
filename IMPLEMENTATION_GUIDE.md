# MS Digital Mark - Setup & Feature Implementation Guide

## ✅ Completed Implementations

### 1. **Supabase Configuration**
✓ **Status**: Configured  
✓ **File**: `.env.local`

The project now has Supabase credentials configured for backend authentication and database operations.

**Environment Variables Set:**
- `VITE_SUPABASE_URL`: https://tmvzkdragpvqmcrqedhk.supabase.co
- `VITE_SUPABASE_PUBLISHABLE_KEY`: JWT token configured

**What this enables:**
- User authentication (signup/login/logout)
- Session management via AuthProvider hook
- Database queries via Supabase client
- Real-time data synchronization

**Usage in components:**
```tsx
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const { user, session, loading, signIn, signUp, signOut } = useAuth();
```

### 2. **Favicon Update**
✓ **Status**: Updated  
✓ **File**: `index.html`

Changed favicon to `MS Favicon_01.png` for brand consistency.

### 3. **Team Members Section ("The Minds Behind")**
✓ **Status**: Implemented  
✓ **File**: `src/components/home/TeamSection.tsx`  
✓ **Integrated Into**: `src/pages/Index.tsx`

**Features:**
- Interactive animated carousel with GSAP animations
- 8 team members with rotating display
- Smooth slide transitions with parallax effect
- Thumbnail navigation for quick member selection
- Responsive design for mobile, tablet, and desktop
- Two-color gradient heading ("The Minds Behind" + "Meet Our Team")
- Subtitle: "The creative strategists powering your digital success."
- Team counter showing current member (01/08, 02/08, etc.)

**Team Members (in order):**
1. **Sai Sankrit** - Digital Marketing Head & Business Strategy
2. **Britto** - Front-end Developer & UI/UX Designer
3. **Arivaliyan** - UI/UX Designer & Editor
4. **Abdul rezzak** - Project Manager & Editor
5. **Jodi kevi** - Social Media Manager
6. **Bapths** - Creative Designer
7. **Rahul Ji** - Video Editor
8. **Sangeeth** - Back-end Developer

**Section appears on:** Home page (between Portfolio and Testimonials sections)

---

## 🚀 Next Steps to Run the Project

### 1. Install New Dependency
The project now requires GSAP for the team animations:

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 2. Start Development Server
```bash
bun run dev
# or
npm run dev
```

The site will be available at `http://localhost:8080`

### 3. View the Team Section
Navigate to the home page (/) and scroll down to see the "The Minds Behind" team carousel section.

---

## 📋 Architecture Notes

### Team Section Component Structure
```
src/components/home/TeamSection.tsx
├── Uses GSAP for smooth animations
├── Uses Framer Motion for section entrance
├── Responsive carousel with touch-friendly navigation
└── Image path: /public/Team Members 2/{1-8}.png
```

### Animation Details
- **Transition Easing**: Custom GSAP ease ("slideshow-wipe")
- **Duration**: 1.5 seconds per slide transition
- **Effects**: Parallax scrolling on images, smooth opacity transitions
- **Navigation**: Click thumbnails, arrow buttons, or auto-navigate

### Supabase Integration Points
The Supabase client is already configured in:
- `src/hooks/useAuth.tsx` - Authentication context
- `src/integrations/supabase/client.ts` - Supabase client instance
- `src/integrations/supabase/types.ts` - Auto-generated type definitions

**Current tables available:**
- `invoices` - Used in Portal section for displaying user invoices

---

## 🔧 Customization Guide

### Change Team Member Information
Edit `src/components/home/TeamSection.tsx`:
```tsx
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Team Member Name",
    title: "Role & Specialties",
    description: "Key skills and services",
    image: "/Team Members 2/1.png",
  },
  // ... more members
];
```

### Logo / Brand Assets (Header)
- Place your header logo in `public/`. Recommended filename: `MS Favicon_01.png` but the header component will attempt these names in order if the primary is not found:
  - `MS Favicon_01.png` (Current Primary)
  - `MS Png favicon.png`
  - `Favicon .png`
  - `MS DIGIMARK LOGO .png`
  - `MS DIGIMARK LOGO.png`
  - `logo-left.png`
  - `ms-digimark-logo.png`
  - `favicon.png` (fallback)
- Preferred format: **SVG** for crispness and scalability. If using PNG, provide a 1x and a `@2x` (retina) variant: `logo-left.png` and `logo-left@2x.png`.
- Recommended dimensions for header use: 160×40 (1x) and 320×80 (2x). For full-screen wordmarks, provide larger variants.
- After placing the file in `public/`, restart the dev server and check the top-left of the site to confirm visibility across breakpoints.

### Modify Animation Speed
In `TeamSection.tsx`, change:
```tsx
const animationDuration = 1.5; // Change to 2.0 for slower, 1.0 for faster
```

### Adjust Section Colors
The section uses:
- `text-gradient` class for the title gradient
- Tailwind classes for styling
- Update in `src/globals.css` or component styles

---

## 🔐 Supabase Security Notes

**Important**: The `.env.local` file contains the publishable key (anon key), which is safe to expose in the client. It has limited permissions by default.

- **Publishable Key**: Used for client-side operations (✅ Safe to expose)
- **Secret Key**: Should NEVER be in client code or `.env` files
- **RLS Policies**: Set up Row Level Security in Supabase for data protection

---

## ✨ Testing Checklist

- [ ] Environment variables load correctly: `npm run dev` should start without errors
- [ ] Team section appears on home page
- [ ] Team carousel animates smoothly
- [ ] Click thumbnail buttons to navigate between members
- [ ] Arrow buttons work for previous/next navigation
- [ ] Team counter updates (01/08, 02/08, etc.)
- [ ] Responsive design works on mobile
- [ ] Auth features work (signup/login if testing auth)
- [ ] No console errors

---

## 📞 Support & Troubleshooting

### Images not loading?
- Verify images exist in `/public/Team Members 2/` with names `1.png` through `8.png`
- Check browser DevTools Network tab for 404 errors
- Ensure path is correct: `/Team Members 2/1.png` (with space in folder name)

### Animations not smooth?
- Ensure GSAP is installed: `npm ls gsap`
- Check that CustomEase plugin is registered: `gsap.registerPlugin(CustomEase);`
- Browser compatibility: GSAP works in all modern browsers

### Supabase not connecting?
- Verify `.env.local` exists and has correct values
- Check Supabase dashboard is accessible: https://supabase.com/dashboard/project/tmvzkdragpvqmcrqedhk
- Restart dev server after editing `.env.local`

---

**Last Updated**: December 31, 2025  
**Project Version**: v0.0.0  
**Node/Bun Required**: Latest LTS version
