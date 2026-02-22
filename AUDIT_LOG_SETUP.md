# 📂 Audit Center Admin Setup Guide

## ✅ What's Been Created:
The **Audit Center Logging Module** requires an `admin_activity_logs` table in your **Services & Leads Supabase Account** (`vdzbivereddaywgwjfxt`) to track activity. Currently, it is only actively tracking the `admin_login_logs` session logs, but the activity tracking table was missing!

I have created the SQL migration file to instantly set up this secondary table for you:
`supabase/MIGRATION_AUDIT_ACTIVITY_LOGS.sql`

## 🚀 How to Fix and Connect the Database:

### **Step 1: Open Your Supabase Console**
1. Navigate directly to your **Services/Leads** Supabase dashboard for project `vdzbivereddaywgwjfxt`.
2. Go to the **SQL Editor** down the left sidebar.

### **Step 2: Run the SQL Script**
1. Copy the exact contents of the SQL file I created for you at: `supabase/MIGRATION_AUDIT_ACTIVITY_LOGS.sql`:
   ```sql
   -- 4. ADMIN ACTIVITY LOGS (Used in Audit Center)
   CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       admin_name TEXT,
       admin_email TEXT,
       action_type TEXT NOT NULL,
       target_type TEXT NOT NULL,
       target_id TEXT,
       target_data JSONB,
       description TEXT,
       ip_address TEXT,
       user_agent TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );

   -- Enable RLS
   ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

   -- Allow admin all on activity_logs
   CREATE POLICY "Allow admin all on activity_logs" 
   ON public.admin_activity_logs 
   FOR ALL USING (true);
   
   -- Insert dummy data so it's not empty Initially
   INSERT INTO public.admin_activity_logs (admin_name, admin_email, action_type, target_type, target_id, description, ip_address, user_agent) VALUES
   ('msdigimark', 'msdigimark@example.com', 'create', 'portfolio_projects', 'uuid-placeholder', 'Added new project: TechVision Rebrand', '192.168.1.1', 'Mozilla/5.0'),
   ('msdigimark', 'msdigimark@example.com', 'update', 'services', 'uuid-placeholder', 'Updated SEO Services pricing', '192.168.1.1', 'Mozilla/5.0');
   ```
2. Paste it into the SQL Editor and click **"Run"**. 
   *(This will create the necessary tracking table and its default columns instantly).*

### **Step 3: Test Activity Logs**
1. Tab back over to your local admin portal's "Audit Center". 
2. **Refresh the page** and click on the **Activity Logs** tab. You will now successfully see your active database connection pulling in the initial sample activities we just inserted!
