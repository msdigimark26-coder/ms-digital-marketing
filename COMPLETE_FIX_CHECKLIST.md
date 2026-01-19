# COMPLETE FIX CHECKLIST - Profile Image Not Storing

## THE ISSUE:
Profile images upload to Supabase Storage but the image URL doesn't save to the database.

## ROOT CAUSES (2 things need to be fixed):
1. ❌ Storage bucket policies (RLS on storage.objects) 
2. ❌ Employees table policies (RLS on employees table)

---

## ✅ SOLUTION - Follow BOTH Steps:

### STEP 1: Fix Storage Policies (Via Supabase Dashboard UI)

**Why via UI?** SQL gives "must be owner of table objects" error

1. **Go to Supabase Dashboard** → https://app.supabase.com
2. Select your project
3. Click **"Storage"** (left sidebar)
4. Click on **"employee-images"** bucket
5. Click **"Policies"** tab at the top

#### Delete Old Policies:
- Find ALL policies for employee-images
- Click trash icon to delete each one

#### Create 4 New Policies:

**Policy 1: SELECT**
- Name: `employee_images_select`
- Command: `SELECT`
- Target roles: ☑ `public`
- USING expression: `bucket_id = 'employee-images'`
- Click **Save**

**Policy 2: INSERT**
- Name: `employee_images_insert`
- Command: `INSERT`
- Target roles: ☑ `authenticated` AND ☑ `anon`
- WITH CHECK: `bucket_id = 'employee-images'`
- Click **Save**

**Policy 3: UPDATE**
- Name: `employee_images_update`
- Command: `UPDATE`
- Target roles: ☑ `authenticated`
- USING: `bucket_id = 'employee-images'`
- Click **Save**

**Policy 4: DELETE**
- Name: `employee_images_delete`
- Command: `DELETE`  
- Target roles: ☑ `authenticated`
- USING: `bucket_id = 'employee-images'`
- Click **Save**

#### Ensure Bucket is Public:
- Still in employee-images bucket page
- Look for "Public" toggle
- Make sure it's **ON** ✓

---

### STEP 2: Fix Employees Table Policies (Via SQL Editor)

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** this entire script:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Public can read employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;

-- Create new correct policies
CREATE POLICY "Public can read employees"
ON employees FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can insert employees"
ON employees FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update employees"
ON employees FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can delete employees"
ON employees FOR DELETE
TO authenticated
USING (true);
```

3. Click **"Run"**
4. Should see "Success" message

---

## 🧪 TESTING:

After completing BOTH steps above:

1. **Logout** from your admin portal
2. **Login again** (fresh session)
3. **Go to Team section**
4. **Edit an employee**
5. **Upload a new profile image**
6. **Wait for "✓ Uploaded" to appear**
7. **Click "Update Employee"**

### Expected Result:
- ✓ Toast: "Employee updated successfully"
- ✓ Form closes
- ✓ Employee list refreshes with new image
- ✓ New image visible in the grid

### If Still Not Working - Debug:
1. Open Browser Console (F12 → Console tab)
2. Try updating again
3. Look for RED error messages
4. Copy the error and send to me

---

## 📊 Verify It Worked:

Check database directly:
1. Go to Supabase → **Table Editor** → **employees**  
2. Find the employee you updated
3. Check the `image_url` column
4. Should show: `https://[your-project].supabase.co/storage/v1/object/public/employee-images/...`

---

## Common Errors & Solutions:

**Error: "new row violates row-level security policy"**
→ Step 1 not completed correctly (storage policies)

**Error: "permission denied for table employees"**  
→ Step 2 not completed correctly (table policies)

**Error: "All fields are required"**
→ Fill in Name, Title, Description before saving

**No error but image doesn't save**
→ Did you click "Update Employee" button after upload?

---

Run BOTH steps, then test! 🚀
