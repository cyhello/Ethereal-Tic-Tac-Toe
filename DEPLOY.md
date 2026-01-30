# 自动部署到宝塔服务器

每次向 GitHub 的 `main` 分支推送代码时，GitHub Actions 会自动构建项目并把生成的静态文件（`dist/`）通过 SSH 同步到你的宝塔服务器。

---

## 一、宝塔服务器准备

### 1. 创建网站

1. 登录宝塔面板 → **网站** → **添加站点**
2. 填写域名（或 IP + 端口），例如：`game.yourdomain.com`
3. 选择 **纯静态** 或 **PHP 项目**（本项目只需托管静态文件）
4. 记下网站根目录，一般为：`/www/wwwroot/你的域名/`（例如 `/www/wwwroot/game.yourdomain.com`）

### 2. 准备部署目录

部署时会把构建产物同步到「网站根目录」。请确保该目录存在且可写：

- 若网站根目录就是 `/www/wwwroot/你的域名/`，则 **DEPLOY_PATH** 填：`/www/wwwroot/你的域名`
- 若希望部署到子目录，例如 `public`，则先在该站点下创建 `public`，**DEPLOY_PATH** 填：`/www/wwwroot/你的域名/public`，并在宝塔里把网站「运行目录」改为 `/public`

### 3. SSH 用户与权限

- 使用 **root** 或 有 sudo 权限的账号：通常已有权写入 `/www/wwwroot/`。
- 若使用 **非 root 用户**（如 `www`）：
  - 在宝塔 **网站** 里查看该站点「运行用户」（多为 `www`）
  - 把部署目录的属主改为该用户，例如：
    ```bash
    sudo chown -R www:www /www/wwwroot/你的域名
    ```
  - GitHub Actions 里 **DEPLOY_USER** 填能 SSH 登录且对该目录有写权限的用户。

---

## 二、配置 SSH 密钥（供 GitHub Actions 使用）

在**你的电脑**上执行（Windows 可用 PowerShell 或 Git Bash）：

```bash
# 生成专用于部署的密钥（推荐 PEM 格式，避免兼容问题）
ssh-keygen -m PEM -t rsa -b 4096 -f deploy_key -N ""
```

会得到两个文件：

- `deploy_key`：私钥 → 放到 GitHub Secrets 的 **DEPLOY_SSH_KEY**
- `deploy_key.pub`：公钥 → 放到服务器的 `~/.ssh/authorized_keys`

### 把公钥加到服务器

**方式 A：有服务器 SSH 登录权限时**

```bash
# 将 your_user 和 your_server 换成你的 SSH 用户和服务器地址
type deploy_key.pub | ssh your_user@your_server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**方式 B：在宝塔面板**

1. 宝塔 → **安全** → **SSH 管理** 或 终端
2. 编辑 `~/.ssh/authorized_keys`（若没有则新建 `~/.ssh` 并创建该文件）
3. 把 `deploy_key.pub` 的**整行内容**粘贴进去并保存

完成后可测试登录：

```bash
ssh -i deploy_key your_user@your_server
```

---

## 三、在 GitHub 配置 Secrets

1. 打开仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加下面 4 个 Secret：

| Secret 名称        | 说明           | 示例值                    |
|--------------------|----------------|---------------------------|
| `DEPLOY_HOST`      | 服务器 IP 或域名 | `123.45.67.89` 或 `game.yourdomain.com` |
| `DEPLOY_USER`      | SSH 登录用户名 | `root` 或 `www`           |
| `DEPLOY_SSH_KEY`   | SSH 私钥完整内容 | 打开 `deploy_key` 文件，复制全部（含 `-----BEGIN/END RSA PRIVATE KEY-----`） |
| `DEPLOY_PATH`      | 服务器上的部署目录（网站根目录） | `/www/wwwroot/你的域名` |

可选（若构建时需要 Gemini API Key）：

| Secret 名称     | 说明           |
|----------------|----------------|
| `GEMINI_API_KEY` | 用于前端 AI 功能的 API Key（可选） |

---

## 四、触发部署

- **自动**：向 `main` 分支 `git push` 后会触发一次构建和部署。
- **手动**：在 GitHub 仓库 **Actions** 页选择 **Build and Deploy**，点击 **Run workflow**。

部署完成后，访问你绑定的域名即可看到最新版本。

---

## 五、常见问题

### 1. 部署失败：Permission denied (publickey)

- 检查 **DEPLOY_SSH_KEY** 是否完整（含首尾两行、换行正确）。
- 确认服务器 `~/.ssh/authorized_keys` 中已添加对应公钥。
- 确认 **DEPLOY_USER** 与服务器上实际 SSH 用户名一致。

### 2. 部署失败：Permission denied (目录不可写)

- 确认 **DEPLOY_PATH** 存在且对 **DEPLOY_USER** 可写。
- 若用 `www` 用户，执行：`sudo chown -R www:www /www/wwwroot/你的域名`。

### 3. 页面 404 或空白

- 宝塔中确认网站「运行目录」指向 **DEPLOY_PATH**（即 `index.html` 所在目录）。
- 若部署到子目录（如 `public`），在宝塔网站设置里把「运行目录」改为 `/public`。

### 4. 想用宝塔 Webhook 而不是 GitHub Actions

若你希望「由宝塔在服务器上拉代码并构建」：

1. 宝塔安装 **宝塔 Webhook** 插件，添加一个 Webhook，脚本中：`cd /www/wwwroot/你的项目 && git pull && npm ci && npm run build`（需服务器已安装 Node.js 并已 clone 仓库）。
2. 在 GitHub 仓库 **Settings** → **Webhooks** 添加该 Webhook URL，事件选择 **Just the push event**。

当前仓库已配置为「在 GitHub 上构建，再通过 SSH 同步到服务器」，无需在服务器安装 Node.js，更简单且安全。
