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
    label: "NORMAL",
    glow: "border-status-good/20",
  },
  warning: {
    badge: "bg-status-warning text-status-warning",
    dot: "bg-status-warning",
    label: "WARNING",
    glow: "border-status-warning/20",
  },
  critical: {
    badge: "bg-status-critical text-status-critical",
    dot: "bg-status-critical",
    label: "CRITICAL",
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
        className={cn("rounded-lg border border-border bg-card p-4", className)}
        {...props}
      >
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card p-4 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        cfg.glow,
        className,
      )}
      {...props}
    >
      {/* Status dot */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none truncate pr-2 flex-1">
          {name}
        </span>
        <div
          className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-0.5", cfg.dot)}
        />
      </div>

      {/* Value */}
      <div
        className={cn("flex items-baseline gap-1 mb-2", large ? "mt-1" : "")}
      >
        <span
          className={cn(
            "kpi-value font-bold text-foreground leading-none",
            large ? "text-3xl" : "text-2xl",
          )}
        >
          {typeof value === "number"
            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : value}
        </span>
        {unit && (
          <span className="text-xs text-muted-foreground font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Trend & Status row */}
      <div className="flex items-center justify-between">
        {!trendFlat ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendUp ? "text-status-good" : "text-status-critical",
            )}
          >
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trendAbs.toFixed(1)}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Minus className="w-3 h-3" />
            <span>0.0%</span>
          </div>
        )}
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider border",
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
    <div className="rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
