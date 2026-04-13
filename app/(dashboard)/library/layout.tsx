import LibraryTabs from "@/components/library/LibraryTabs";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-slate-900">Library</h1>
        <p className="text-sm text-slate-500">Reusable templates — fitness, nutrition, habits, and forms.</p>
      </div>
      <LibraryTabs />
      {children}
    </div>
  );
}
