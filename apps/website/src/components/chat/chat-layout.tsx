"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMain } from "./chat-main";
import { ChatHeader } from "./chat-header";
import { Sheet, SheetTrigger, SheetContent } from "@phoenix/ui";
import { Menu } from "lucide-react";
import { Button } from "@phoenix/ui";

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama3.1");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/v1/conversations", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/conversations/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setCurrentConversation(id);
        if (data.conversation?.model) {
          setSelectedModel(data.conversation.model);
        }
      }
    } catch (e) {
      console.error("Failed to load conversation", e);
    }
  };

  const createConversation = async () => {
    try {
      const res = await fetch("/api/v1/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ model: selectedModel }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentConversation(data.id);
        setMessages([]);
        fetchConversations();
      }
    } catch (e) {
      console.error("Failed to create conversation", e);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentConversation) {
      await createConversation();
      setTimeout(() => sendMessageToConv(content), 100);
      return;
    }
    await sendMessageToConv(content);
  };

  const sendMessageToConv = async (content: string) => {
    if (!currentConversation) return;

    const userMessage = { id: Date.now().toString(), role: "user", content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/v1/conversations/${currentConversation}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage = {
          id: data.message.id,
          role: "assistant",
          content: data.message.content,
          model: data.message.model,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        fetchConversations();
      } else {
        const error = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Error: ${error.error || "Failed to get response"}`,
            isError: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Error: Network error. Please try again.",
          isError: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block w-80 border-r border-slate-200 bg-slate-50">
        <ChatSidebar
          conversations={conversations}
          currentId={currentConversation}
          onSelect={loadConversation}
          onNewChat={createConversation}
          onRefresh={fetchConversations}
        />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <ChatSidebar
            conversations={conversations}
            currentId={currentConversation}
            onSelect={(id) => {
              loadConversation(id);
              setSidebarOpen(false);
            }}
            onNewChat={() => {
              createConversation();
              setSidebarOpen(false);
            }}
            onRefresh={fetchConversations}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          model={selectedModel}
          onModelChange={setSelectedModel}
          conversationTitle={
            conversations.find((c) => c.id === currentConversation)?.title || "New Chat"
          }
        />
        <ChatMain
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
