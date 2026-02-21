# Supabase 4-Account Migration Guide: MS DigiMark

This project is now configured to use **four distinct Supabase accounts** for better organization and data isolation.

---

## 🏗️ The 4-Account Architecture

### 1. Main Account (Portal & Admins)
- **Project URL:** `https://xlyzoqmifdbmrdatfbcd.supabase.co`
- **Tables:** `portal_users`, `profiles`, `user_roles`, `dashboard_stats`, `notifications`, `testimonials`, `employees`, `assets`, `admin_messages`, `admin_login_logs`, `admin_activity_logs`.
- **SQL Script:** `supabase/MIGRATION_ACC_1_MAIN.sql`

### 2. Services & Leads Account
- **Project URL:** `https://vdzbivereddaywgwjfxt.supabase.co`
- **Tables:** `leads`, `bookings`, `services`, `services_showcase`, `portfolio_projects`, `portal_users`, `portal_admins`.
- **SQL Script:** `supabase/MIGRATION_ACC_2_SERVICES.sql`

### 3. Careers & Blog Account
- **Project URL:** `https://ogeqzcluyafngfobsrqw.supabase.co`
- **Tables:** `articles`, `site_sections`, `job_openings`, `job_applications`, `application_notes`, `certifications`, `payments`, `payment_evidence`.
- **SQL Script:** `supabase/MIGRATION_ACC_3_CAREERS.sql`

### 4. Reels Account
- **Project URL:** `https://jhktcgzyfphywwxarrwm.supabase.co`
- **Tables:** `reels`.
- **SQL Script:** `supabase/MIGRATION_ACC_4_REELS.sql`

---

## 🚀 Migration Steps

### Step 1: Initialize Database Schemas
You need to run the specific SQL script for **each** project:
1.  Open the **SQL Editor** in each of your 4 Supabase Dashboards.
2.  Paste the corresponding `.sql` file content from the `supabase/` folder.
3.  Click **Run**.

### Step 2: Transfer Data (CSV Export/Import)
If you have data in old projects:
1.  **Export:** Go to the Table Editor in the OLD project -> Export to CSV.
2.  **Import:** Go to the Table Editor in the NEW corresponding project -> Import CSV.

### Step 3: Verify Environment Variables
I have already updated your local `.env` file with the correct mappings. 
**Netlify Users:** Ensure you update these variables in your Netlify Environment Variable settings as well.

---

## 🔒 Security & RLS
- Each account has its own RLS policies.
- **Main Account** handles the primary user profiles.
- **Services/Leads Account** is open for public lead submissions.
- **Reels Account** is dedicated solely to high-performance video streaming data.

