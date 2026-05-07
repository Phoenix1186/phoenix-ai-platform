# 🔥 Phoenix AI Platform

A multi-LLM API platform with identity "Phoenix" — built for developers to integrate AI into their applications.

## Architecture

| Service | Subdomain | Description |
|---------|-----------|-------------|
| Website | `phoenix.ai` | Landing page, pricing, docs |
| API | `api.phoenix.ai` | REST API for LLM access |
| Admin | `admin.phoenix.ai` | Admin dashboard |
| Workers | `workers.phoenix.ai` | Background job processing |
| WebSocket | `ws.phoenix.ai` | Real-time chat streaming |
| Docs | `docs.phoenix.ai` | API documentation |

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **API**: Hono.js (Edge-ready)
- **Database**: Neon (PostgreSQL) + Drizzle ORM
- **Auth**: Lucia Auth
- **Payments**: Paystack
- **Queue**: BullMQ + Redis
- **WebSocket**: Socket.io
- **LLMs**: OpenAI, Google Gemini, Anthropic Claude, Mistral

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/website/.env.example apps/website/.env

# Run database migrations
npm run db:migrate

# Start all services
npm run dev
```

## Deployment (Railway)

1. Push to GitHub
2. Connect Railway to repo
3. Create services for each app
4. Set environment variables
5. Configure custom domains

## Project Structure

```
phoenix-ai-platform/
├── apps/
│   ├── website/          # Landing page & marketing
│   ├── api/              # REST API
│   ├── admin/            # Admin dashboard
│   ├── workers/          # Background jobs
│   ├── websocket/        # Real-time server
│   └── docs/             # Documentation site
├── packages/
│   ├── shared/           # Shared utilities
│   ├── ui/               # Shared UI components
│   ├── database/         # Database schema & client
│   └── config/           # Shared configs
```

## License

MIT
