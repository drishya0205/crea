-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow valid users to read all profiles (to see who owns tasks)
CREATE POLICY "Allow reading user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow updating own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow inserting their own profile (handled by trigger usually, but good fallback)
CREATE POLICY "Allow inserting own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
