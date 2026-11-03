# Jabulile Mashibini — Developer Portfolio

Personal portfolio website of **Jabulile Mashibini** — Azure-certified software engineering
professional and technical facilitator, targeting junior roles in **DevOps, Cloud, Software
Engineering, and Full-Stack Development**.

**Live site:** [jabulile1704.github.io](https://jabulile1704.github.io/)

## Tech Stack

- **React 19** + **Vite** — component-based SPA
- **CSS custom properties** — light and dark themes, no CSS framework
- **Inline SVG** — the interactive transit map in `src/components/TransitMap.jsx`
- **GitHub Pages** — hosting
- **GitHub Actions** — CI/CD (build + deploy on every push to `main`)

## Project Structure

```
├── .github/workflows/    # GitHub Pages CI/CD pipeline
├── index.html            # Vite entry point
├── src/
│   ├── data.js           # ✏️ All portfolio content — edit here
│   ├── App.jsx           # Section layout
│   ├── index.css         # Design system & styles
│   └── components/       # Header, Hero, TransitMap, About, BuildLine,
│                         # CareerLine, CertLine, Contact
└── package.json
```

All content (bio, projects, career, certifications, tools) lives in
[`src/data.js`](src/data.js), so the site can be updated without touching component code. Station positions on the map
are set at the top of `TransitMap.jsx` and match the map in the GitHub profile README.

## Run Locally

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build → dist/
```

## Deployment

Every push to `main` triggers the GitHub Actions workflow, which builds the Vite app with
Node 22 and publishes `dist/` to the `gh-pages` branch, served by GitHub Pages.
