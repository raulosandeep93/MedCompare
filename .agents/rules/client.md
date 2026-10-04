---
trigger: glob
globs: "client/**"
description: "Rules for frontend React 19 UI code in MedCompare"
---

# Frontend (Client) Rules

- **Framework**: React 19 with functional components and standard hooks.
- **Styling**:
  - Use **Vanilla CSS** with existing tokens in `client/src/index.css`.
  - **DO NOT** install, import, or introduce TailwindCSS classes.
  - Rely on CSS variables (`var(--bg-main)`, `var(--text-main)`, `var(--border-color)`, etc.) for dark/light theme compatibility.
- **Icons**: Use `lucide-react` exclusively. Do not install other icon packages.
- **API Calls**:
  - Always route network requests through `client/src/utils/api.js`.
  - Always use the `apiUrl('/api/...')` helper so requests work both in local development (proxied) and on GitHub Pages with `VITE_API_BASE_URL`.
- **State & Storage**:
  - Persist lightweight settings (theme, location, recent searches) in `localStorage` under keys prefixed with `medcompare_`.
  - Keep modal open/close states at the appropriate coordinator level (primarily in `App.jsx`).
- **Validation**:
  - Run `cd client && npm run build` to verify JSX compilation and bundling.
  - Run `cd client && npm run lint` to run oxlint checks.
