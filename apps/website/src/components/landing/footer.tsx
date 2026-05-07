import Link from "next/link";
import { Flame, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Flame className="h-6 w-6 text-orange-500" />
              <span className="text-lg font-bold text-slate-900">Phoenix AI</span>
            </Link>
            <p className="text-sm text-slate-600 max-w-sm">
              Self-hosted LLM platform with OpenAI-compatible API. Build AI-powered applications with privacy and control.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/chat" className="text-sm text-slate-600 hover:text-slate-900">Chat</Link></li>
              <li><Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900">API Docs</Link></li>
              <li><Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link></li>
              <li><Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-slate-600 hover:text-slate-900">About</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 hover:text-slate-900">Blog</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 hover:text-slate-900">Careers</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 hover:text-slate-900">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            © 2026 Phoenix AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-slate-400 hover:text-slate-600">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-slate-400 hover:text-slate-600">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
