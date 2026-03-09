import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertOctagon,
  CheckSquare,
  Heart,
  Package,
} from "lucide-react";
import type { TimePeriod } from "../../backend.d";
import {
  useKpisForDashboard,
  useMaintenanceEvents,
} from "../../hooks/useQueries";
import { KPICard, KPICardSkeleton } from "../KPICard";
import { SectionHeader } from "../SectionHeader";

interface Props {
  period: TimePeriod;
}

// ── Fallback dummy KPIs ──
const FALLBACK_KPIS = [
  { name: "MTBF", value: 18.4, unit: "hrs", trend: 4.2, status: "good" },
  { name: "MTTR", value: 1.8, unit: "hrs", trend: -8.4, status: "good" },
  {
    name: "Equipment Availability",
    value: 91.2,
    unit: "%",
    trend: 0.9,
    status: "good",
  },
  { name: "Breakdown Events", value: 3, unit: "", trend: 0, status: "warning" },
  {
    name: "Breakdown Hours",
    value: 2.4,
    unit: "hrs",
    trend: -15,
    status: "warning",
  },
  {
    name: "Top Downtime Reasons",
    value: 3,
    unit: "types",
    trend: 0,
    status: "warning",
  },
  { name: "PM Compliance", value: 88.4, unit: "%", trend: 2.1, status: "good" },
  { name: "PM Overdue Tasks", value: 2, unit: "", trend: 0, status: "warning" },
  {
    name: "Hydraulic System Health",
    value: 92,
    unit: "%",
    trend: 1.0,
    status: "good",
  },
  { name: "Furnace Health", value: 88, unit: "%", trend: -0.5, status: "good" },
  { name: "Saw Health", value: 94, unit: "%", trend: 0.8, status: "good" },
  { name: "Puller Health", value: 96, unit: "%", trend: 1.2, status: "good" },
  {
    name: "Spare Stock Value",
    value: 1420000,
    unit: "₹",
    trend: -3.2,
    status: "warning",
  },
  {
    name: "Critical Spare Availability",
    value: 94,
    unit: "%",
    trend: 1.5,
    status: "good",
  },
];

const FALLBACK_EVENTS = [
  {
    equipmentName: "Press 2 - Hydraulic Pump",
    eventType: "Breakdown",
    duration: 4.2,
    status: "completed",
  },
  {
    equipmentName: "Billet Furnace #1",
    eventType: "Preventive",
    duration: 2.8,
    status: "completed",
  },
  {
    equipmentName: "Extrusion Press 4",
    eventType: "Breakdown",
    duration: 1.6,
    status: "in-progress",
  },
  {
    equipmentName: "Cooling Table Motor",
    eventType: "Corrective",
    duration: 1.2,
    status: "completed",
  },
  {
    equipmentName: "Saw Unit #2",
    eventType: "Preventive",
    duration: 0.8,
    status: "scheduled",
  },
];

const RELIABILITY_NAMES = ["MTBF", "MTTR", "Equipment Availability"];
const BREAKDOWN_NAMES = [
  "Breakdown Events",
  "Breakdown Hours",
  "Top Downtime Reasons",
];
const PM_NAMES = ["PM Compliance", "PM Overdue Tasks"];
const ASSET_NAMES = [
  "Hydraulic System Health",
  "Furnace Health",
  "Saw Health",
  "Puller Health",
];
const SPARE_NAMES = ["Spare Stock Value", "Critical Spare Availability"];

