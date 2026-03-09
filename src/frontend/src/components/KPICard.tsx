import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface KPICardProps {
  name: string;
  value: number | string;
  unit?: string;
  trend?: number;
  status?: "good" | "warning" | "critical";
  isLoading?: boolean;
  className?: string;
  "data-ocid"?: string;
  large?: boolean;
}

const statusConfig = {
  good: {
    badge: "bg-status-good text-status-good",
    dot: "bg-status-good",
    label: "OK",
    glow: "border-status-good/20",
  },
  warning: {
    badge: "bg-status-warning text-status-warning",
    dot: "bg-status-warning",
    label: "WARN",
    glow: "border-status-warning/20",
  },
  critical: {
    badge: "bg-status-critical text-status-critical",
    dot: "bg-status-critical",
    label: "CRIT",
    glow: "border-status-critical/20",
  },
};

export function KPICard({
  name,
  value,
  unit,
  trend,
  status = "good",
  isLoading = false,
  className,
  large = false,
  ...props
}: KPICardProps) {
  const cfg = statusConfig[status] ?? statusConfig.good;
  const trendAbs = trend !== undefined ? Math.abs(trend) : 0;
  const trendUp = trend !== undefined && trend > 0;
  const trendFlat = trend === undefined || trend === 0;

  if (isLoading) {
    return (
      <div
        className={cn("rounded-md border border-border bg-card p-3", className)}
        {...props}
      >
        <Skeleton className="h-2.5 w-20 mb-2" />
        <Skeleton className="h-6 w-16 mb-1.5" />
        <Skeleton className="h-2.5 w-12" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-md border bg-card p-3 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
        cfg.glow,
        className,
      )}
      {...props}
    >
      {/* Name + status dot */}
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight pr-1.5 flex-1 line-clamp-2">
          {name}
        </span>
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5",
            cfg.dot,
          )}
        />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-1.5">
        <span
          className={cn(
            "kpi-value font-bold text-foreground leading-none",
            large ? "text-2xl" : "text-xl",
          )}
        >
          {typeof value === "number"
            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : value}
        </span>
        {unit && (
          <span className="text-[10px] text-muted-foreground font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Trend & Status row */}
      <div className="flex items-center justify-between">
        {!trendFlat ? (
          <div
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-medium",
              trendUp ? "text-status-good" : "text-status-critical",
            )}
          >
            {trendUp ? (
              <TrendingUp className="w-2.5 h-2.5" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5" />
            )}
            <span>{trendAbs.toFixed(1)}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Minus className="w-2.5 h-2.5" />
            <span>0.0%</span>
          </div>
        )}
        <span
          className={cn(
            "text-[9px] font-bold px-1 py-0.5 rounded tracking-wider border",
            cfg.badge,
          )}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <Skeleton className="h-2.5 w-20 mb-2" />
      <Skeleton className="h-6 w-16 mb-1.5" />
      <Skeleton className="h-2.5 w-12" />
    </div>
  );
}
