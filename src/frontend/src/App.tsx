import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Circle,
  ClipboardList,
  Crown,
  Factory,
  Menu,
  Star,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TimePeriod } from "./backend.d";
import { EnergyDashboard } from "./components/dashboards/EnergyDashboard";
import { MaintenanceDashboard } from "./components/dashboards/MaintenanceDashboard";
import { OwnerDashboard } from "./components/dashboards/OwnerDashboard";
import { PlantHeadDashboard } from "./components/dashboards/PlantHeadDashboard";
import { ProductionManagerDashboard } from "./components/dashboards/ProductionManagerDashboard";
import { QualityDashboard } from "./components/dashboards/QualityDashboard";
import { useActor } from "./hooks/useActor";
import { useSummaryStats } from "./hooks/useQueries";

type DashboardKey =
  | "owner"
  | "plantHead"
  | "productionManager"
  | "maintenance"
  | "quality"
  | "energy";

const NAV_ITEMS: {
  key: DashboardKey;
  label: string;
  icon: React.ElementType;
  ocid: string;
  shortLabel: string;
}[] = [
  {
    key: "owner",
    label: "Owner Dashboard",
    shortLabel: "Owner",
    icon: Crown,
    ocid: "sidebar.owner.link",
  },
  {
    key: "plantHead",
    label: "Plant Head",
    shortLabel: "Plant Head",
    icon: Factory,
    ocid: "sidebar.planthead.link",
  },
  {
    key: "productionManager",
    label: "Production Manager",
    shortLabel: "Production",
    icon: ClipboardList,
    ocid: "sidebar.productionmanager.link",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    shortLabel: "Maintenance",
    icon: Wrench,
    ocid: "sidebar.maintenance.link",
  },
  {
    key: "quality",
    label: "Quality",
    shortLabel: "Quality",
    icon: Star,
    ocid: "sidebar.quality.link",
  },
  {
    key: "energy",
    label: "Energy",
    shortLabel: "Energy",
    icon: Zap,
    ocid: "sidebar.energy.link",
  },
];

const TIME_PERIODS: { key: TimePeriod; label: string; ocid: string }[] = [
  { key: TimePeriod.today, label: "Today", ocid: "timefilter.today.tab" },
  { key: TimePeriod.monthToDate, label: "MTD", ocid: "timefilter.mtd.tab" },
  { key: TimePeriod.yearToDate, label: "YTD", ocid: "timefilter.ytd.tab" },
];

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

const FALLBACK_STATS = {
  oee: 78.4,
  totalProductionToday: 48600,
  recovery: 88.4,
  activePressCount: 6,
  energyCostPerKg: 12.8,
  breakdownHours: 2.4,
};

function SummaryBar() {
  const { data: stats, isLoading } = useSummaryStats();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto">
        {SKELETON_KEYS.map((k) => (
          <Skeleton key={k} className="h-3.5 w-16 flex-shrink-0" />
        ))}
      </div>
    );
  }

  const displayStats = stats ?? FALLBACK_STATS;

  return (
    <div className="flex items-center gap-3 overflow-x-auto text-xs">
      <StatPill
        label="OEE"
        value={`${displayStats.oee.toFixed(1)}%`}
        color={
          displayStats.oee >= 70
            ? "good"
            : displayStats.oee >= 50
              ? "warning"
              : "critical"
        }
      />
      <StatPill
        label="Prod"
        value={`${(displayStats.totalProductionToday / 1000).toFixed(1)} MT`}
        color="good"
      />
      <StatPill
        label="Recovery"
        value={`${displayStats.recovery.toFixed(1)}%`}
        color={
          displayStats.recovery >= 88
            ? "good"
            : displayStats.recovery >= 82
              ? "warning"
              : "critical"
        }
      />
      <StatPill
        label="Presses"
        value={String(displayStats.activePressCount)}
        color="good"
      />
      <StatPill
        label="Nrg/kg"
        value={`₹${displayStats.energyCostPerKg.toFixed(2)}`}
        color={
          displayStats.energyCostPerKg <= 10
            ? "good"
            : displayStats.energyCostPerKg <= 15
              ? "warning"
              : "critical"
        }
      />
      <StatPill
        label="Brkdwn"
        value={`${displayStats.breakdownHours.toFixed(1)}h`}
        color={
          displayStats.breakdownHours <= 2
            ? "good"
            : displayStats.breakdownHours <= 5
              ? "warning"
              : "critical"
        }
      />
    </div>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "good" | "warning" | "critical";
}) {
  const colorClass =
    color === "good"
      ? "text-status-good"
      : color === "warning"
        ? "text-status-warning"
        : "text-status-critical";
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("kpi-value font-bold", colorClass)}>{value}</span>
    </div>
  );
}

