# Mockups

Work-in-progress design mockups. **Nothing in here is live or production code** — it's
excluded from the Vercel deploy (see `.vercelignore`). The shipping site lives in the repo
root (`index.html`, `styles.css`, `app.js`).

These are early explorations and will keep changing. Drop new mockups in their own
subfolder so multiple people can iterate in parallel without collisions.

## hero-directions/

Homepage hero explorations, exported from [Claude Design](https://claude.ai/design)
([source project](https://claude.ai/design/p/6727bbe6-76e7-4989-8018-2079cca5cc42)).

`Topsail Hero Directions.dc.html` is a single canvas holding **8 hero directions**:

| | Direction | Notes |
|---|---|---|
| A | Maritime Premium (dark) | |
| B | Paper Technical (light) | |
| C | Editorial Split | |
| D | Atmospheric / Generative | ◆ recommended |
| E | ASCII Sea (technical) | |
| F | Vintage Maritime Chart (classic) | |
| G | Cinematic Seascape | ◆ image-quality, CSS-built |
| H | Painterly Classic | drop a real oil painting into the image slot |

### How to view

Open `hero-directions/Topsail Hero Directions.dc.html` directly in a browser. The bundle
ships its own runtime (`support.js`, `image-slot.js`), so the directions render and animate
standalone — no build step. Static preview PNGs are in `hero-directions/screenshots/`.

These are Claude Design **prototypes**, not production markup. When a direction is chosen,
rebuild it for real against the root site rather than copying the prototype's internal
structure. `hero-directions/HANDOFF.md` is the original export note from Claude Design.
