import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Phoenix AI - One API. Every LLM. Infinite Possibilities.",
  description:
    "Access GPT-4, Gemini, Claude, Mistral, and more through a single API. Build AI-powered applications with ease.",
  keywords: [
    "AI API",
    "LLM API",
    "OpenAI alternative",
    "GPT-4 API",
    "Gemini API",
    "Claude API",
    "AI chat",
  ],
  openGraph: {
    title: "Phoenix AI",
    description: "One API. Every LLM. Infinite Possibilities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
