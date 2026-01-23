# Fix Admin Avatar Upload Issue - Instructions

## Problem
The admin avatar upload is failing with error: **"Error uploading image: new row violates row-level security policy"**

This happens because the `admin-avatars` storage bucket doesn't exist or doesn't have the proper RLS (Row-Level Security) policies configured.

## Solution
Execute the migration SQL file to create the bucket and configure the policies.

### Steps to Fix:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/rbzbdrdbjuydkxtlmnhb/sql/new
   
2. **Copy and paste the following SQL:**

```sql
-- Create storage bucket for admin avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-avatars', 'admin-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to admin-avatars" ON storage.objects;

-- Create policies for admin-avatars bucket
-- Allow anyone to upload (you can restrict this to authenticated users if needed)
CREATE POLICY "Allow public uploads to admin-avatars" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'admin-avatars');

-- Allow anyone to view/download avatars
CREATE POLICY "Allow public access to admin-avatars" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'admin-avatars');

-- Allow anyone to update their avatars
CREATE POLICY "Allow public updates to admin-avatars" 
ON storage.objects
FOR UPDATE 
USING (bucket_id = 'admin-avatars');

-- Allow anyone to delete avatars
CREATE POLICY "Allow public delete from admin-avatars" 
ON storage.objects
FOR DELETE 
USING (bucket_id = 'admin-avatars');
```

3. **Click "RUN"** to execute the SQL

4. **Verify the bucket was created:**
   - Navigate to: https://supabase.com/dashboard/project/rbzbdrdbjuydkxtlmnhb/storage/buckets
   - You should see a bucket named `admin-avatars` in the list
   - It should be marked as Public

5. **Test the upload:**
   - Go back to your admin settings page
   - Try uploading an avatar image
   - It should now work without the RLS error

## What This Does:
- Creates a public storage bucket called `admin-avatars`
- Sets up Row-Level Security policies that allow:
  - Anyone to upload files (INSERT)
  - Anyone to view/download files (SELECT)
  - Anyone to update files (UPDATE)
  - Anyone to delete files (DELETE)

## Security Note:
These policies are permissive (allow public access). If you want to restrict uploads to only authenticated admin users, you can modify the policies later to check for authentication status.

## Alternative: Manual Creation via UI

If you prefer, you can also create the bucket manually:

1. Go to Storage: https://supabase.com/dashboard/project/rbzbdrdbjuydkxtlmnhb/storage/buckets
2. Click "Create Bucket"
3. Name: `admin-avatars`
4. Enable "Public bucket"
5. Click "Create bucket"
6. Then you still need to run the policies SQL above (just the CREATE POLICY sections)
