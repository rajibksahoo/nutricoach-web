import LibrarySidebar from "@/components/library/LibrarySidebar";
import LibraryOnboardingPill from "@/components/library/LibraryOnboardingPill";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg)" }}
    >
      <LibrarySidebar />
      <div className="flex-1 min-w-0 overflow-x-auto">{children}</div>
      <LibraryOnboardingPill />
    </div>
  );
}
