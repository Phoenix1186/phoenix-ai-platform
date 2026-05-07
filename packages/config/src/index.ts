export const domains = {
  website: process.env.WEBSITE_DOMAIN || "phoenix.ai",
  api: process.env.API_DOMAIN || "api.phoenix.ai",
  admin: process.env.ADMIN_DOMAIN || "admin.phoenix.ai",
  websocket: process.env.WS_DOMAIN || "ws.phoenix.ai",
  docs: process.env.DOCS_DOMAIN || "docs.phoenix.ai",
} as const;

export const ports = {
  website: 3000,
  api: 3001,
  admin: 3002,
  websocket: 3003,
  docs: 3004,
} as const;
