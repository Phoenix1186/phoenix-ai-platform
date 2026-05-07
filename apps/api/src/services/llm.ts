import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";

// Self-hosted LLM configuration via Ollama
export const SELF_HOSTED_MODELS = [
  { id: "llama3.1", name: "Llama 3.1", provider: "ollama", size: "8B", description: "Meta's Llama 3.1 - General purpose", tags: ["general", "fast"] },
  { id: "llama3.1:70b", name: "Llama 3.1 70B", provider: "ollama", size: "70B", description: "Meta's Llama 3.1 - High quality", tags: ["general", "high-quality"] },
  { id: "mistral", name: "Mistral", provider: "ollama", size: "7B", description: "Mistral AI - Efficient and powerful", tags: ["general", "efficient"] },
  { id: "mixtral", name: "Mixtral 8x7B", provider: "ollama", size: "47B", description: "Mixture of Experts - Best quality", tags: ["general", "best"] },
  { id: "qwen2.5", name: "Qwen 2.5", provider: "ollama", size: "7B", description: "Alibaba's Qwen - Multilingual", tags: ["multilingual", "coding"] },
  { id: "phi4", name: "Phi-4", provider: "ollama", size: "14B", description: "Microsoft Phi-4 - Reasoning", tags: ["reasoning", "math"] },
  { id: "gemma2", name: "Gemma 2", provider: "ollama", size: "9B", description: "Google Gemma 2 - Lightweight", tags: ["lightweight", "fast"] },
  { id: "deepseek-coder", name: "DeepSeek Coder", provider: "ollama", size: "33B", description: "DeepSeek - Code generation", tags: ["coding", "technical"] },
  { id: "codellama", name: "Code Llama", provider: "ollama", size: "34B", description: "Meta Code Llama - Programming", tags: ["coding", "technical"] },
  { id: "llava", name: "LLaVA", provider: "ollama", size: "7B", description: "Vision-language model", tags: ["vision", "multimodal"] },
] as const;

export class LLMService {
  private ollamaBaseUrl: string;
  private fallbackMode: boolean;

  constructor() {
    this.ollamaBaseUrl = process.env.OLLAMA_HOST || "http://localhost:11434";
    this.fallbackMode = process.env.FALLBACK_MODE === "true";
  }

  async chat(model: string, messages: any[], options?: { 
    temperature?: number; 
    maxTokens?: number;
    stream?: boolean;
  }) {
    try {
      const ollamaModel = this.mapToOllamaModel(model);

      const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 2048,
          },
          stream: options?.stream ?? false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama error (${response.status}): ${error}`);
      }

      if (options?.stream) {
        return response.body;
      }

      const data = await response.json();
      return {
        content: data.message?.content || "",
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error: any) {
      console.error("LLM Chat Error:", error);
      if (this.fallbackMode) {
        return {
          content: "I apologize, but I'm currently unable to process your request. The AI service may be temporarily unavailable. Please try again in a moment.",
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        };
      }
      throw error;
    }
  }

  async streamChat(model: string, messages: any[], options?: any) {
    try {
      const ollamaModel = this.mapToOllamaModel(model);

      const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 2048,
          },
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to start stream: ${response.status}`);
      }

      return response.body;
    } catch (error: any) {
      console.error("LLM Stream Error:", error);
      throw error;
    }
  }

  async generate(model: string, prompt: string, options?: any) {
    try {
      const ollamaModel = this.mapToOllamaModel(model);

      const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          prompt,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 2048,
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama error: ${error}`);
      }

      const data = await response.json();
      return {
        content: data.response || "",
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error: any) {
      console.error("LLM Generate Error:", error);
      throw error;
    }
  }

  async embeddings(model: string, input: string) {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.mapToOllamaModel(model),
          prompt: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate embeddings");
      }

      const data = await response.json();
      return data.embedding;
    } catch (error: any) {
      console.error("Embeddings Error:", error);
      throw error;
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`, { 
        method: "GET",
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.models || [];
    } catch {
      return [];
    }
  }

  async pullModel(model: string) {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: model, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${model}`);
      }

      return response.json();
    } catch (error: any) {
      console.error("Pull Model Error:", error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`, { 
        method: "GET",
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private mapToOllamaModel(model: string): string {
    const mapping: Record<string, string> = {
      "llama3.1": "llama3.1",
      "llama3.1:70b": "llama3.1:70b",
      "mistral": "mistral",
      "mixtral": "mixtral",
      "qwen2.5": "qwen2.5",
      "phi4": "phi4",
      "gemma2": "gemma2",
      "deepseek-coder": "deepseek-coder",
      "codellama": "codellama",
      "llava": "llava",
    };
    return mapping[model] || model;
  }
}

// Credit costs per 1K tokens (in credits)
export const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  "llama3.1": { input: 0.1, output: 0.2 },
  "llama3.1:70b": { input: 0.5, output: 1.0 },
  "mistral": { input: 0.1, output: 0.2 },
  "mixtral": { input: 0.3, output: 0.6 },
  "qwen2.5": { input: 0.1, output: 0.2 },
  "phi4": { input: 0.2, output: 0.4 },
  "gemma2": { input: 0.1, output: 0.2 },
  "deepseek-coder": { input: 0.2, output: 0.4 },
  "codellama": { input: 0.2, output: 0.4 },
  "llava": { input: 0.3, output: 0.6 },
};
