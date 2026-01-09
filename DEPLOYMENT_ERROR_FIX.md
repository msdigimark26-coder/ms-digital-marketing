# Deployment Error - Troubleshooting Guide

## Error: "Oops! Something went wrong"

This error appears when the React app crashes on load. Here's how to fix it:

---

## 🔍 Most Common Causes & Solutions:

### 1. **Missing Environment Variables** (Most Likely)

**Symptom**: Site shows error page with "Oops! Something went wrong"

**Solution**:
1. Go to Netlify Dashboard → **Site settings** → **Build & deploy** → **Environment variables**
2. Add these variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Trigger a new deploy** (clear cache and redeploy)

**Alternative** (if you don't have Supabase yet):
The site should work without Supabase using mock data. If it doesn't, there's a different issue.

---

### 2. **Build Issues**

**Check build logs** in Netlify:
- Look for TypeScript errors
- Look for missing dependencies
- Look for import errors

**Fix**: Rebuild locally first:
```bash
npm install
npm run build
```

If build fails locally, fix errors before deploying.

---

### 3. **Browser Console Errors**

**Steps**:
1. Open your deployed site
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for red error messages
5. Take a screenshot and share it

---

### 4. **Dependency Issues**

**Solution**: Clear Netlify build cache
```bash
# In Netlify Dashboard
Deploys → Trigger deploy → Clear cache and deploy site
```

---

## 🛠️ Quick Fixes to Try:

### Fix 1: Add Environment Variables
```bash
# In Netlify Dashboard → Environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Fix 2: Check Node Version
Ensure `.nvmrc` exists with:
```
20.19.0
```

### Fix 3: Verify Build Settings
In `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "20.19.0"
```

### Fix 4: Clear Cache and Redeploy
1. Netlify Dashboard → Deploys
2. Click dropdown → "Clear cache and deploy site"

---

## 📊 Debugging Steps:

1. **Check Netlify Build Logs**:
   - Did the build succeed?
   - Are there any warnings?

2. **Check Browser Console**:
   - What's the actual JavaScript error?
   - Which component is failing?

3. **Test Locally**:
   ```bash
   npm run build
   npm run preview
   ```
   Does it work locally?

4. **Check Network Tab**:
   - Are there failing API calls?
   - Missing assets (images, fonts)?

---

## 🚑 Emergency Fix (Deploy Without Dynamic Features):

If you need the site live ASAP without admin/database features:

1. The site should still load basic pages
2. Error means something's breaking on initialization
3. Likely in a useEffect or data fetching

**Temporary workaround**:
- Site should have fallbacks for missing Supabase
- Check if any components are missing error handling

---

## 📝 Information Needed for Support:

If the issue persists, provide:

1. **Netlify build logs** (screenshot or text)
2. **Browser console errors** (F12 → Console tab)
3. **Network errors** (F12 → Network tab → filter by "failed")
4. **Your Netlify site URL**
5. **Screenshot of the error page**

---

## ✅ Expected Behavior After Fix:

- Homepage loads with animations
- Navigation works
- All pages accessible
- Forms visible (may not submit without Supabase)
- Admin portal shows login (requires Supabase to work)

---

**Next Steps**: 
1. Add environment variables
2. Clear cache and redeploy
3. Check browser console for specific error
4. Share console error if issue persists
