"use client";

import * as React from "react";
import { Copy, Check, Send, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { IS_DEV_MODE } from "@/lib/dev-mode";

/**
 * How a coach gives a client access to the portal.
 *
 * Until this existed there was no way at all in production: the only UI
 * producing a portal link sat behind a dev-mode flag, so the client portal was
 * unreachable for every real client.
 *
 * The link carries nothing but the origin. A client's phone identifies exactly
 * one coach (enforced by changeset 028), so signing in needs only their number
 * — no token, no coach id, nothing to expire or leak.
 */
export default function ClientAccessCard({ clientId, clientName, clientPhone }: {
  clientId: string;
  clientName: string;
  clientPhone: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  // Rendered client-side, so the origin is the deployment the coach is using.
  const [loginUrl, setLoginUrl] = React.useState("");
  React.useEffect(() => {
    setLoginUrl(`${window.location.origin}/portal/login`);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(loginUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually");
    }
  };

  const sendWhatsApp = async () => {
    setSending(true);
    try {
      await api.post(`/api/v1/clients/${clientId}/invite`);
      toast.success(`Sent to ${clientName} on WhatsApp`);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      // The server refuses rather than sending a link to the wrong host when
      // PORTAL_URL is unset, so surface its reason rather than a generic error.
      toast.error(msg ?? "Couldn't send the invite");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[14.5px] font-semibold text-slate-900 mb-1">Client access</div>
      <p className="text-xs text-slate-500 mb-3">
        {clientName} signs in at this link with <span className="font-medium text-slate-700">{clientPhone}</span> —
        no password, just an OTP.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 min-w-0 truncate rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700">
          {loginUrl || "…"}
        </code>
        <button
          onClick={copy}
          disabled={!loginUrl}
          aria-label="Copy portal link"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={sendWhatsApp}
          disabled={sending}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {sending ? "Sending…" : "Send on WhatsApp"}
        </button>

        {IS_DEV_MODE && (
          <a
            href={`/portal/login?phone=${clientPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open as client
          </a>
        )}
      </div>
    </div>
  );
}
