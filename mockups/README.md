# Mockups

Work-in-progress design mockups. **Nothing in here is live or production code** — the whole
folder is excluded from the Vercel deploy (see `.vercelignore`). The shipping site lives in
the repo root (`index.html`, `styles.css`, `app.js`).

These are early explorations and will keep changing. Drop new mockups in their own subfolder
so multiple people can iterate in parallel.

## View them

From this `mockups/` folder, start a static server and open the gallery:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/  →  click any direction to open it full-size
```

`index.html` is a gallery of live, scaled previews of every direction. Serving (rather than
opening the file directly) is needed so the preview iframes load.

## hero-directions/

Homepage hero explorations, exported from [Claude Design](https://claude.ai/design)
([source project](https://claude.ai/design/p/6727bbe6-76e7-4989-8018-2079cca5cc42)).

**Each direction is its own standalone file** — branch, open it, and iterate on just that one
without touching the others:

| | File | Direction | Notes |
|---|---|---|---|
| A | `a-maritime-premium.html` | Maritime Premium | dark |
| B | `b-paper-technical.html` | Paper Technical | light |
| C | `c-editorial-split.html` | Editorial Split | |
| D | `d-atmospheric.html` | Atmospheric / Generative | ◆ recommended; generative canvas sea |
| E | `e-ascii-sea.html` | ASCII Sea | technical; live ASCII render |
| F | `f-vintage-chart.html` | Vintage Maritime Chart | classic |
| G | `g-cinematic-seascape.html` | Cinematic Seascape | image-quality, CSS-built |
| H | `h-painterly.html` | Painterly Classic | drop a real oil painting into the image slot |

Each file ships the Claude Design runtime (`support.js`, `image-slot.js`), so it renders and
animates standalone — no build step. The directions are 1440px wide (desktop hero).

### Other files here

- `Topsail Hero Directions.dc.html` — the **original combined canvas** holding all 8 directions,
  straight from Claude Design. Source of truth; the per-direction files above were split out of it.
- `screenshots/` — static preview PNGs from the design session.
- `uploads/` — image assets referenced by the designs (e.g. the painterly slot).
- `HANDOFF.md` — original export note from Claude Design.

These are **prototypes, not production markup**. When a direction is chosen, rebuild it for real
against the root site rather than copying the prototype's internal structure.
