

## Plan: Size Normalization + PCO Chart Fix

This prompt has two sections. Here's a concise breakdown of what will be done.

---

### Section 1: Global Size Normalization Between Themes

**Goal**: Zero layout shift when toggling themes. Only colors change between themes, never sizes.

**What we'll do**:

1. **Clean up CSS variables in `src/index.css`**: Remove any size-related properties from `[data-theme="dark"]` and `[data-theme="light"]` selectors. Currently the theme selectors only have color tokens (confirmed by audit), so this is already mostly correct. We'll add the **theme-neutral sizing system** as `:root` variables.

2. **Add sizing CSS custom properties** to `:root` in `index.css`: sidebar widths, nav item sizes, card/input/button dimensions, logo sizes, typography scale — all in one place, shared by both themes.

3. **Add utility CSS classes** (`.sidebar`, `.nav-item`, `.sidebar-section-title`, `.logo-sidebar`, `.metric-card`, `.form-input`, `.btn`) that reference the new variables.

4. **Update `DashboardLayout.tsx`**: Apply the new CSS classes/variables for sidebar width, nav items, section titles, and logos instead of hardcoded Tailwind values.

5. **Verify no theme-conditional sizing exists**: Already confirmed — no `theme === 'dark' ? 'Xpx' : 'Ypx'` patterns found in the codebase.

6. **Fix transition rule**: Ensure the global `*` transition only covers color properties (already the case in current CSS).

---

### Section 2: PCO Chart Builder Definitive Fix

**Goal**: Charts save and render correctly with proper validation and DB compatibility.

**Database**: The `gente_uploads` table already has `metadata` (JSONB), `folder_id` (UUID), and `position` (INT) columns. The `pco-documentos` storage bucket exists. No SQL migration needed.

**What we'll do**:

1. **Rewrite `ChartBuilderModal.tsx`**: Replace the current modal with the new inline form design using horizontal pills for chart type selection, Excel-style data rows, toggle switches, color picker, live preview, and proper validation. The form state uses `{ title, type, color, showLegend, showLabels, rows: [{label, value}] }`.

2. **Update `ChartRenderer.tsx`**: Update the `ChartConfig` type to support the new chart type names (`barras`, `barras_h`, `linhas`, `area`, `pizza`, `rosca`) and render them accordingly. Keep backward compatibility with old type names.

3. **Update `GenteGestaoPage.tsx`**: 
   - Replace `handleSaveChart` with the new robust version that validates data, checks auth, and handles errors gracefully
   - Add `ChartCard` component for rendering saved charts with edit/delete actions
   - Ensure `storage_path` is set to `''` (empty string, not null) since the column is NOT NULL
   - Add delete function with optimistic UI and rollback

4. **Imports**: Add `Recharts` components (`ResponsiveContainer`, `PieChart`, `BarChart`, `LineChart`, `AreaChart`, etc.) and Lucide icons (`Plus`, `X`, `Pencil`, `Trash2`) as needed.

---

### Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Add `:root` sizing variables + utility CSS classes |
| `src/layouts/DashboardLayout.tsx` | Apply CSS variable-based sizing |
| `src/components/pco/ChartBuilderModal.tsx` | Complete rewrite with new form UI |
| `src/components/pco/ChartRenderer.tsx` | Support new chart type names |
| `src/pages/GenteGestaoPage.tsx` | New save/delete/render logic for charts |

No database migration needed — all columns and buckets already exist.

