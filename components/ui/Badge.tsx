import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "yellow" | "red" | "blue" | "slate";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  green:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  red:    "bg-red-50 text-red-700 ring-1 ring-red-200",
  blue:   "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  slate:  "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export default function Badge({ children, variant = "slate", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function clientStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    ACTIVE: "green",
    ONBOARDING: "blue",
    INACTIVE: "slate",
    PAUSED: "yellow",
  };
  return map[status] ?? "slate";
}
