"use client";

import { useParams } from "next/navigation";

export default function ClientDetailPage() {
  const { id } = useParams();
  return (
    <div className="text-slate-500 text-sm py-10 text-center">
      Client detail page — coming soon (ID: {id})
    </div>
  );
}
