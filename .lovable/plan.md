

## Plan: Fix Parcerias Logo Background + Chart Save Bug

### Issue 1: Parcerias Logo Background

The current code wraps logos in a white `rounded-2xl bg-white` container, which just covers the checkered pattern with a white box — it doesn't remove it. The checkered pattern is baked into the uploaded image itself (a PNG with a fake transparency grid).

**Fix**: Remove the white box. Instead, use CSS to visually eliminate the checkered pattern:
- Use `mix-blend-mode: multiply` on the `<img>` tag itself (not the container). This makes white pixels transparent against any background.
- For dark theme, invert the image first then apply `mix-blend-mode: screen` — or simpler: just keep a neutral container with `bg-card` that matches the page and apply `mix-blend-multiply` which works well on light backgrounds, with a dark-theme override using `dark:mix-blend-screen dark:invert`.

**File**: `src/pages/ParceriasShowcasePage.tsx`
- Remove `rounded-2xl bg-white p-3 shadow-sm` from the logo wrapper
- Add to the `<img>`: `mix-blend-multiply dark:invert dark:mix-blend-screen` — this makes white backgrounds vanish in both themes

### Issue 2: Chart Save Constraint Error

The DB constraint on `gente_uploads.tipo` only allows `'pdi' | 'pco' | 'grafico'`. The code uses `"chart"` and `"documento"` which both violate this constraint.

**File**: `src/pages/GenteGestaoPage.tsx`
- Change `tipo: "chart"` to `tipo: "grafico"` in the insert (line 125)
- Change `tipo: "documento"` to `tipo: "pco"` in the document upload insert (line 183)
- Update fetch queries: `.eq("tipo", "chart")` → `.eq("tipo", "grafico")` (line 50) and `.eq("tipo", "documento")` → `.eq("tipo", "pco")` (line 51)
- Store visual chart type in `metadata.chart_type` field (already partially done via `chartType` key — rename to `chart_type` for consistency with the prompt)

**File**: `src/components/pco/ChartRenderer.tsx` — no changes needed, it already reads `chartType` from config

**Optional**: Create `src/types/uploads.ts` with `UploadTipo`, `ChartTipo`, and `GraficoMetadata` types for type safety.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/ParceriasShowcasePage.tsx` | Replace white box with blend-mode CSS for transparent logos |
| `src/pages/GenteGestaoPage.tsx` | Fix `tipo` values to match DB constraint; restructure metadata |
| `src/types/uploads.ts` | New file with upload type definitions |

