# Dragonology

A simple gallery site for illustrated book artwork.

**Live site:** [https://dragonology.github.io/](https://dragonology.github.io/)

## Add illustrations

1. Put image files in the `images/` folder.
2. Add an entry to `images.json`:

```json
[
  { "file": "my-dragon.jpg" },
  { "file": "another.jpg", "caption": "An optional caption" }
]
```

Order in the JSON file is the order on the page. Captions are optional.

## Local preview

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## GitHub Pages

In the repo on GitHub: **Settings → Pages → Build and deployment → Deploy from branch → `main` / `/ (root)`**.
