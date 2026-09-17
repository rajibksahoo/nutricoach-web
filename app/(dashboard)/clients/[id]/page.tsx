"use client";

import { useParams } from "next/navigation";
import ClientsScreen from "@/components/clients/ClientsScreen";

/**
 * Deep link into the single client surface. Dashboard, roster and activity
 * rows all point at `/clients/{id}`; this selects that client inside
 * `ClientsScreen` rather than rendering a second, separate detail page.
 */
export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ClientsScreen initialClientId={id} />;
}
