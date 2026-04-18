"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { Send, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  clientId: string;
  clientName: string;
  clientPhone: string;
  lastMessage: string | null;
  lastSenderType: "COACH" | "CLIENT" | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

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

function avatarInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ConversationItem({
  conv,
  active,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100",
        active ? "bg-emerald-50" : "hover:bg-slate-50"
      )}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
        {avatarInitial(conv.clientName)}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-sm font-semibold text-slate-900 truncate">{conv.clientName}</span>
          <span className="text-[11px] text-slate-400 shrink-0">
            {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ""}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate">
          {conv.lastMessage ? (
            <>
              {conv.lastSenderType === "COACH" && (
                <span className="text-emerald-600 font-medium">You: </span>
              )}
              {conv.lastMessage}
            </>
          ) : (
            <span className="italic text-slate-400">No messages yet</span>
          )}
        </p>
      </div>

      {/* Unread badge */}
      {conv.unreadCount > 0 && (
        <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isCoach = msg.senderType === "COACH";
  return (
    <div className={cn("flex", isCoach ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isCoach
            ? "bg-emerald-600 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
        )}
      >
        <p>{msg.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1 text-right",
            isCoach ? "text-emerald-200" : "text-slate-400"
          )}
        >
          {formatTime(msg.sentAt)}
        </p>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeClientName, setActiveClientName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations on mount
  useEffect(() => {
    api
      .get<{ data: Conversation[] }>("/api/v1/messages/conversations")
      .then((res) => setConversations(res.data.data))
      .catch(() => toast.error("Failed to load conversations"))
      .finally(() => setLoadingConvs(false));
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function openConversation(conv: Conversation) {
    if (conv.clientId === activeClientId) return;
    setActiveClientId(conv.clientId);
    setActiveClientName(conv.clientName);
    setMessages([]);
    setLoadingMessages(true);

    api
      .get<{ data: Message[] }>(`/api/v1/messages/clients/${conv.clientId}`)
      .then((res) => {
        setMessages(res.data.data);
        // Clear unread badge locally
        setConversations((prev) =>
          prev.map((c) => (c.clientId === conv.clientId ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoadingMessages(false));
  }

  async function sendMessage() {
    if (!input.trim() || !activeClientId || sending) return;
    setSending(true);

    try {
      const res = await api.post<{ data: Message }>(
        `/api/v1/messages/clients/${activeClientId}`,
        { content: input.trim() }
      );
      const newMsg = res.data.data;
      setMessages((prev) => [...prev, newMsg]);

      // Update conversation list with latest message
      setConversations((prev) =>
        prev.map((c) =>
          c.clientId === activeClientId
            ? {
                ...c,
                lastMessage: newMsg.content,
                lastSenderType: "COACH",
                lastMessageAt: newMsg.sentAt,
              }
            : c
        )
      );
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

  const filteredConvs = conversations.filter(
    (c) =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.clientPhone.includes(search)
  );

  return (
    // Override parent padding — use full height
    <div className="-mx-6 -my-8 h-[calc(100vh-0px)] flex" style={{ height: "calc(100vh - 0px)" }}>
      {/* ── Left panel: conversation list ─────────────────────────────── */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 mb-3">Inbox</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-6 h-6" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {search ? "No clients match your search." : "No clients yet. Add clients to start messaging them."}
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConversationItem
                key={conv.clientId}
                conv={conv}
                active={conv.clientId === activeClientId}
                onClick={() => openConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: chat thread ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {activeClientId ? (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                {avatarInitial(activeClientName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{activeClientName}</p>
                <p className="text-xs text-slate-400">Client</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-12">
                  <Spinner className="w-6 h-6" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 shrink-0">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="flex-1 resize-none px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 leading-relaxed max-h-32 overflow-y-auto"
                  style={{ minHeight: "42px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {sending ? (
                    <Spinner className="w-4 h-4 text-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state — no conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 select-none">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-base font-medium text-slate-600">Select a conversation</p>
            <p className="text-sm mt-1">Choose a client from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
