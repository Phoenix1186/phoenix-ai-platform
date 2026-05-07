"use client";

import { useState, useRef, useEffect } from "react";
import { Button, ScrollArea } from "@phoenix/ui";
import { Send, Loader2, User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMainProps {
  messages: any[];
  isLoading: boolean;
  onSend: (content: string) => void;
}

export function ChatMain({ messages, isLoading, onSend }: ChatMainProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">How can I help you today?</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Ask me anything. I can help with coding, writing, analysis, math, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-lg w-full">
              {[
                "Explain quantum computing",
                "Write a Python function",
                "Analyze this data",
                "Help me debug this error",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSend(suggestion)}
                  className="p-3 rounded-lg border border-slate-200 text-left text-sm text-slate-600 hover:bg-slate-50 hover:border-orange-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 message-enter ${
                  message.role === "user" ? "flex-row" : "flex-row"
                }`}
              >
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                  {message.role === "user" ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      {message.role === "user" ? "You" : "Phoenix"}
                    </span>
                    {message.model && (
                      <span className="text-xs text-slate-400">{message.model}</span>
                    )}
                  </div>
                  <div className={`prose prose-sm max-w-none ${message.isError ? "text-red-600" : ""}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/
$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.role === "assistant" && !message.isError && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex items-center gap-1.5 py-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-orange-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-orange-400 rounded-full typing-dot" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message Phoenix..."
            className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px] max-h-[200px]"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 h-11 w-11 p-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          Phoenix can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
