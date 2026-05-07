"use client";

import { Card, CardContent } from "@phoenix/ui";
import { Code, CreditCard, MessageSquare, BarChart3, Lock, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat Interface",
    description: "Beautiful ChatGPT-like interface with markdown support, code highlighting, and conversation history.",
  },
  {
    icon: Code,
    title: "OpenAI-compatible API",
    description: "Drop-in replacement for OpenAI. Works with LangChain, LlamaIndex, and any OpenAI SDK.",
  },
  {
    icon: Sparkles,
    title: "Multiple LLMs",
    description: "Switch between Llama 3, Mistral, Qwen, Phi, Gemma, and more with a single parameter.",
  },
  {
    icon: CreditCard,
    title: "Paystack Payments",
    description: "Buy credits with Paystack. Pay-as-you-go or subscribe to a monthly plan. Naira supported.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description: "Track API usage, token consumption, and costs in real-time. Export detailed reports.",
  },
  {
    icon: Lock,
    title: "Self-hosted",
    description: "Your data never leaves your infrastructure. Full control over models and access.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to build with AI
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A complete platform for integrating LLMs into your applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
