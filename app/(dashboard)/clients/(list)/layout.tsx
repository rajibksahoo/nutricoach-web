import ClientsSidebar from "@/components/clients/ClientsSidebar";

export default function ClientsListLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <ClientsSidebar />
      <div className="flex-1 min-w-0 overflow-x-auto">{children}</div>
    </div>
  );
}
