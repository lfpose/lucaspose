# Bug Specifications

## Bug #1: Text Glitch Fails to Resolve Correctly

**Status**: 🔴 High Priority

**Description**: 
The glitch scramble effect sometimes fails to resolve text to its correct final state. After the animation completes, the text remains in an invalid state with random glyphs instead of the original text.

**Example**:
- Expected: `Hola, soy Lucas`
- Actual: `Hola, soy Luc$#` (stuck in invalid state)

**Affected Components**:
- `Base.astro` - "Glitch scramble for headings & links" script
- Affects: `<h1>`, `<h2>`, `<footer>` elements on load
- Affects: Hover scramble on `<h1>`, `<h2>`, `<a>`, `<p>`, `<li>`, `<footer>`

**Root Cause Analysis Needed**:
The `scramble()` function in Base.astro reveals text left-to-right with random glyphs. The animation logic may have:
- Timing issues where `t >= 1` condition isn't reliably reached
- Race conditions with rapid hover events
- Incomplete state cleanup between animations
- The `busy` flag state management may be flawed

**Acceptance Criteria**:
- [ ] Text always resolves to the exact original text after animation
- [ ] No stray glyphs remain after animation completes
- [ ] Rapid hover events don't cause stuck states
- [ ] Both load-time scramble and hover scramble work reliably

---

## Bug #2: Glitch Symbol Set Too Harsh

**Status**: 🟡 Medium Priority

**Description**:
The current glitch symbol set `GLITCH = '!?#_-+=/\\|<>[]{}~^'` uses angular and aggressive characters. User wants softer, roundy symbols and/or dot-like symbols for a more pleasant aesthetic.

**Current Symbol Set**:
`!?#_-+=/\\|<>[]{}~^`

**Chosen Symbol Set**:
- **Dot-like + punctuation**: `".,'`·•∙-+<>[]~^*&"` - small dots, punctuation, and geometric symbols

**Affected Components**:
- `Base.astro` - Two locations where GLITCH is defined:
  1. Main glitch scramble script (headings/links/footer)
  2. Ticker canvas script

**Acceptance Criteria**:
- [ ] New symbol set defined and used consistently
- [ ] Symbols are visually softer/roundier
- [ ] Text layout height is preserved during scramble
- [ ] Both glitch scripts use the same symbol set

---

## Bug #3: Background Should Be Interactive Arrow Grid

**Status**: 🟡 Medium Priority

**Description**:
The current background uses drifting gradient orbs (`LightCanvas.astro` with `.bg-orb` CSS animations). User wants to replace this with an interactive grid of small arrows that point toward the mouse cursor, with colors matching the gradient spectrum.

**Current Implementation**:
- Three CSS-animated orbs (`.bg-orb-1`, `.bg-orb-2`, `.bg-orb-3`)
- Gradients: hsl(262,58%,20%), hsl(200,52%,16%), hsl(168,46%,14%) in dark mode
- Pure CSS animations with blur effects
- Film grain overlay canvas on top

**Desired Implementation**:
- Grid of small arrows covering the viewport
- Each arrow rotates to point toward mouse position
- Arrow colors follow the gradient spectrum (violet → blue → green → yellow → orange → red)
- Colors should match or complement the existing gradient colors
- Film grain overlay should remain

**Technical Approach Options**:
1. **Canvas-based**: Draw arrows on canvas, update on mouse move/requestAnimationFrame
2. **SVG-based**: Grid of SVG arrows, update transform via CSS/JS
3. **CSS-based**: Grid of Unicode arrows (→ ↗ ↑ ↖ ← ↙ ↓ ↘) with rotation transforms

**Color Mapping**:
- Use existing gradient hues: 262° (purple), 200° (blue), 168° (cyan/teal)
- Or use spectrum from ticker: 270° → 0° (violet through rainbow)
- Arrow color could be based on position and/or distance from mouse

**Affected Components**:
- `LightCanvas.astro` - Replace orb divs with arrow grid implementation
- Keep grain canvas as-is

**Acceptance Criteria**:
- [ ] Grid of arrows covers the viewport
- [ ] Arrows point toward mouse cursor
- [ ] Arrow colors follow gradient/spectrum
- [ ] Performance is acceptable (60fps target)
- [ ] Film grain overlay remains
- [ ] Works in both dark and light themes
- [ ] Responsive to window resize

---

## Bug #4: Layout Shift During Glitch Animation

**Status**: 🔴 High Priority

**Description**: 
When the glitch scramble effect is active on paragraphs and other multi-line text, the random glyphs sometimes have different widths than the original characters, causing the text to wrap differently. This results in the content expanding from N lines to N+1 lines during the glitch animation, creating an annoying layout shift/jump.

**Example**:
- Original text: "Soy ingeniero de software en Santiago, Chile." (3 lines at current width)
- Glitched version: Same text with random symbols (4 lines due to different character widths)
- Result: Content below jumps down, then back up when animation completes

**Root Cause**:
The current `scramble()` function replaces characters one-to-one without considering their rendered width. In variable-width fonts (like Space Grotesk), different glyphs have different advance widths, causing different line wrapping.

**Solution Implemented**:
User decided to use a **humanist monospace font** (IBM Plex Mono) which is less robotic than typical monospace fonts while still providing consistent character widths.

**Original Proposed Solutions** (for reference):

1. **Pre-measure and fix container height**:
   - Measure the rendered height of the original text before scrambling
   - Set `min-height` or `height` on the element to prevent shrinkage
   - Allow overflow to be hidden if needed

2. **Width-matched symbol substitution**:
   - Pre-measure advance width of each character in the original text
   - When scrambling, choose a glitch symbol with similar width to the original
   - Requires measuring each GLITCH symbol's advance width

3. **Use equal-width glitch symbols**:
   - Choose symbols that all have approximately the same width
   - Best candidates: `°○●●⚫⚪` (circles have consistent width)
   - Or all dots: `·•∙∘◦` (if they have similar width)

4. **Preserve original spacing**:
   - Keep the original spaces and newlines exactly as-is (already done)
   - Use `white-space: pre-wrap` to preserve line breaks
   - Combine with fixed container height

**Recommended Approach**: 
Combine **Solution 1** (fix container height) with **Solution 3** (use equal-width symbols). This is the most robust solution that doesn't require complex per-character measurement.

**Affected Components**:
- `Base.astro` - Glitch scramble scripts
- `Base.astro` - CSS styles for affected elements (`p`, `li`, `h1`, `h2`, etc.)
- Specifically affects multi-line text: paragraphs, list items, footer

**Acceptance Criteria**:
- [ ] Text height remains constant during glitch animation
- [ ] No layout shift/jump when scrambling
- [ ] Solution works without monospace font
- [ ] Works for all affected elements (p, li, h1, h2, footer)
- [ ] Responsive - handles window resize gracefully
- [ ] Doesn't break existing functionality

---

## Implementation Priority

1. **Bug #1** (High) - Critical UX issue, text should always resolve correctly
2. **Bug #4** (High) - Layout shift is very annoying, needs fix
3. **Bug #2** (Medium) - Aesthetic improvement, can combine with Bug #4
4. **Bug #3** (Medium) - Feature replacement, requires new implementation
