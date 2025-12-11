# Deployment Instructions

## Prerequisites

- Node.js and npm installed
- Git repository set up with GitHub Pages enabled
- Write access to the repository

## Deployment Steps

### 1. Stage Your Changes

```bash
git add .
```

### 2. Commit Your Changes

```bash
git commit -m "Your descriptive commit message"
```

### 3. Push to Remote Repository

```bash
git push
```

### 4. Deploy to GitHub Pages

```bash
npm run deploy
```

## Complete Deployment Command (All Steps)

```bash
git add . && git commit -m "Your message" && git push && npm run deploy
```

## What Happens During Deployment

1. **`git add .`** - Stages all changed files
2. **`git commit -m "..."`** - Creates a commit with your changes
3. **`git push`** - Pushes commits to the main branch on GitHub
4. **`npm run deploy`** - Builds the production version and deploys to `gh-pages` branch

## Notes

- Always commit and push to main **before** deploying to ensure your source code is backed up
- The `npm run deploy` command:
  - Runs `vite build` to create optimized production files in `dist/`
  - Uses `gh-pages` to publish the `dist/` folder to the `gh-pages` branch
  - GitHub Pages automatically serves from the `gh-pages` branch

## Verifying Deployment

After deployment completes, wait 1-2 minutes and visit your GitHub Pages URL:

- Usually: `https://<username>.github.io/<repository-name>/`

## Troubleshooting

- **Changes not showing?** Clear browser cache or try incognito mode
- **Deployment failed?** Check that `gh-pages` branch exists and GitHub Pages is enabled in repository settings
- **Build errors?** Run `npm run build` locally first to catch any errors