export default function App() {
  const [activeDashboard, setActiveDashboard] = useState<DashboardKey>("owner");
  const [period, setPeriod] = useState<TimePeriod>(TimePeriod.today);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const initMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.initializeMockData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setInitialized(true);
    },
    onError: () => setInitialized(true),
  });

  useEffect(() => {
    if (actor && !isFetching && !initialized && !initMutation.isPending) {
      initMutation.mutate();
    }
  }, [actor, isFetching, initialized, initMutation]);

  const handleNavClick = useCallback((key: DashboardKey) => {
    setActiveDashboard(key);
    setSidebarOpen(false);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  const activeNav = NAV_ITEMS.find((n) => n.key === activeDashboard)!;
  const ActiveIcon = activeNav.icon;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={closeSidebar}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeSidebar();
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 w-56 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 py-3 border-b border-sidebar-border">
          <div className="w-7 h-7 rounded-md bg-sidebar-primary/15 border border-sidebar-primary/30 flex items-center justify-center flex-shrink-0">
            <Activity className="w-3.5 h-3.5 text-sidebar-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-sidebar-foreground leading-tight truncate">
              MES Dashboard
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight">
              Aluminium Extrusion
            </p>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground flex-shrink-0"
            onClick={closeSidebar}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live indicator */}
        <div className="px-3 py-1.5 border-b border-sidebar-border/50">
          <div className="flex items-center gap-1.5">
            <Circle className="w-1.5 h-1.5 fill-green-400 text-green-400 animate-pulse" />
            <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
              Live Data
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-1.5 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeDashboard === item.key;
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                data-ocid={item.ocid}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-all duration-150 group",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/25 font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          <p className="text-[9px] text-sidebar-foreground/40 text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-primary transition-colors"
            >
              Built with caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex-shrink-0 bg-white/90 backdrop-blur border-b border-border px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={openSidebar}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Dashboard title */}
            <div className="flex items-center gap-1.5 mr-3">
              <ActiveIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <h1 className="text-xs font-semibold text-foreground truncate">
                {activeNav.label}
              </h1>
            </div>

            {/* Summary stats - hidden on small screens */}
            <div className="hidden md:flex flex-1 min-w-0">
              <SummaryBar />
            </div>

            {/* Time period filter */}
            <div className="flex items-center gap-0.5 ml-auto flex-shrink-0 bg-muted rounded-md p-0.5">
              {TIME_PERIODS.map((tp) => (
                <button
                  type="button"
                  key={tp.key}
                  data-ocid={tp.ocid}
                  onClick={() => setPeriod(tp.key)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-medium rounded transition-all duration-150",
                    period === tp.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile summary bar */}
          <div className="mt-1.5 md:hidden">
            <SummaryBar />
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto px-3 py-3 bg-background">
          {initMutation.isPending ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground">
                Initializing dashboard data...
              </p>
            </div>
          ) : (
            <>
              {activeDashboard === "owner" && (
                <OwnerDashboard period={period} />
              )}
              {activeDashboard === "plantHead" && (
                <PlantHeadDashboard period={period} />
              )}
              {activeDashboard === "productionManager" && (
                <ProductionManagerDashboard period={period} />
              )}
              {activeDashboard === "maintenance" && (
                <MaintenanceDashboard period={period} />
              )}
              {activeDashboard === "quality" && (
                <QualityDashboard period={period} />
              )}
              {activeDashboard === "energy" && (
                <EnergyDashboard period={period} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
