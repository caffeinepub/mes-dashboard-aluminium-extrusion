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
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2 mb-2.5", className)}>
      {Icon && (
        <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3 h-3 text-primary" />
        </div>
      )}
      <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-widest">
        {title}
      </h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
