# Netlify Environment Variables Setup

## Required for Full Functionality

Your site will load, but some features (admin portal, forms, etc.) require Supabase.

### Add in Netlify Dashboard:

1. Go to: **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add these variables:

```
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### How to Get Your Supabase Credentials:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

### After Adding Variables:

1. Click **"Save"**
2. Go to **Deploys**
3. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## What Works Without Supabase:

✅ Homepage  
✅ About page  
✅ Services pages  
✅ Portfolio page  
✅ Contact page (form won't submit)  
✅ All navigation  

## What Requires Supabase:

❌ Admin portal login  
❌ Contact form submissions  
❌ Testimonials (database)  
❌ Dynamic content  

---

## Note:

The site has fallback handling, so it will load even without Supabase credentials. You'll just see empty states for database-driven content.
