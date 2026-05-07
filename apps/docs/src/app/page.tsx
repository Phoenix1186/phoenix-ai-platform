"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Copy, Check } from "lucide-react";

export default function DocsPage() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const CodeBlock = ({ id, code, language = "bash" }: { id: string; code: string; language?: string }) => (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copySnippet(id, code)}
        className="absolute top-2 right-2 p-2 rounded bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedSnippet === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-slate-900">Phoenix AI Docs</span>
          </Link>
          <Link href="/chat" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            Back to App
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <a href="#introduction" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">Introduction</a>
              <a href="#authentication" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">Authentication</a>
              <a href="#models" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">Models</a>
              <a href="#chat-completions" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">Chat Completions</a>
              <a href="#streaming" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">Streaming</a>
              <a href="#embeddings" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">Embeddings</a>
              <a href="#errors" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">Error Handling</a>
              <a href="#sdks" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">SDKs</a>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 prose prose-slate max-w-none">
            <section id="introduction" className="mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Phoenix AI API Documentation</h1>
              <p className="text-lg text-slate-600">
                Welcome to the Phoenix AI API. Our API is OpenAI-compatible, meaning you can use it
                as a drop-in replacement for OpenAI in any application or framework.
              </p>
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Base URL:</strong> <code className="bg-white px-2 py-1 rounded">https://api.phoenix.ai/v1</code>
                </p>
              </div>
            </section>

            <section id="authentication" className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
              <p className="text-slate-600 mb-4">
                All API requests require authentication using an API key. Include your key in the
                Authorization header.
              </p>
              <CodeBlock
                id="auth"
                code={`Authorization: Bearer phx_your_api_key_here`}
              />
              <p className="text-slate-600 mt-4">
                You can create and manage API keys from your <Link href="/dashboard" className="text-orange-500">Dashboard</Link>.
              </p>
            </section>

            <section id="models" className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Models</h2>
              <p className="text-slate-600 mb-4">
                Phoenix AI hosts multiple self-hosted open-source models. All models run on our infrastructure.
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">List Models</h3>
              <CodeBlock
                id="list-models"
                code={`GET /v1/models

# Response
{
  "object": "list",
  "data": [
    {
      "id": "llama3.1",
      "object": "model",
      "created": 1677610602,
      "owned_by": "phoenix"
    },
    {
      "id": "mistral",
      "object": "model",
      "created": 1677610602,
      "owned_by": "phoenix"
    }
  ]
}`}
              />
            </section>

            <section id="chat-completions" className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Chat Completions</h2>
              <p className="text-slate-600 mb-4">
                Create a chat completion. This is the main endpoint for generating responses from LLMs.
              </p>
              <CodeBlock
                id="chat-completion"
                code={`POST /v1/chat/completions
Content-Type: application/json
Authorization: Bearer phx_your_api_key

{
  "model": "llama3.1",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "What is the capital of France?" }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}

# Response
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "llama3.1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 10,
    "total_tokens": 35
  }
}`}
              />
            </section>

            <section id="streaming" className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Streaming</h2>
              <p className="text-slate-600 mb-4">
                Enable streaming by setting <code>stream: true</code>. The API will return SSE (Server-Sent Events).
              </p>
              <CodeBlock
                id="streaming"
                code={`POST /v1/chat/completions

{
  "model": "llama3.1",
  "messages": [{ "role": "user", "content": "Hello!" }],
  "stream": true
}

# SSE Response Stream
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"}}]}
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","choices":[{"delta":{"content":" there"}}]}
data: [DONE]`}
              />
            </section>

            <section id="embeddings" className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Embeddings</h2>
              <p className="text-slate-600 mb-4">
                Generate embeddings for text input using our embedding models.
              </p>
              <CodeBlock
                id="embeddings"
                code={`POST /v1/embeddings

{
  "model": "nomic-embed-text",
  "input": "The quick brown fox jumps over the lazy dog"
}

# Response
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0023, -0.0091, 0.0156, ...]
    }
  ],
  "model": "nomic-embed-text"
}`}
              />
            </section>

            <section id="errors" className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Handling</h2>
              <p className="text-slate-600 mb-4">
                The API uses standard HTTP status codes and returns error details in the response body.
              </p>
              <CodeBlock
                id="errors"
                code={`# 401 Unauthorized
{
  "error": {
    "message": "Invalid API key",
    "type": "authentication_error"
  }
}

# 402 Payment Required
{
  "error": {
    "message": "Insufficient credits",
    "type": "insufficient_credits"
  }
}

# 429 Rate Limited
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error"
  }
}`}
              />
            </section>

            <section id="sdks" className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">SDK Examples</h2>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">Python (OpenAI SDK)</h3>
              <CodeBlock
                id="python-sdk"
                code={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.phoenix.ai/v1",
    api_key="phx_your_api_key"
)

response = client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`}
              />

              <h3 className="text-lg font-semibold text-slate-900 mb-2 mt-6">JavaScript/TypeScript</h3>
              <CodeBlock
                id="js-sdk"
                code={`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.phoenix.ai/v1',
  apiKey: 'phx_your_api_key',
});

const response = await client.chat.completions.create({
  model: 'llama3.1',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);`}
              />

              <h3 className="text-lg font-semibold text-slate-900 mb-2 mt-6">cURL</h3>
              <CodeBlock
                id="curl"
                code={`curl https://api.phoenix.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer phx_your_api_key" \
  -d '{
    "model": "llama3.1",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
