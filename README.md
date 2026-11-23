# Multi-Aspect WBIP Scenes — GitHub Pages Docs

Standalone, zero-dependency static documentation site covering all **508 multi-aspect `scene@.object` groups** across Slotomania's WBIP corpus, organized into **12 diff-group pages** ordered from easiest to collapse to hardest.

## Local Preview

Open `index.html` directly in a browser, or run any static file server:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Publish to GitHub Pages

1. Create a new repository on GitHub (e.g. `multi-aspect-scenes-docs`).
2. Push this directory as the `main` branch:

```bash
git init -b main
git add .
git commit -m "docs: initial multi-aspect WBIP scenes GitHub Pages site"
git remote add origin <your-repo-url>
git push -u origin main
```

3. In GitHub **Settings → Pages**:
   - Either select **Source: Deploy from a branch** → `main` / `/ (root)`, **or**
   - Select **Source: GitHub Actions** (the included `.github/workflows/pages.yml` deploys automatically on every push to `main`).
# multi-aspect-scenes-docs
