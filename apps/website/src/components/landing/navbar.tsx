"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@phoenix/ui";
import { Flame, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-slate-900">Phoenix AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="#models" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Models
            </Link>
            <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Docs
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-4">
          <Link href="#features" className="block text-sm text-slate-600">Features</Link>
          <Link href="#models" className="block text-sm text-slate-600">Models</Link>
          <Link href="#pricing" className="block text-sm text-slate-600">Pricing</Link>
          <Link href="/docs" className="block text-sm text-slate-600">Docs</Link>
          <Link href="/login" className="block">
            <Button className="w-full">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
