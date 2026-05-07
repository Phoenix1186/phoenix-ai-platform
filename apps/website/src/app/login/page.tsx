"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@phoenix/ui";
import { Flame, Github, Chrome } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const body = isSignUp ? { email, password, name } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        window.location.href = "/chat";
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-slate-900">Phoenix AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isSignUp ? "Start building with AI today" : "Sign in to your account"}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="space-y-3 mb-6">
            <a href="/api/auth/google" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Chrome className="h-4 w-4" /> Continue with Google
              </Button>
            </a>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
