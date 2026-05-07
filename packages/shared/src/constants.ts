export const APP_NAME = "Phoenix AI";
export const APP_TAGLINE = "One API. Every LLM. Infinite Possibilities.";

export const LLM_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    logo: "/providers/openai.svg",
  },
  {
    id: "google",
    name: "Google Gemini",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
    logo: "/providers/google.svg",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    logo: "/providers/anthropic.svg",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    models: ["mistral-large", "mistral-medium", "mistral-small"],
    logo: "/providers/mistral.svg",
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama3-70b", "llama3-8b", "mixtral-8x7b"],
    logo: "/providers/groq.svg",
  },
] as const;

export const PRICING_TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for trying out Phoenix",
    features: [
      "1,000 API calls/month",
      "Access to all LLM providers",
      "Community support",
      "Basic analytics",
    ],
    limits: {
      requestsPerMonth: 1000,
      tokensPerRequest: 4000,
      concurrentRequests: 2,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "For serious developers and teams",
    features: [
      "50,000 API calls/month",
      "Priority access to all LLMs",
      "Email support",
      "Advanced analytics",
      "Custom model fine-tuning",
    ],
    limits: {
      requestsPerMonth: 50000,
      tokensPerRequest: 16000,
      concurrentRequests: 10,
    },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "Custom solutions for large organizations",
    features: [
      "Unlimited API calls",
      "Dedicated infrastructure",
      "SLA guarantees",
      "24/7 priority support",
      "Custom model deployment",
      "On-premise option",
    ],
    limits: {
      requestsPerMonth: Infinity,
      tokensPerRequest: 32000,
      concurrentRequests: 100,
    },
  },
];

export const CREDIT_PACKAGES = [
  { id: "starter", credits: 1000, price: 500, label: "₦500 → 1,000 credits" },
  { id: "growth", credits: 5000, price: 2000, label: "₦2,000 → 5,000 credits", popular: true },
  { id: "scale", credits: 25000, price: 8000, label: "₦8,000 → 25,000 credits" },
  { id: "enterprise", credits: 100000, price: 25000, label: "₦25,000 → 100,000 credits" },
];

// Credit costs per 1K tokens (in credits)
export const TOKEN_COSTS = {
  "gpt-4o": { input: 5, output: 15 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10, output: 30 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  "gemini-1.5-pro": { input: 3.5, output: 10.5 },
  "gemini-1.5-flash": { input: 0.35, output: 1.05 },
  "gemini-1.0-pro": { input: 0.5, output: 1.5 },
  "claude-3-opus": { input: 15, output: 75 },
  "claude-3-sonnet": { input: 3, output: 15 },
  "claude-3-haiku": { input: 0.25, output: 1.25 },
  "mistral-large": { input: 2, output: 6 },
  "mistral-medium": { input: 1.3, output: 3.9 },
  "mistral-small": { input: 0.2, output: 0.6 },
  "llama3-70b": { input: 0.59, output: 0.79 },
  "llama3-8b": { input: 0.05, output: 0.1 },
  "mixtral-8x7b": { input: 0.27, output: 0.27 },
};