function AssetHealthBar({
  name,
  value,
  status,
  "data-ocid": dataOcid,
}: { name: string; value: number; status: string; "data-ocid"?: string }) {
  const color =
    status === "good"
      ? "oklch(0.55 0.18 145)"
      : status === "warning"
        ? "oklch(0.65 0.18 60)"
        : "oklch(0.55 0.22 25)";

  return (
    <div
      className="bg-white border border-border rounded-lg p-4 shadow-sm"
      data-ocid={dataOcid}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {name}
        </span>
        <span className="kpi-value text-sm font-bold" style={{ color }}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function getStatusVariant(
  status: string,
): "default" | "destructive" | "secondary" | "outline" {
  if (status === "completed") return "default";
  if (status === "critical" || status === "breakdown") return "destructive";
  return "secondary";
}

export function MaintenanceDashboard({ period }: Props) {
  const { data: kpis = [], isLoading } = useKpisForDashboard(
    "maintenance",
    period,
  );
  const { data: events = [] } = useMaintenanceEvents();

  const activeKpis = kpis.length > 0 ? kpis : FALLBACK_KPIS;
  const activeEvents = events.length > 0 ? events : FALLBACK_EVENTS;

  const renderGrid = (names: string[], startIdx: number, cols = 4) => {
    if (isLoading) {
      return (
        <div
          className={cn(
            "grid gap-3",
            cols === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : cols === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          )}
        >
          {names.map((n) => (
            <KPICardSkeleton key={n} />
          ))}
        </div>
      );
    }
    return (
      <div
        className={cn(
          "grid gap-3",
          cols === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : cols === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        )}
      >
        {names.map((name, i) => {
          const kpi = activeKpis.find((k) => k.name === name);
          return kpi ? (
            <KPICard
              key={kpi.name}
              name={kpi.name}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              status={kpi.status as "good" | "warning" | "critical"}
              data-ocid={`kpi.card.${startIdx + i + 1}`}
            />
          ) : (
            <KPICard
              key={name}
              name={name}
              value="—"
              status="good"
              data-ocid={`kpi.card.${startIdx + i + 1}`}
            />
          );
        })}
      </div>
    );
  };

  // Top 5 events by breakdown duration
  const topEvents = [...activeEvents]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  return (
    <div className="space-y-8" data-ocid="dashboard.maintenance.section">
      {/* Reliability */}
      <section>
        <SectionHeader title="Reliability KPIs" icon={Activity} count={3} />
        {renderGrid(RELIABILITY_NAMES, 0, 3)}
      </section>

      {/* Breakdown */}
      <section>
        <SectionHeader title="Breakdown KPIs" icon={AlertOctagon} count={3} />
        {renderGrid(BREAKDOWN_NAMES, 3, 3)}
      </section>

      {/* Top Downtime */}
      <section>
        <SectionHeader title="Top Downtime Events" icon={AlertOctagon} />
        <div className="space-y-2">
          {topEvents.map((e, i) => {
            const pct = Math.min(
              (e.duration / (topEvents[0]?.duration || 1)) * 100,
              100,
            );
            return (
              <div
                key={`${e.equipmentName}-${i}`}
                className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 shadow-sm"
                data-ocid={`maintenance.item.${i + 1}`}
              >
                <span className="text-xs text-muted-foreground w-4 font-mono">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {e.equipmentName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0 kpi-value">
                      {e.duration.toFixed(1)}h
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-status-critical/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {e.eventType}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Preventive Maintenance */}
      <section>
        <SectionHeader
          title="Preventive Maintenance"
          icon={CheckSquare}
          count={2}
        />
        {renderGrid(PM_NAMES, 6, 2)}
      </section>

      {/* Asset Health */}
      <section>
        <SectionHeader title="Asset Health" icon={Heart} count={4} />
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ASSET_NAMES.map((n) => (
              <KPICardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ASSET_NAMES.map((name, i) => {
              const kpi = activeKpis.find((k) => k.name === name);
              return (
                <AssetHealthBar
                  key={name}
                  name={name}
                  value={kpi?.value ?? 0}
                  status={kpi?.status ?? "good"}
                  data-ocid={`kpi.card.${8 + i + 1}`}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Spare Parts */}
      <section>
        <SectionHeader title="Spare Parts" icon={Package} count={2} />
        {renderGrid(SPARE_NAMES, 12, 2)}
      </section>

      {/* Maintenance Events Table */}
      <section>
        <SectionHeader title="Maintenance Events Log" icon={AlertOctagon} />
        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/30">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Equipment
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                  Duration (hr)
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEvents.map((e, i) => (
                <TableRow
                  key={`${e.equipmentName}-${i}`}
                  className="border-border hover:bg-accent/30"
                  data-ocid={`maintenance.event.row.${i + 1}`}
                >
                  <TableCell className="font-medium text-sm">
                    {e.equipmentName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.eventType}
                  </TableCell>
                  <TableCell className="text-right kpi-value text-sm">
                    {e.duration.toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(e.status)}
                      className="text-xs"
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
