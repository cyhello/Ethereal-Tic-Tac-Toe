<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17uZJQ6hObYIzrxLGnK_gBpsL8Q5p_XmA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy

Deployment is automated via GitHub Actions on push to `main` or `master` (see `.github/workflows/deploy.yml`). Configure `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, and `DEPLOY_PATH` in the repo’s Actions secrets.

**⚠️ Do not delete or modify:** The `.github/workflows/deploy.yml` file and the `.github/` directory are required for automatic deployment. Removing them will break CI/CD.
