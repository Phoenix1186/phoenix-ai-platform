"use client";

import { Button, ScrollArea, Separator } from "@phoenix/ui";
import { Plus, MessageSquare, Trash2, RefreshCw, Pin, Settings, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";

interface ChatSidebarProps {
  conversations: any[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRefresh: () => void;
}

export function ChatSidebar({ conversations, currentId, onSelect, onNewChat, onRefresh }: ChatSidebarProps) {
  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      await fetch(`/api/v1/conversations/${id}`, { method: "DELETE", credentials: "include" });
      onRefresh();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div class="p-4 border-b border-slate-200">
        <Button onClick={onNewChat} className="w-full gap-2">
          <Plus className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {conversations.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">
              No conversations yet
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors group ${
                currentId === conv.id
                  ? "bg-orange-50 text-orange-900 border border-orange-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate flex-1">{conv.title}</span>
              {conv.isPinned && <Pin className="h-3 w-3 text-orange-400" />}
              <Trash2
                className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 shrink-0"
                onClick={(e) => deleteConversation(conv.id, e)}
              />
            </button>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3 space-y-1">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-600">
            <CreditCard className="h-4 w-4" /> API Keys & Billing
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-600">
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-slate-600"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
}
