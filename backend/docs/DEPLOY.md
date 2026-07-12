# Deploy VPS — my-learning.my.id

Domain: `my-learning.my.id` (root `@` + `www` → frontend, `api` → backend)

| Service  | Port | Domain                                    |
|----------|------|--------------------------------------------|
| Frontend | 3006 | my-learning.my.id, www.my-learning.my.id  |
| Backend  | 8000 | api.my-learning.my.id                     |

Asumsi: VPS Ubuntu 22.04/24.04, akses root/sudo, repo backend + frontend jadi 2 folder sibling di server (`/var/www/e-learning/backend`, `/var/www/e-learning/frontend`).

---

## 1. DNS

Di DNS provider domain, tambah A record (ganti `VPS_IP` dengan IP VPS):

```
Type  Name  Value
A     @     VPS_IP
A     www   VPS_IP
A     api   VPS_IP
```

Tunggu propagasi (`dig my-learning.my.id`, `dig api.my-learning.my.id`).

## 2. Server prep

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # >= 20

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# Certbot
sudo apt install -y certbot python3-certbot-nginx

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

MongoDB: pakai MongoDB Atlas (recommended, tinggal isi `MONGODB_URI` di `.env.production`) — tidak perlu install MongoDB di VPS.

## 3. Clone & setup backend

```bash
sudo mkdir -p /var/www/e-learning
sudo chown -R $USER:$USER /var/www/e-learning
cd /var/www/e-learning
git clone <repo-url-backend> backend
cd backend
```

Isi `.env.production`:

```bash
NODE_ENV=production
PORT=8000
API_PREFIX=/api

MONGODB_URI=<atlas connection string>

JWT_SECRET=<openssl rand -base64 64>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<openssl rand -base64 64>
JWT_REFRESH_EXPIRES_IN=30d

COOKIE_SECRET=<openssl rand -base64 32>

CORS_ORIGINS=https://my-learning.my.id,https://www.my-learning.my.id

ZOOM_ACCOUNT_ID=...
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...

MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads
```

`JWT_SECRET` / `JWT_REFRESH_SECRET` wajib ≥32 karakter, `COOKIE_SECRET` wajib diisi — env.ts akan throw kalau kurang.

Deploy manual (tanpa `npm run deploy`):

```bash
npm ci                    # install exact deps dari lockfile
npm run lint
npm run type-check
npm test

rm -rf dist
npm run build             # compile TypeScript -> dist/
npm prune --omit=dev      # buang devDependencies dari node_modules

mkdir -p uploads           # sesuai UPLOAD_DIR di .env.production

pm2 start ecosystem.config.js --env production
pm2 save
```

Cek jalan: `curl http://localhost:8000/api/health` (atau endpoint health yang ada).

**First deploy saja** — isi data awal (akun admin dkk) ke database yang masih kosong:

```bash
npm run db:seed:prod
```

Aman di-re-run: kalau database udah ada isi, seed nolak jalan (tidak akan menghapus data production).

## 4. Setup frontend

```bash
cd /var/www/e-learning
git clone <repo-url-frontend> frontend
cd frontend
npm ci
```

Isi `.env.production` (frontend, sesuaikan nama var sesuai konfigurasi Next.js project):

```bash
NEXT_PUBLIC_API_URL=https://api.my-learning.my.id/api
```

Build & jalankan port 3006:

```bash
npm run build
pm2 start npm --name e-learning-frontend -- start -- -p 3006
pm2 save
```

## 5. PM2 startup on boot

```bash
pm2 startup   # jalankan command yang di-print (sudo env PATH=... pm2 startup systemd -u $USER --hp $HOME)
pm2 save
```

## 6. Nginx reverse proxy

`/etc/nginx/sites-available/my-learning.my.id`:

```nginx
# Frontend — root + www
server {
    listen 80;
    server_name my-learning.my.id www.my-learning.my.id;

    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.my-learning.my.id;

    client_max_body_size 15m;   # >= MAX_FILE_SIZE_MB, longgar buat multer upload

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/my-learning.my.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7. SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d my-learning.my.id -d www.my-learning.my.id -d api.my-learning.my.id
```

Certbot auto-edit config nginx nambahin `listen 443 ssl` + redirect HTTP→HTTPS. Auto-renew sudah jalan lewat systemd timer certbot, cek dengan:

```bash
sudo certbot renew --dry-run
```

## 8. Verifikasi

```bash
curl https://api.my-learning.my.id/api/health
curl -I https://my-learning.my.id
curl -I https://www.my-learning.my.id
pm2 status
pm2 logs e-learning-backend
pm2 logs e-learning-frontend
```

## 9. Update / redeploy berikutnya

Backend:
```bash
cd /var/www/e-learning/backend
git fetch origin main
git reset --hard origin/main

npm ci
npm run lint
npm run type-check
npm test

rm -rf dist
npm run build
npm prune --omit=dev

pm2 reload ecosystem.config.js --env production
pm2 save
```

Frontend:
```bash
cd /var/www/e-learning/frontend
git pull
npm ci
npm run build
pm2 restart e-learning-frontend
```

---

**Catatan:**
- `CORS_ORIGINS` backend harus persis match origin frontend (`https://`, tanpa trailing slash) — kalau beda, request dari FE bakal kena CORS block.
- Role `SISWA` tidak boleh dapat `zoomStartUrl` — pastikan proxy nginx tidak cache response API (default nginx sudah tidak cache dynamic response, tapi jangan tambah `proxy_cache` di block API tanpa exclude endpoint sensitif).
- Ganti `<repo-url-backend>` / `<repo-url-frontend>` dengan URL git actual, dan sesuaikan path `/var/www/e-learning` kalau server sudah punya struktur direktori lain.
