
## Plan: Reduce dark theme sidebar logo to match light theme size

### Current behavior
In `src/layouts/DashboardLayout.tsx` line 190, the sidebar logo uses different sizes per theme:
- Light: `w-10` (collapsed) / `w-16` (expanded)
- Dark: `w-40` (collapsed) / `w-64` (expanded) — much larger

### Change
Use the same Tailwind sizes regardless of theme:
```tsx
className={`transition-all duration-300 ${collapsed && !isMobile ? "w-10" : "w-16"}`}
```

This removes the per-theme width branching entirely while keeping the conditional `src` (color logo for light, dark icon for dark).

### Memory update
The rule `mem://style/theme-system` currently states the dark logo should be bigger. Update it to reflect the new equal-sizing decision so future sessions don't reintroduce the disparity.

### Files to change
| File | Change |
|------|--------|
| `src/layouts/DashboardLayout.tsx` | Line 190: unify width classes for both themes |
| `mem://style/theme-system` | Reflect equal logo sizing across themes |
