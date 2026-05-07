# Multi-stage build for Phoenix API with Ollama
FROM ollama/ollama:latest AS ollama-base

# Install Node.js 20
RUN apt-get update && apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package files first
COPY package*.json ./
COPY turbo.json ./

# Copy packages
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/database/package*.json ./packages/database/
COPY packages/config/package*.json ./packages/config/

# Copy apps
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY packages/database ./packages/database
COPY packages/config ./packages/config
COPY apps/api ./apps/api

# Build packages and API
RUN npm run build --workspace=@phoenix/shared && \
    npm run build --workspace=@phoenix/database && \
    npm run build --workspace=@phoenix/config && \
    npm run build --workspace=@phoenix/api

# Expose ports
EXPOSE 3001 11434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start Ollama and API
CMD sh -c 'ollama serve & \
    sleep 10 && \
    echo "Pulling models..." && \
    ollama pull llama3.1 2>/dev/null || true && \
    ollama pull mistral 2>/dev/null || true && \
    echo "Starting API..." && \
    cd apps/api && node dist/index.js'
