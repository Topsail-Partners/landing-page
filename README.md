# Topsail

Marketing-site mockup for **Topsail**, a fictional AI implementation / forward-deployed
AI services firm in the mold of [Tenex](https://www.tenex.co), [Distyl](https://www.distyl.ai),
and [Percepta](https://www.percepta.ai).

## What's here

```
topsail/
├── index.html          # production entrypoint
├── styles.css          # site styles
├── app.js              # dot-grid canvas, scroll reveals, accordion, stat counters
├── topsail.html        # single self-contained shareable artifact
└── research/
    ├── FINDINGS.md     # competitive landscape + design brief
    └── *.png           # competitor / inspiration screenshots
```

## Run locally

```bash
python3 -m http.server 4321
# open http://localhost:4321
```

Or just open `index.html` or `topsail.html` directly in any browser. No build step,
no dependencies (fonts load from Google Fonts).

## Deploy

Vercel can deploy this as a static site from the repository root:

- Framework Preset: Other
- Root Directory: `.`
- Build Command: empty
- Output Directory: `.`

## Design

Nautical "deep-sea navy ↔ chart-paper" duotone with a signal-coral accent (`#F0653E`).
Type: Fraunces (display serif) + Inter Tight (body) + JetBrains Mono (labels). Signature
element is a cursor-reactive dot grid in the hero and manifesto. Three services:
AI Strategy / AI Transformation / AI Engineering.
