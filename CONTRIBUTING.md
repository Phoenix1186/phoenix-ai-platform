# Contributing to Phoenix AI

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL (or Docker)
- Redis (or Docker)
- Ollama (for local LLM testing)

### Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourusername/phoenix-ai-platform.git
cd phoenix-ai-platform
npm install

# 2. Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/website/.env.example apps/website/.env

# 3. Start databases (with Docker)
docker-compose up -d

# 4. Run database migrations
npm run db:migrate

# 5. Start all services
npm run dev
```

### Services will be available at:
- Website: http://localhost:3000
- API: http://localhost:3001
- Admin: http://localhost:3002
- WebSocket: http://localhost:3003
- Docs: http://localhost:3004

## Project Structure

```
phoenix-ai-platform/
├── apps/
│   ├── api/           # Hono.js REST API
│   ├── website/       # Next.js landing + chat
│   ├── admin/         # Next.js admin dashboard
│   ├── workers/       # BullMQ background jobs
│   ├── websocket/     # Socket.io real-time server
│   └── docs/          # Next.js documentation site
├── packages/
│   ├── shared/        # Shared utilities & types
│   ├── ui/            # Shared UI components
│   ├── database/      # Drizzle ORM schema & client
│   └── config/        # Shared configuration
```

## Coding Standards

- TypeScript for all new code
- Follow existing code style (Prettier configured)
- Write tests for new features
- Update documentation for API changes

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Questions?

Open an issue or join our community discussions.
