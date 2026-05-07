# 🚀 Deployment Guide

## Railway Deployment (Custom Domains)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/phoenix-ai-platform.git
git push -u origin main
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

### Step 3: Create Services (One per App)

For each app, create a separate service:

| Service | Root Directory | Start Command | Port |
|---------|---------------|---------------|------|
| **website** | `apps/website` | `npm run start` | 3000 |
| **api** | `apps/api` | `npm run start` | 3001 |
| **admin** | `apps/admin` | `npm run start` | 3002 |
| **workers** | `apps/workers` | `npm run start` | - |
| **websocket** | `apps/websocket` | `npm run start` | 3003 |
| **docs** | `apps/docs` | `npm run start` | 3004 |

### Step 4: Set Environment Variables

For **API** service:
```
DATABASE_URL=postgresql://... (from Neon)
REDIS_URL=redis://... (from Railway Redis or Upstash)
LUCIA_SECRET=your-super-secret-key
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
ADMIN_SECRET_KEY=your-admin-secret
OLLAMA_HOST=http://localhost:11434
NODE_ENV=production
```

For **Website** service:
```
NEXT_PUBLIC_API_URL=https://api.phoenix.ai
NEXT_PUBLIC_APP_URL=https://phoenix.ai
NEXT_PUBLIC_ADMIN_KEY=your-admin-secret
```

For **Admin** service:
```
NEXT_PUBLIC_ADMIN_KEY=your-admin-secret
```

### Step 5: Add Neon Database
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add as `DATABASE_URL` in Railway API service

### Step 6: Add Redis
1. In Railway, click "New" → "Database" → "Add Redis"
2. Copy the Redis URL
3. Add as `REDIS_URL` in API and Workers services

### Step 7: Configure Custom Domains

For each service, go to Settings → Domains:

| Service | Custom Domain | CNAME Target |
|---------|--------------|--------------|
| website | `phoenix.ai` | `website.railway.app` |
| api | `api.phoenix.ai` | `api.railway.app` |
| admin | `admin.phoenix.ai` | `admin.railway.app` |
| websocket | `ws.phoenix.ai` | `websocket.railway.app` |
| docs | `docs.phoenix.ai` | `docs.railway.app` |

**DNS Setup (in your domain registrar):**
```
Type: CNAME
Name: @ (for root domain) or subdomain
Target: <service>.railway.app
TTL: 300
```

For root domain (apex), use A record with Railway's IP or use a DNS provider that supports CNAME flattening (Cloudflare).

### Step 8: SSL Certificates
Railway automatically provisions SSL certificates for custom domains. Just add the domain and Railway handles the rest.

### Step 9: Deploy
Click "Deploy" on each service. Railway will build and deploy automatically.

## Important Notes

### Ollama Models on Railway
The API Dockerfile installs Ollama and pulls models at startup. For production:
1. First deployment will take longer as models download
2. Consider using Railway volumes to persist model files
3. Or use a separate Ollama service and point API to it via `OLLAMA_HOST`

### Paystack Webhook
In Paystack Dashboard, set webhook URL to:
```
https://api.phoenix.ai/webhooks/paystack
```

### Database Migrations
Run migrations manually or set up a startup script:
```bash
cd packages/database && npx drizzle-kit migrate
```

### Scaling
- Increase Railway service instances for horizontal scaling
- Use Railway's auto-scaling based on CPU/memory
- Consider separate Ollama service for heavy model workloads

## Troubleshooting

### CORS Issues
Make sure `APP_URL` and `API_URL` env vars are set correctly with your custom domains.

### Model Not Found
Models are pulled at startup. If a model isn't available, the API will return an error. Check logs for pull status.

### Database Connection
Ensure Neon database allows connections from Railway IPs. Check Neon connection settings.
