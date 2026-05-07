"use client";

import { Button } from "@phoenix/ui";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            <span>Self-hosted LLMs — No API keys needed</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6">
            One API.
            <br />
            <span className="text-orange-500">Every LLM.</span>
            <br />
            Infinite Possibilities.
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Access Llama 3, Mistral, Qwen, and more through a single API.
            Self-hosted on your infrastructure. Pay only for what you use.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login">
              <Button size="lg" className="gap-2 text-lg px-8">
                Start Building <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Read Docs
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 justify-center">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-slate-600">Data stays private</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Globe className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-slate-600">OpenAI-compatible API</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-slate-600">Pay-as-you-go pricing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
