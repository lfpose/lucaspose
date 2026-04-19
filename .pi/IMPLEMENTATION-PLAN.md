# Implementation Plan

## Phase 1: Bug #1 - Fix Text Glitch Resolution (High Priority)

### Investigation Steps
1. Examine the `scramble()` function in `Base.astro` more carefully
2. Test with different timing scenarios to identify where state gets stuck
3. Check if `busy` flag management has race conditions
4. Verify the `t >= 1` completion condition is always reached

### Proposed Fix Approach
- Add a safety fallback: if animation completes with wrong text, force-set to target
- Ensure `el.textContent = target` is always called on completion
- Consider adding a cleanup/verification pass after animation
- Add debug logging to track stuck states during development

### Files to Modify
- `src/layouts/Base.astro` - Main glitch scramble script section

### Estimated Time
1-2 hours

---

## Phase 2: Bug #2 - Replace Glitch Symbols (Medium Priority)

### Implementation Steps
1. Define new `GLITCH` constant with roundy/dot-like symbols
2. Replace `GLITCH = '!?#_-+=/\\|<>[]{}~^'` in both locations
3. Test the visual effect to ensure it's softer but still glitchy

### Proposed Symbol Set
```
GLITCH = '·•○●◎⊙◯⚪⚫°∙∘◦';
```

### Files to Modify
- `src/layouts/Base.astro` - Two locations:
  1. Main glitch scramble script (line with `const GLITCH = '!?#_-+=/\\|<>[]{}~^';`)
  2. Ticker canvas script (same line in that script block)

### Estimated Time
15-30 minutes

---

## Phase 3: Bug #3 - Replace Background with Arrow Grid (Medium Priority)

### Implementation Steps

#### 3.1 Design Decisions
- Choose implementation approach: **Canvas-based** (recommended for performance with many arrows)
- Grid spacing: ~40-60px between arrows
- Arrow style: Simple directional triangle or chevron
- Color scheme: Match existing gradient or use ticker spectrum

#### 3.2 Canvas Implementation Plan
1. Create new arrow grid canvas to replace `.bg-orb` divs
2. Calculate grid based on viewport size
3. On each frame:
   - Clear canvas
   - For each arrow position:
     - Calculate angle to mouse
     - Determine color based on position/spectrum
     - Draw rotated arrow
4. Handle window resize to recalculate grid
5. Keep film grain overlay as-is

#### 3.3 Color Strategy
- Option A: Position-based gradient matching original orb colors
- Option B: Spectrum-based like ticker (270° → 0° hue rotation)
- Recommendation: Use spectrum with mouse distance influence

#### 3.4 Arrow Drawing
```
Draw arrow at position (x, y) with rotation θ:
  - Size: ~12-16px
  - Shape: Simple triangle pointing right, then rotated
  - Stroke/fill based on theme
```

### Files to Modify
- `src/components/LightCanvas.astro` - Replace orb divs and CSS with canvas implementation

### Estimated Time
2-3 hours

---

## Phase 4: Bug #4 - Fix Layout Shift During Glitch (High Priority)

### Investigation Steps
1. Identify which elements are affected (paragraphs, list items, footer)
2. Measure height behavior during glitch animation
3. Test if equal-width symbols alone solve the issue
4. Verify if container height fix is needed

### Proposed Fix Approach
**Combined Solution** (recommended):
1. **Replace with equal-width symbols**: Use symbols with consistent widths
   - Candidates: `°○●●⚫⚪` (circles have consistent width in most fonts)
   - Or: `·•∙∘◦` (if dots have similar width)
2. **Add container height preservation**:
   ```css
   .glitch-safe {
     min-height: 1em; /* or more for multi-line */
   }
   ```
3. **Alternative**: Measure original element height before scramble and set as `min-height`

### Implementation Strategy
Since Bug #4 and Bug #2 both involve changing the GLITCH symbol set, we'll combine them:
- Choose symbols that are BOTH roundy/soft AND equal-width
- Apply height preservation as a safety measure
- Test extensively on multi-line paragraphs

### Proposed Combined Symbol Set
```
GLITCH = '°○●●⚫⚪';  // All circles, likely equal-width, roundy aesthetic
```

### Files to Modify
- `src/layouts/Base.astro` - Both GLITCH definitions (same as Bug #2)
- `src/layouts/Base.astro` - Add CSS for height preservation
- Optionally: Add JS to pre-measure and set min-height on affected elements

### Estimated Time
30-45 minutes (combined with Bug #2)

---

## Recommended Execution Order

1. **Bug #2 + Bug #4 combined** (30-45 min) - Quick win, solves both symbol aesthetic AND layout shift
2. **Bug #1 second** (1-2 hours) - Critical fix, focus when fresh
3. **Bug #3 last** (2-3 hours) - Most complex, needs focused time

**Total Estimated Time**: 4-6.5 hours

### Rationale for Combined Phase
- Both bugs involve the same GLITCH symbol constant
- Equal-width symbols solve both the aesthetic AND layout issues
- Height preservation is a safety net that doesn't conflict with symbol changes
- More efficient to do together than separately

---

## Testing Plan

After each fix:
1. Test in both dark and light themes
2. Test text scramble on load and hover
3. Test arrow grid with mouse movement
4. Check performance (DevTools Performance tab)
5. Test responsive behavior (resize window)
6. Cross-browser check (Chrome, Firefox, Safari)

---

## Rollback Strategy

- Keep original code commented out during development
- Git commit after each completed phase
- Easy to revert individual changes
