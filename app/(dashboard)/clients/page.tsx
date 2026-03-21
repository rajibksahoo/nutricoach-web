"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import Badge, { clientStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Input from "@/components/ui/Input";
import { UserPlus, Search } from "lucide-react";

const STATUS_TABS = ["ALL", "ACTIVE", "ONBOARDING", "INACTIVE", "PAUSED"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

interface Client {
  id: string;
  name: string;
  phone: string;
  status: string;
  goal: string | null;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/v1/clients")
      .then((res) => { setClients(res.data.data); setFiltered(res.data.data); })
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = clients;
    if (tab !== "ALL") list = list.filter((c) => c.status === tab);
    if (search) list = list.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    );
    setFiltered(list);
  }, [tab, search, clients]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <Link href="/clients/new">
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 text-slate-400">
            {clients.length === 0 ? (
              <>
                <p className="text-sm mb-3">No clients yet.</p>
                <Link href="/clients/new"><Button size="sm">Add your first client</Button></Link>
              </>
            ) : (
              <p className="text-sm">No clients match your filters.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phone}{c.goal ? ` · ${c.goal}` : ""}</p>
                    </div>
                  </div>
                  <Badge variant={clientStatusBadge(c.status)}>{c.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
