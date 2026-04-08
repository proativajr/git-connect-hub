
-- Step 1: Fix profiles RLS - drop recursive policy
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Add a policy so all authenticated users can read all profiles
CREATE POLICY "profiles_auth_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Step 2: Fix monday_boards - drop broken policy, replace with simple auth check
DROP POLICY IF EXISTS "boards_admin_write" ON public.monday_boards;

CREATE POLICY "boards_auth_write" ON public.monday_boards
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Step 3: Fix other tables that reference profiles with the same recursive pattern
DROP POLICY IF EXISTS "fin_config_admin_write" ON public.financeiro_config;

CREATE POLICY "fin_config_auth_write" ON public.financeiro_config
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "mvv_admin_write" ON public.mvv_config;

CREATE POLICY "mvv_auth_write" ON public.mvv_config
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Step 4: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins_read_all_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
