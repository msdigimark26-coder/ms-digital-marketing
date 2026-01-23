# 🌐 How to Connect msdigimark.com to Your Netlify Site

## Current Status:
- ✅ Your React site is deployed on Netlify: https://glittering-youtiao-2c85c8.netlify.app
- ✅ All favicon files are working on Netlify
- ❌ Your domain (msdigimark.com) is still pointing to Wix

## Goal:
Connect www.msdigimark.com → Netlify site (so favicons work on your real domain)

---

## METHOD 1: Add Custom Domain in Netlify Dashboard (EASIEST)

### Step 1: Log into Netlify
1. Go to: https://app.netlify.com
2. Click on your site: "glittering-youtiao-2c85c8"

### Step 2: Add Custom Domain
1. Click "Domain settings" in the top menu
2. Click "Add custom domain" or "Add a domain"
3. Enter: `msdigimark.com`
4. Click "Verify"
5. Netlify will check if you own the domain

### Step 3: Update DNS Records
Netlify will show you which DNS records to add. You'll need to:

**Option A: Use Netlify DNS (Easiest)**
1. Transfer DNS management to Netlify
2. Follow Netlify's instructions to update nameservers at your domain registrar
3. Typical nameservers will be like:
   - `dns1.p03.nsone.net`
   - `dns2.p03.nsone.net`
   - `dns3.p03.nsone.net`
   - `dns4.p03.nsone.net`

**Option B: Keep Current DNS Provider**
Add these records at your current DNS provider (where you registered msdigimark.com):

**For Root Domain (msdigimark.com):**
```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's load balancer IP)
```

**For WWW Subdomain (www.msdigimark.com):**
```
Type: CNAME
Name: www
Value: glittering-youtiao-2c85c8.netlify.app
```

### Step 4: Enable HTTPS
1. After DNS propagates (5 minutes to 48 hours)
2. Netlify will auto-provision SSL certificate
3. Enable "Force HTTPS" in domain settings

---

## METHOD 2: Use Netlify CLI (Alternative)

Run these commands:

```bash
# Add custom domain
/Users/britto/.npm-global/bin/netlify domains:add msdigimark.com

# This will guide you through the process
```

---

## WHERE TO UPDATE DNS RECORDS?

You need to find where your domain is registered. Check these common providers:

### GoDaddy:
1. Go to: https://dcc.godaddy.com/domains
2. Find msdigimark.com → Click "DNS"
3. Add/Update the A and CNAME records shown above

### Namecheap:
1. Go to: https://ap.www.namecheap.com/domains/list/
2. Find msdigimark.com → Click "Manage"
3. Go to "Advanced DNS" tab
4. Add/Update the records

### Cloudflare:
1. Go to: https://dash.cloudflare.com
2. Select msdigimark.com
3. Go to "DNS" tab
4. Add/Update the records

### Google Domains / Squarespace Domains:
1. Go to domains.google.com or domains.squarespace.com
2. Find your domain → DNS settings
3. Add/Update the records

---

## HOW TO CHECK DNS PROPAGATION

After updating DNS, check if changes have propagated:

### Online Tool:
- Visit: https://www.whatsmydns.net
- Enter: `msdigimark.com`
- Select: A record
- Should show: `75.2.60.5`

### Command Line:
```bash
# Check A record
dig msdigimark.com

# Check CNAME record
dig www.msdigimark.com
```

Should return Netlify's IP/servers.

---

## TIMELINE

| Action | Time Required |
|--------|---------------|
| Add domain in Netlify | 2 minutes |
| Update DNS records | 5 minutes |
| DNS propagation | 5 minutes - 48 hours |
| SSL certificate | Automatic after DNS |
| Total estimated time | 30 minutes - 2 days |

---

## VERIFICATION

After DNS changes propagate, test:

```bash
curl -I https://www.msdigimark.com/favicon-32x32.png
```

Should return:
```
HTTP/2 200 ✅
server: Netlify ✅
```

NOT:
```
HTTP/2 404 ❌
server: Pepyaka (Wix) ❌
```

---

## TROUBLESHOOTING

### "Domain already registered on Netlify"
- The domain is claimed by another Netlify account
- Contact Netlify support or use a different email

### "DNS not configured correctly"
- Wait longer (up to 48 hours)
- Double-check DNS records match exactly
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)

### "SSL certificate not provisioning"
- Ensure DNS is fully propagated
- Check "Verify DNS configuration" in Netlify
- Wait a few hours for auto-provision

---

## IMPORTANT: Wix vs Netlify

Currently you have:
- **Wix site** at msdigimark.com (old)
- **Netlify site** at glittering-youtiao-2c85c8.netlify.app (new)

When you point the domain to Netlify:
- ⚠️ The Wix site will NO longer be accessible at msdigimark.com
- ✅ Your new React site will be at msdigimark.com
- ✅ All favicons will work on your custom domain

**Make sure you want to replace the Wix site before proceeding!**

---

## QUICK START COMMANDS

1. **Log into Netlify:**
   ```bash
   /Users/britto/.npm-global/bin/netlify login
   ```

2. **Add domain:**
   ```bash
   /Users/britto/.npm-global/bin/netlify domains:add msdigimark.com
   ```

3. **Check status:**
   ```bash
   /Users/britto/.npm-global/bin/netlify status
   ```

---

## NEED HELP?

- Netlify Docs: https://docs.netlify.com/domains-https/custom-domains/
- Netlify Support: https://www.netlify.com/support/
- DNS propagation checker: https://www.whatsmydns.net

---

**Once DNS is updated and propagated, your favicons will appear on msdigimark.com!** 🎉
