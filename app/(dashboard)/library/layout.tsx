import LibraryTabs from "@/components/library/LibraryTabs";
import LibraryOnboardingPill from "@/components/library/LibraryOnboardingPill";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--surface)" }}
    >
      <div className="px-7 pt-6">
        <LibraryTabs />
      </div>
      <div className="px-7 py-6">{children}</div>
      <LibraryOnboardingPill />
    </div>
  );
}
