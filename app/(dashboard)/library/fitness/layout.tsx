import FitnessTabs from "@/components/library/FitnessTabs";

export default function FitnessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <FitnessTabs />
      {children}
    </div>
  );
}
