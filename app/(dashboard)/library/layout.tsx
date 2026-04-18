import LibrarySidebar from "@/components/library/LibrarySidebar";
import LibraryUpgradeButton from "@/components/library/LibraryUpgradeButton";
import LibraryOnboardingPill from "@/components/library/LibraryOnboardingPill";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-6 -my-8 min-h-[calc(100vh-0px)] flex flex-col bg-white">
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-lg font-semibold text-slate-900">Library</h1>
        <LibraryUpgradeButton />
      </header>

      <div className="flex flex-1 min-h-0">
        <LibrarySidebar />
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="px-6 py-6">{children}</div>
        </div>
      </div>

      <LibraryOnboardingPill />
    </div>
  );
}
