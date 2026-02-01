# Professional Timeline – Educational Credentials

Interactive timeline of educational and professional credentials for recruiters and colleagues. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Landing (Inicio)**: Full-screen hero with animated path and CTA to enter the journey.
- **Timeline**: Canvas-style view with an animated path connecting milestones; year-range selector (zoom in/out by period); click a milestone to see details in a side panel.
- **Filter by category**: Visual sidebar with category cards (topic + region) and count; grid of credential cards; click a card to expand details.
- **English UI**: All labels and content in English.

## Data

- `data/credentials.json` – 62 credentials (primary education + 61 items) with categories.
- `data/categories.json` – 17 categories (14 topic + 3 geographic).
- Data is also in `public/data/` for the dev server.

## Setup

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project structure

- `src/App.tsx` – Landing vs app; menu (Timeline | Filter); data loading.
- `src/views/LandingView.tsx` – Hero and “Explore my journey” CTA.
- `src/views/TimelineView.tsx` – Year range selector, SVG path + milestone nodes, detail panel.
- `src/views/FilterView.tsx` – Category sidebar + credential grid with expand.
- `src/types.ts` – TypeScript types for credentials and categories.

## Git – Subir a tu repositorio

Para usar tu propio repositorio (GitHub, GitLab, etc.):

1. **Crear el repo** en GitHub/GitLab (vacío, sin README si ya tienes uno local).

2. **En esta carpeta** (donde está el proyecto):

   ```bash
   git init
   git add .
   git commit -m "Initial commit: professional timeline"
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git branch -M main
   git push -u origin main
   ```

3. **Autenticación**: Si te pide usuario/contraseña, usa un **Personal Access Token** (GitHub: Settings → Developer settings → Personal access tokens) en lugar de la contraseña.

Para que yo pueda **leer** tu repositorio (por ejemplo, las presentaciones que mencionas):

- Si el repo es **público**: pásame la URL (ej. `https://github.com/tu-usuario/tu-repo`). Puedo intentar leer archivos públicos con esa URL.
- Si el repo es **privado**: no tengo acceso directo. Puedes copiar aquí el contenido de archivos concretos o describir la estructura y estilo de las presentaciones (Bite, Nifty, etc.) y lo replico en este proyecto.

Si mencionas “nnefty” o “nifty”, puede ser **Nifty.tech** u otra herramienta de presentaciones; si me das el enlace público de una presentación o el nombre del repo donde las subes, puedo usarlo como referencia visual.
