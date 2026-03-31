# Graph Coverage Metrics Tool - Deployment Guide

This guide explains how to deploy the Graph Coverage Metrics Tool to GitHub Pages.

## Prerequisites

- Forked and cloned repository on your local machine
- Node.js 18+ and npm 9+ installed
- GitHub account with push permissions to your fork
- Git configured locally

## Local Development Deployment

### Installing Dependencies

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates a static build in the `build/` directory ready for deployment.

### Testing the Production Build Locally

```bash
npm run preview
```

This serves the production build locally to verify it works correctly.

## GitHub Pages Deployment

### Option 1: Automatic GitHub Actions Deployment

Setup automated deployment with GitHub Actions:

1. **Create GitHub Actions Workflow**

   Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: ['main']
     pull_request:
       branches: ['main']

   jobs:
     build:
       runs-on: ubuntu-latest

       strategy:
         matrix:
           node-version: [18.x]

       steps:
         - uses: actions/checkout@v3

         - name: Use Node.js ${{ matrix.node-version }}
           uses: actions/setup-node@v3
           with:
             node-version: ${{ matrix.node-version }}
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           if: github.ref == 'refs/heads/main'
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./build
   ```

2. **Configure Repository Settings**

   - Go to **Settings → Pages**
   - Change **Source** to GitHub Actions
   - Save

3. **Push Changes**

   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin main
   ```

4. **Verify Deployment**

   - GitHub Actions will automatically deploy on push to main
   - Check **Actions** tab to see deployment progress
   - Your site will be live at `https://<username>.github.io/<repo-name>`

### Option 2: Manual GitHub Pages Deployment

If you prefer manual deployment:

1. **Build the Project**

   ```bash
   npm run build
   ```

2. **Create gh-pages Branch** (if not exists)

   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   git commit --allow-empty -m "Initial gh-pages commit"
   git push origin gh-pages
   ```

3. **Upload Build Files**

   ```bash
   # From project root
   cp -r build/* gh-pages/
   cd gh-pages
   git add .
   git commit -m "Deploy version X.X.X"
   git push origin gh-pages
   ```

4. **Configure GitHub Pages**

   - Go to **Settings → Pages**
   - Set **Source** to "Deploy from a branch"
   - Select **gh-pages** branch and **/root** folder
   - Save

## Environment Configuration

### Production Variables

Create `.env.production` in the project root if needed:

```
VITE_API_URL=https://your-api-url.com
```

### Build Configuration

The `svelte.config.js` is configured with `adapter-static` for optimal GitHub Pages compatibility:

```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false
    })
  }
};
```

## Troubleshooting Deployments

### Build Fails

1. Check Node version: `node --version` (should be 18+)
2. Clear cache: `rm -rf node_modules .svelte-kit && npm install`
3. Check for TypeScript errors: `npm run build`

### Site Shows 404

1. Verify `build/` directory was created
2. Check GitHub Pages settings point to correct branch
3. Ensure `vite.config.ts` has correct base path:
   ```typescript
   export default {
     base: '/repo-name/',  // Add if deploying to repo, not user domain
   }
   ```

### Performance Issues

1. The build bundle should be <2MB
2. Check webpack analysis: `npm run build -- --analyze`
3. Optimize large components

### Style/Script Errors on Live Site

1. Verify relative paths work with `base` config
2. Check browser console for CORS issues
3. Clear browser cache and hard refresh

## Continuous Integration/Deployment

### Deployment Triggers

The workflow deploys on:
- ✅ Push to `main` branch
- ✅ Manual GitHub Actions trigger
- ✅ Pull request (creates preview)

### Rollback Procedure

If a deployment has issues:

1. Identify previous working commit
2. Force push to main (or revert with new commit)
3. GitHub Actions will automatically re-deploy
4. Or manually checkout a previous gh-pages commit

## Custom Domain Setup

To use a custom domain:

1. Add **CNAME** file to `build/` directory:
   ```
   your-domain.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to `<username>.github.io`

3. GitHub Pages Settings:
   - Enter your domain
   - Enable HTTPS

## Performance Tips

### Asset Optimization

- Minification is automatic in production build
- Compression happens with `precompress: false` (can enable for best compression)
- Use CDN for large assets

### Caching

GitHub Pages automatically:
- Caches assets with proper headers
- Sets `Cache-Control: no-cache` for HTML
- Long caches for versioned assets

## Monitoring

### Check Deployment Status

```bash
# View GitHub Actions runs
gh run list

# See deployment logs
gh run view <run-id>
```

### Performance Testing

```bash
# Lighthouse CI (if configured)
npm run lighthouse

# Bundle analysis
npm run build -- --analyze
```

## Security

### Best Practices

- ✅ Enable HTTPS (GitHub Pages does this by default)
- ✅ Keep dependencies updated: `npm audit`
- ✅ No secrets in code (use GitHub Secrets if needed)
- ✅ Review Actions permissions in repo settings

### Updating Dependencies

```bash
npm update
npm audit fix
npm run build  # Verify build still works
git commit -m "Update dependencies"
git push
```

## Versioning

Tag releases for deployments:

```bash
# Create a new version
npm version patch  # for 1.0.0 → 1.0.1
npm version minor  # for 1.0.0 → 1.1.0
npm version major  # for 1.0.0 → 2.0.0

# Push tags
git push origin main --tags
```

## Support

For GitHub Pages-specific issues, see:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [SvelteKit Static Adapter](https://kit.svelte.dev/docs/adapter-static)

---

**Last Updated**: 2026-03-31
