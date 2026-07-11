import { cn } from "@/lib/utils";

interface NilaiBadgeProps {
  nilai?: number;
  className?: string;
}

export function NilaiBadge({ nilai, className }: NilaiBadgeProps) {
  if (nilai === undefined || nilai === null) {
    return (
      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500", className)}>
        Belum dinilai
      </span>
    );
  }

  const colorClass =
    nilai >= 80
      ? "bg-emerald-100 text-emerald-700"
      : nilai >= 60
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colorClass, className)}>
      {nilai}
    </span>
  );
}
