

## Plan

### What's happening
1. **Jaws Chat endpoint**: The SharkChat component currently points to `/functions/v1/shark-chat`. The user wants it to point to `/functions/v1/jaws-chat`. There is no `jaws-chat` edge function in the codebase — only `shark-chat` exists. I need to either rename the function or create a new one.

2. **Monday boards and charts**: After investigating the database, RLS policies, and application code, the previous migration successfully fixed the RLS recursion issues. The DB has no errors in recent logs. The boards and columns exist and are properly seeded. The insert logic in both `MondayBoardSupabase.tsx` and `GenteGestaoPage.tsx` looks correct. The errors the user experienced were likely from before the last migration was applied and should now be resolved.

### Changes

#### Step 1 -- Create `jaws-chat` edge function
- Create `supabase/functions/jaws-chat/index.ts` with the same logic as `shark-chat/index.ts`
- Use the secret `jaws-chat` (already exists in Supabase secrets) as the Gemini API key name
- Keep the same request/response format: `{ message, history }` -> `{ reply }`

#### Step 2 -- Update SharkChat component
- Change `CHAT_URL` from `/functions/v1/shark-chat` to `/functions/v1/jaws-chat`
- Line 10 in `src/components/SharkChat.tsx`

#### Step 3 -- Deploy and test
- Deploy the `jaws-chat` edge function
- Test it with curl to verify it works

#### Step 4 -- Verify Monday boards and charts
- Navigate to a Monday board page and test creating an item
- Navigate to Gente e Gestao page and test creating a chart
- If errors persist, capture and fix them

### Technical details
- The `jaws-chat` secret already exists in Supabase — it will be used as `Deno.env.get("jaws-chat")` or mapped to `API_KEY_GEMINI`
- The edge function format matches the user's specification: body `{ message: string, history: GeminiMsg[] }`, response `{ reply: string }`
- No database changes needed — the RLS fixes from the last migration resolved the insert issues

