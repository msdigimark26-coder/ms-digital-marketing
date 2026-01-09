-- FIXED SCRIPT: Allow public uploads (to bypass auth requirement for this specific use case)

-- 1. Remove the old strict policy
DROP POLICY IF EXISTS "Notification Images Auth Upload" ON storage.objects;

-- 2. Add a new policy that allows uploads to this specific bucket WITHOUT strict auth token check
CREATE POLICY "Notification Images Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'notification-images' );

-- 3. Ensure public read access is also allowed (re-applying to be safe)
DROP POLICY IF EXISTS "Notification Images Public Read" ON storage.objects;
CREATE POLICY "Notification Images Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'notification-images' );

-- 4. Allow updates and deletes (if needed, simplified for now)
DROP POLICY IF EXISTS "Notification Images Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Notification Images Auth Delete" ON storage.objects;

CREATE POLICY "Notification Images Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'notification-images' );

CREATE POLICY "Notification Images Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'notification-images' );
