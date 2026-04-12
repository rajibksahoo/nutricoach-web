"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import clientApi from "@/lib/client-api";
import { getClientUser } from "@/lib/client-auth";
import Spinner from "@/components/ui/Spinner";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  clientId: string;
  senderType: "COACH" | "CLIENT";
  content: string;
  read: boolean;
  sentAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isClient = msg.senderType === "CLIENT";
  return (
    <div className={cn("flex", isClient ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isClient
            ? "bg-emerald-600 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
        )}
      >
        <p>{msg.content}</p>
        <p className={cn("text-[10px] mt-1 text-right", isClient ? "text-emerald-200" : "text-slate-400")}>
          {formatTime(msg.sentAt)}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientChatPage() {
  const client = getClientUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clientApi
      .get<{ data: Message[] }>("/api/v1/portal/messages")
      .then((res) => setMessages(res.data.data))
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await clientApi.post<{ data: Message }>("/api/v1/portal/messages", {
        content: input.trim(),
      });
      setMessages((prev) => [...prev, res.data.data]);
      setInput("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 112px)" }}>
      {/* Header */}
      <div className="mb-3 shrink-0">
        <h1 className="text-xl font-semibold text-slate-900">Chat</h1>
        <p className="text-sm text-slate-500 mt-0.5">Messages with your coach</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner className="w-6 h-6" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
            <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-sm">Say hello to your coach!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Coach label at top */}
            {client && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs shrink-0">
                  C
                </div>
                <p className="text-xs text-slate-400">Your coach</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 shrink-0">
        <div className="flex items-end gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            className="flex-1 resize-none text-sm focus:outline-none leading-relaxed max-h-28 overflow-y-auto bg-transparent"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {sending ? <Spinner className="w-3.5 h-3.5 text-white" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">Shift+Enter for new line</p>
      </div>
    </div>
  );
}
