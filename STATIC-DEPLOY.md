# Static Deployment

This repo now includes a standalone static build in `docs/`.

Files to publish:

- `docs/index.html`
- `docs/css/site.css`
- `docs/js/site.js`
- `docs/images/*`
- `docs/.nojekyll`

Free hosting options:

1. GitHub Pages
Set the Pages source to `/docs` on your default branch.

2. Netlify
Import the repo and set the publish directory to `docs`.

3. Cloudflare Pages
Connect the repo and set the output directory to `docs`.

No backend, Azure service, or database is required for the landing page itself.
