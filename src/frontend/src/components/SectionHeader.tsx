import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  count?: number;
  className?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  count,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      {Icon && (
        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      )}
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
        {title}
      </h2>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
          {count} KPIs
        </span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
