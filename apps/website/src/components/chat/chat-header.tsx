"use client";

import { Select, Button } from "@phoenix/ui";
import { Share2, MoreHorizontal } from "lucide-react";

interface ChatHeaderProps {
  model: string;
  onModelChange: (model: string) => void;
  conversationTitle: string;
}

const models = [
  { value: "llama3.1", label: "Llama 3.1 (8B)" },
  { value: "llama3.1:70b", label: "Llama 3.1 (70B)" },
  { value: "mistral", label: "Mistral (7B)" },
  { value: "mixtral", label: "Mixtral 8x7B" },
  { value: "qwen2.5", label: "Qwen 2.5 (7B)" },
  { value: "phi4", label: "Phi-4 (14B)" },
  { value: "gemma2", label: "Gemma 2 (9B)" },
  { value: "deepseek-coder", label: "DeepSeek Coder (33B)" },
  { value: "codellama", label: "Code Llama (34B)" },
  { value: "llava", label: "LLaVA (Vision)" },
];

export function ChatHeader({ model, onModelChange, conversationTitle }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-slate-700 truncate max-w-[200px] lg:max-w-md">
          {conversationTitle}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          options={models}
          className="w-48 text-xs"
        />
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
