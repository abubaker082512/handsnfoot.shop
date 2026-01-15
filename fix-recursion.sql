-- Fix Recursive RLS Policy on dashboard_users
-- Run this in Supabase SQL Editor to resolve the 500 Internal Server Error

DROP POLICY IF EXISTS "Superadmins can view all profiles" ON dashboard_users;

-- Create a non-recursive policy
-- Only allow users to view their own profile, which is sufficient for AuthContext role fetching.
-- If superadmins need to view all profiles, use a SECURITY DEFINER function or separate admin API.
-- For now, we only need to secure the login.

CREATE POLICY "Superadmins can view all profiles"
ON dashboard_users FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM dashboard_users WHERE role = 'superadmin' OR role = 'admin'
  )
);
-- Wait, the above is ALSO recursive because it selects from dashboard_users!

-- CORRECT APPROACH:
-- Just allow users to view their own profile.
-- The AuthContext only fetches .eq('id', session.user.id), so "view own profile" is enough.
-- If we really need superadmin access, we should use a VIEW or function.

-- Let's just drop the bad policy and leave the "view own" policy.
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON dashboard_users;
