# Deploying to an AWS VPS (EC2)

The app is built as a self-contained Next.js **standalone** server (`output: "standalone"`),
so the production image ships only the files it needs — not the full `node_modules`.

## What the app needs at runtime

It has **no local database**. All heavy lifting is external, so the VPS only needs
outbound HTTPS and these environment variables:

| Variable | Purpose |
| --- | --- |
| `UPSTASH_VECTOR_REST_URL` | Upstash Vector index (must have a built-in embedding model) |
| `UPSTASH_VECTOR_REST_TOKEN` | Upstash Vector token |
| `NVIDIA_API_KEY` | NVIDIA-hosted MiniMax-M3 key (`nvapi-…`) |
| `NVIDIA_BASE_URL` | optional, defaults to `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | optional, defaults to `minimaxai/minimax-m3` |

> tesseract.js downloads its OCR WASM/worker/language data from a CDN on first use,
> so the instance must allow outbound internet (it already needs it for Upstash + NVIDIA).

## Option A — Docker (recommended)

On a fresh Ubuntu EC2 instance:

```bash
# 1. Install Docker + compose plugin
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER && newgrp docker

# 2. Get the code and create the env file (NOT committed)
git clone <your-repo-url> rag-chatbot && cd rag-chatbot
cp .env.example .env
nano .env            # fill in the values from the table above

# 3. Build and run
docker compose up -d --build

# 4. Verify
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000   # -> 200
docker compose logs -f web
```

The container listens on `:3000`, restarts on failure/reboot (`restart: unless-stopped`),
and has a built-in health check.

### EC2 security group

- Put the app behind a reverse proxy (below) and expose only **80/443** to the world.
- If you must reach it directly for testing, open **3000** — otherwise keep it closed.

### HTTPS via Nginx (recommended)

```nginx
# /etc/nginx/sites-available/rag-chatbot
server {
    server_name your-domain.com;
    client_max_body_size 25m;          # allow PDF uploads
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rag-chatbot /etc/nginx/sites-enabled/
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com   # provisions + auto-renews TLS
```

## Option B — No Docker (Node + systemd)

```bash
# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build
npm ci && npm run build

# Standalone server.js does not copy these itself:
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

Then run `.next/standalone/server.js` under systemd:

```ini
# /etc/systemd/system/rag-chatbot.service
[Unit]
Description=RAG Chatbot
After=network.target

[Service]
WorkingDirectory=/home/ubuntu/rag-chatbot/.next/standalone
EnvironmentFile=/home/ubuntu/rag-chatbot/.env
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
ExecStart=/usr/bin/node server.js
Restart=always
User=ubuntu

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rag-chatbot
```

## Sizing

A small instance is plenty (t3.small / 2 GB RAM). OCR of large scanned PDFs is the
most memory-hungry path; if you OCR big files, prefer 2 GB+.

## Redeploying

```bash
git pull
docker compose up -d --build     # Option A
# or: npm ci && npm run build && (copy static/public) && sudo systemctl restart rag-chatbot
```
