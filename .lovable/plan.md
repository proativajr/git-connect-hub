

## Root Cause Analysis

There are **two database-level issues** blocking both Monday boards and PCO charts:

### Issue 1: Infinite recursion on `profiles` table (CRITICAL)
The RLS policy `profiles_admin_all` queries the `profiles` table itself to check if the user is admin:
```sql
EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
```
This causes PostgreSQL error `42P17: infinite recursion detected in policy for relation "profiles"`. This cascades to **every table** that has policies referencing `profiles`, including `monday_boards` (via `boards_admin_write` policy).

### Issue 2: `user_roles` table does not exist
The `AuthContext` queries `user_roles` on every login, returning a 404 error. The `has_role` function also references this non-existent table.

### Impact
- `profiles` query fails on every page load (500 error)
- `monday_boards` SELECT and INSERT both fail (500 error) because `boards_admin_write` references `profiles`
- `user_roles` query fails (404 error)
- Charts (`gente_uploads`) work at the DB level (returns 200) but may have UI issues

---

## Plan

### Step 1 -- Fix `profiles` RLS policies (SQL migration)
- Drop the recursive `profiles_admin_all` policy
- Replace with a `SECURITY DEFINER` function that checks admin status without triggering RLS
- Create new policy using the security definer function

### Step 2 -- Fix `monday_boards` write policy (SQL migration)
- Drop `boards_admin_write` which references the broken `profiles` policy
- Replace with a simple `auth.role() = 'authenticated'` policy so any logged-in user can create/update boards

### Step 3 -- Create `user_roles` table (SQL migration)
- Create the `user_roles` table with proper RLS
- Seed the current user as admin
- This fixes the 404 errors from `AuthContext.fetchRole()`

### Step 4 -- Update `AuthContext` to handle missing `user_roles` gracefully
- Add error handling so that if `user_roles` query fails, `isAdmin` defaults to `false` instead of breaking the app

All SQL changes in a single migration. One code file change (`AuthContext.tsx`).

