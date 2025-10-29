# Spell a Word

A simple word spelling app with voice selection, language options, and dark mode.

## Setup

Install dependencies:
```bash
bun install
# or
npm install
```

## Development

Start the dev server with hot reload:
```bash
bun run dev
# or
npm run dev
```

This will:
- Start Vite dev server on http://localhost:3000
- Enable hot module replacement (HMR) - changes reflect instantly
- Open the browser automatically

## Build

Build for production:
```bash
bun run build
# or
npm run build
```

Outputs to `dist/` folder.

## Preview Production Build

Preview the production build locally:
```bash
bun run preview
# or
npm run preview
```

## Deployment

Deploy to GitHub Pages:
```bash
bun run deploy
# or
npm run deploy
```

This will:
- Build the project for production
- Deploy the `dist/` folder to the `gh-pages` branch
- Make the site available at `https://donpui.github.io/spell-it/`

**Note:** Make sure GitHub Pages is enabled in your repository settings and set to use the `gh-pages` branch.

