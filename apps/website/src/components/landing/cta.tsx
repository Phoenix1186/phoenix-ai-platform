"use client";

import { Button } from "@phoenix/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
          Ready to build with AI?
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Join thousands of developers using Phoenix AI to power their applications.
          Start free, no credit card required.
        </p>
        <Link href="/login">
          <Button size="lg" className="gap-2 text-lg px-8">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
