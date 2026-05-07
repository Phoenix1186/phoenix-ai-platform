"use client";

import { Badge } from "@phoenix/ui";
import { Cpu, Check } from "lucide-react";

const models = [
  { name: "Llama 3.1", size: "8B", tags: ["General", "Fast"], status: "available" },
  { name: "Llama 3.1 70B", size: "70B", tags: ["General", "High Quality"], status: "available" },
  { name: "Mistral", size: "7B", tags: ["General", "Efficient"], status: "available" },
  { name: "Mixtral 8x7B", size: "47B", tags: ["General", "Best"], status: "available" },
  { name: "Qwen 2.5", size: "7B", tags: ["Multilingual", "Coding"], status: "available" },
  { name: "Phi-4", size: "14B", tags: ["Reasoning", "Math"], status: "available" },
  { name: "Gemma 2", size: "9B", tags: ["Lightweight", "Fast"], status: "available" },
  { name: "DeepSeek Coder", size: "33B", tags: ["Coding", "Technical"], status: "available" },
  { name: "Code Llama", size: "34B", tags: ["Coding", "Programming"], status: "available" },
  { name: "LLaVA", size: "7B", tags: ["Vision", "Multimodal"], status: "available" },
];

export function Models() {
  return (
    <section id="models" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Self-hosted models ready to use
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            All models run on your infrastructure. No external API calls. No data leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.name}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:border-orange-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{model.name}</div>
                  <div className="flex gap-2 mt-1">
                    {model.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{model.size}</span>
                <Check className="h-4 w-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
