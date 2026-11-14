# How Cars Work — Educational Website

A free, static, intermediate-level website that teaches how cars work.
Built with plain HTML, CSS, and JavaScript. No backend, no paid APIs.

## Features

- **Homepage**: one SVG car illustration with 8 clickable systems. Hovering highlights a region and shows an info box; tapping works on mobile.
- **System pages**: introduction, image, and key components (each links to its own page).
- **Component pages**: definition, purpose, location, how it works, clickable connections to other components, and failure symptoms.
- **Credits page**: image attributions for all free-licensed photos.
- All content lives in a single JSON file: `data/systems.json`.

## Tech stack

- HTML5, CSS3, vanilla JavaScript (no frameworks)
- Inline SVG for the car illustration
- Free images from Wikimedia Commons / Unsplash
- Deploy to GitHub Pages or Vercel (free tier)

## Folder structure

```
car-education/
├── index.html            # Homepage: SVG car, system highlights
├── system.html           # Renders one system (?slug=engine)
├── component.html        # Renders one component (?system=engine&slug=crankshaft)
├── credits.html          # Image attributions
├── css/
│   └── style.css
├── js/
│   ├── app.js            # Loads JSON, renders pages
│   └── interactions.js   # SVG hover/tap highlights
├── data/
│   └── systems.json      # Single source of truth (all content)
├── images/               # Free-licensed component photos
└── README.md
```

## Deploy to GitHub Pages (free)

1. Create a new public repository on GitHub (e.g. `car-education`).
2. Upload all files from this folder to the repository (main branch).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set Source to **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then click **Save**.
6. Your site will be live at `https://<your-username>.github.io/car-education/` within a minute or two.

## Deploy to Vercel (free tier)

1. Push the folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), log in, and click **Add New → Project**.
3. Import your GitHub repository.
4. Framework preset: **Other** (or leave blank).
5. Build command: leave empty / Output directory: `./` (or leave default).
6. Click **Deploy**. Your site gets a free `*.vercel.app` URL.

## How to add more content

Edit `data/systems.json` only — no HTML or JS changes needed:

- Add a new system object to the top-level array.
- Add 3–4 components inside that system's `components` array.
- Each component can list `connections` (slugs of other components) which render as clickable links.

Images go in `images/` and must be free-licensed; add attribution on `credits.html`.
