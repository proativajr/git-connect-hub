

## Plan: Auto-crop Logo Backgrounds + Fix uploaded_by FK Violation

### Issue 1: Logo backgrounds (checkered/white) not being removed

The uploaded PNGs have baked-in white or checkered backgrounds. CSS blend modes distort colors. The real fix is to **process the image at upload time** using the Canvas API to remove white/near-white pixels and make them transparent before uploading to Supabase Storage.

**File: `src/pages/ParceriasPage.tsx`**

Add a helper function `removeWhiteBackground(file: File): Promise<Blob>` that:
1. Loads the image into an offscreen canvas
2. Iterates through all pixels
3. Converts white/near-white pixels (R>240, G>240, B>240) to transparent (alpha=0)
4. Also detects the checkered pattern (alternating white/light-gray pixels) and removes those
5. Auto-crops the resulting image to the bounding box of non-transparent pixels
6. Returns a clean PNG blob

Call this function in `uploadLogo()` before uploading to storage, so every uploaded logo is automatically cleaned.

**File: `src/pages/ParceriasShowcasePage.tsx`**

Remove the `bg-card` and `rounded-xl` wrapper — logos will now have genuine transparency so they blend naturally with any background. Keep the container for sizing but make it transparent.

### Issue 2: uploaded_by FK violation in gente_uploads

**File: `src/pages/GenteGestaoPage.tsx`**

The document upload function (`handleUploadDocument`) uses `user?.id` from the auth context which can be null/stale. Fix:
1. Add a `supabase.auth.getUser()` guard at the start of `handleUploadDocument` (same pattern already used in `handleSaveChart`)
2. Use `authUser.id` instead of `user?.id` for both `storage_path` and `uploaded_by`
3. Add friendly Portuguese error messages for FK and constraint violations

### Files Changed

| File | Change |
|------|--------|
| `src/pages/ParceriasPage.tsx` | Add `removeWhiteBackground()` canvas processor; call before upload |
| `src/pages/ParceriasShowcasePage.tsx` | Remove bg-card wrapper, use transparent container |
| `src/pages/GenteGestaoPage.tsx` | Add auth guard to `handleUploadDocument`, use `authUser.id` |

