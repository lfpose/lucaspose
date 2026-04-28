# Ideas — lucaspose site

Parking lot for things considered but not shipped. Pull from here when revisiting.

## Footer planet — hover-to-expand

**Original concept (shelved 2026-04-28):**

The small footer planet, hovered for ~1s, fades in a much larger version of itself
as a full-viewport background, parked low so only the upper arc of a huge sphere
rises from the bottom of the screen. Mouseleave fades it out (1.4s ease) but the
big sphere keeps spinning during fade-out.

**Implementation that worked:**

- Two canvases in a single component:
  - `.planet-small` — 84×84 in footer flow, always rendering, mouse target
  - `.planet-bg` — `position: fixed; inset: 0; z-index: -1; pointer-events: none`,
    rendered only while hovered or fading
- Shared `spin`, palette, and pre-baked terrain texture so they stay synced
- CSS `transition: opacity` for the fade; `.visible` class toggled by hover handler
- Geometry per canvas:
  - small: `cy = H/2`, `r = min(W,H)/2 - 1` (full sphere centred)
  - big:   `cy = H × 1.32`, `r = min(W,H) × 0.85` (only top arc visible)
- Big buffer capped at `MAX_BG_BUF = 360` for cheap CPU; CSS upscales pixelated.
- Big canvas gets atmosphere ring + Fresnel haze; small one stays plain.

**Why shelved:**

- Felt gimmicky / over-decorated for the rest of the site's tone.
- Hover detection is awkward when the expanded canvas is a background layer
  (text on top of it) — needed care around `pointer-events`.
- Polar/ice rendering attempts looked bad; pole is a 3D-noise singularity
  (`x → 0, z → 0` at the pole) so naive `fbm3(x, y, z)` collapses to a uniform
  cap. Solved with `polarNoise(lon, sinL)` using `cos(lon·k) / sin(lon·k)` to
  break the symmetry while staying lon-seamless — but ultimately scrapped
  with the rest of the polar logic.

**To revive:**

- Last working version is in git history before the "JUST keep the small planet"
  commit. The two-canvas component is a reasonable starting point; the polar
  noise trick (commented out / removed) is reusable for any future
  spherical-noise rendering.
