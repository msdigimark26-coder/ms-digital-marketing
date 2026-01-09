# MS Digital Marketing - Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Method 1: Netlify CLI (Fastest)

1. **Install Netlify CLI** (if not already installed):
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**:
```bash
netlify login
```

3. **Deploy** (from project root):
```bash
netlify deploy --prod
```

---

### Method 2: Netlify Website (Drag & Drop)

1. **Build your project**:
```bash
npm run build
```

2. **Go to Netlify**: https://app.netlify.com

3. **Drag & Drop** the `dist` folder to Netlify

---

### Method 3: Git Integration (Recommended for Continuous Deployment)

1. **Push your code to GitHub/GitLab/Bitbucket**:
```bash
git init
git add .
git commit -m "Initial commit - MS Digital Marketing"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Connect to Netlify**:
   - Go to: https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider
   - Select your repository
   - Build settings will auto-detect from `netlify.toml`
   - Click "Deploy site"

---

## 📋 Build Settings (Auto-configured via netlify.toml)

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

---

## 🔧 Environment Variables

If using Supabase, add these in Netlify:

1. Go to: **Site settings** → **Environment variables**
2. Add:
   - `VITE_SUPABASE_URL` = your_supabase_url
   - `VITE_SUPABASE_ANON_KEY` = your_anon_key

---

## ✅ What's Configured Automatically

✅ SPA routing (all routes redirect to index.html)  
✅ Security headers (XSS, Content-Type, Frame protection)  
✅ Asset caching (1 year for static assets)  
✅ Optimization for images, CSS, and JS  

---

## 🌐 Custom Domain Setup

After deployment:

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Enter your domain (e.g., `www.msdigimark.com`)
4. Follow DNS configuration instructions
5. Enable **HTTPS** (automatic with Netlify)

---

## 🔍 Important: Update Domain in index.html

After getting your Netlify URL, update these files:

**File: `index.html`**
Replace all instances of:
```html
https://www.msdigimark.com
```

With your actual Netlify URL or custom domain.

---

## 📊 Post-Deployment Checklist

- [ ] Site is accessible
- [ ] All pages load correctly
- [ ] Routing works (test /about, /services, etc.)
- [ ] Admin portal loads
- [ ] Images display properly
- [ ] Forms submit correctly
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Submit sitemap to Google Search Console

---

## 🆘 Troubleshooting

**Build fails?**
- Check Node version (should be 18)
- Run `npm install` locally first
- Check build logs in Netlify

**Routes don't work?**
- Ensure `netlify.toml` is in root
- Check redirects configuration

**Images not loading?**
- Verify image paths start with `/`
- Check `public` folder structure

---

## 📱 Netlify Features Enabled

✅ **Automatic HTTPS**  
✅ **CDN distribution**  
✅ **Instant cache invalidation**  
✅ **Form handling** (if needed)  
✅ **Redirects & rewrites**  
✅ **Deploy previews** (for Git)  

---

**Your site will be live at**: `https://your-site-name.netlify.app`

🎉 **Deploy and share your amazing website!**
