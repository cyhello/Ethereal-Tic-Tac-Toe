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

## 中国大陆访问说明

- **静态资源**：页面不再依赖 `cdn.tailwindcss.com`、`esm.sh` 等在国内可能较慢或不可用的 CDN。Tailwind 已改为通过 Vite 打包；import map 已改为使用支持国内加速的 [esm.run](https://esm.run)（jsDelivr 网络）。
- **Gemini API**：在中国大陆无法直接访问 Google 服务，与 AI 对战功能会因网络原因失败。此时应用会自动退化为随机落子，不影响单机/双人对战。

## Deploy

Deployment is automated via GitHub Actions on push to `main` or `master` (see `.github/workflows/deploy.yml`). Configure `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, and `DEPLOY_PATH` in the repo’s Actions secrets.

**⚠️ Do not delete or modify:** The `.github/workflows/deploy.yml` file and the `.github/` directory are required for automatic deployment. Removing them will break CI/CD.
