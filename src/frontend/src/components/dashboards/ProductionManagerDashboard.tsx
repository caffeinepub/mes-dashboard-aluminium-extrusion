import { cn } from "@/lib/utils";
import { Scissors, Settings, Thermometer, Wind, Zap } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Kpi, TimePeriod } from "../../backend.d";
import { useChartData, useKpisForDashboard } from "../../hooks/useQueries";
import { KPICard, KPICardSkeleton } from "../KPICard";
import { SectionHeader } from "../SectionHeader";

interface Props {
  period: TimePeriod;
}

// ── Fallback dummy KPIs ──
const FALLBACK_KPIS: Kpi[] = [
  // Press performance
  {
    name: "Press Output kg/hr",
    value: 284,
    unit: "kg/hr",
    trend: 1.5,
    status: "good",
  },
  {
    name: "Billets Extruded per Hour",
    value: 3.8,
    unit: "billets/hr",
    trend: 0.4,
    status: "good",
  },
  {
    name: "Average Cycle Time",
    value: 4.8,
    unit: "min",
    trend: -2.1,
    status: "good",
  },
  {
    name: "Extrusion Ratio",
    value: 28.4,
    unit: ":1",
    trend: 0,
    status: "good",
  },
  {
    name: "Extrusion Speed",
    value: 8.4,
    unit: "m/min",
    trend: 0.5,
    status: "good",
  },
  // Temperature
  {
    name: "Billet Temperature",
    value: 480,
    unit: "°C",
    trend: -0.4,
    status: "good",
  },
  {
    name: "Container Temperature",
    value: 420,
    unit: "°C",
    trend: 0.2,
    status: "good",
  },
  {
    name: "Exit Temperature",
    value: 510,
    unit: "°C",
    trend: 0.8,
    status: "warning",
  },
  // Process
  {
    name: "Breakthrough Pressure",
    value: 180,
    unit: "bar",
    trend: -1.2,
    status: "good",
  },
  {
    name: "Extrusion Pressure",
    value: 240,
    unit: "bar",
    trend: -0.8,
    status: "good",
  },
  {
    name: "Sealing Pressure",
    value: 160,
    unit: "bar",
    trend: 0.5,
    status: "good",
  },
  // Runout
  {
    name: "Puller Speed",
    value: 8.2,
    unit: "m/min",
    trend: 0.4,
    status: "good",
  },
  {
    name: "Saw Cutting Time",
    value: 12.4,
    unit: "sec",
    trend: -1.8,
    status: "good",
  },
  {
    name: "Stretcher Cycle Time",
    value: 18.6,
    unit: "sec",
    trend: -0.6,
    status: "good",
  },
  // Scrap
  {
    name: "Front End Scrap",
    value: 2.1,
    unit: "%",
    trend: -0.3,
    status: "good",
  },
  {
    name: "Back End Scrap",
    value: 1.8,
    unit: "%",
    trend: -0.2,
    status: "good",
  },
  { name: "Butt Scrap", value: 3.4, unit: "%", trend: 0.2, status: "warning" },
];

const FALLBACK_CHART = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: Number.parseFloat(
    (45 + Math.sin(i * 0.35) * 6 + (i % 4) * 1.2).toFixed(1),
  ),
}));

const PRESS_PERF_NAMES = [
  "Press Output kg/hr",
  "Billets Extruded per Hour",
  "Average Cycle Time",
  "Extrusion Ratio",
  "Extrusion Speed",
];

const TEMP_NAMES = [
  "Billet Temperature",
  "Container Temperature",
  "Exit Temperature",
];

const PROCESS_NAMES = [
  "Breakthrough Pressure",
  "Extrusion Pressure",
  "Sealing Pressure",
];

const RUNOUT_NAMES = [
  "Puller Speed",
  "Saw Cutting Time",
  "Stretcher Cycle Time",
];

const SCRAP_NAMES = ["Front End Scrap", "Back End Scrap", "Butt Scrap"];

function TempCard({ kpi, index }: { kpi: Kpi | undefined; index: number }) {
  if (!kpi) return <KPICardSkeleton />;
  const isNormal = kpi.status === "good";
  const isWarning = kpi.status === "warning";
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all bg-white shadow-sm",
        isNormal
          ? "border-status-good/30"
          : isWarning
            ? "border-status-warning/30"
            : "border-status-critical/30",
      )}
      data-ocid={`kpi.card.${index}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {kpi.name}
        </span>
        <Thermometer
          className={cn(
            "w-4 h-4",
            isNormal
              ? "text-status-good"
              : isWarning
                ? "text-status-warning"
                : "text-status-critical",
          )}
        />
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span
          className={cn(
            "kpi-value text-3xl font-bold",
            isNormal
              ? "text-status-good"
              : isWarning
                ? "text-status-warning"
                : "text-status-critical",
          )}
        >
          {typeof kpi.value === "number" ? kpi.value.toFixed(0) : kpi.value}
        </span>
        <span className="text-sm text-muted-foreground">{kpi.unit}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">Day {label}</p>
        <p className="text-primary font-mono font-bold">
          {payload[0].value.toLocaleString()} MT
        </p>
      </div>
    );
  }
  return null;
};

export function ProductionManagerDashboard({ period }: Props) {
  const { data: kpis = [], isLoading } = useKpisForDashboard(
    "productionManager",
    period,
  );
  const { data: chartRaw = [] } = useChartData("production");

  const chartData = useMemo(
    () =>
      chartRaw.map((d) => ({
        day: Number(d.day),
        value: Number(d.value.toFixed(1)),
      })),
    [chartRaw],
  );

  const activeKpis = kpis.length > 0 ? kpis : FALLBACK_KPIS;
  const activeChart = chartData.length > 0 ? chartData : FALLBACK_CHART;

  const renderGrid = (names: string[], startIdx: number, cols = 4) => {
    if (isLoading) {
      return (
        <div
          className={cn(
            "grid gap-3",
            cols === 5
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
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
          cols === 5
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
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

  return (
    <div className="space-y-8" data-ocid="dashboard.productionmanager.section">
      {/* Press Performance */}
      <section>
        <SectionHeader title="Press Performance" icon={Zap} count={5} />
        {renderGrid(PRESS_PERF_NAMES, 0, 5)}
      </section>

      {/* Temperature KPIs */}
      <section>
        <SectionHeader title="Temperature KPIs" icon={Thermometer} count={3} />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEMP_NAMES.map((n) => (
              <KPICardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEMP_NAMES.map((name, i) => {
              const kpi = activeKpis.find((k) => k.name === name);
              return <TempCard key={name} kpi={kpi} index={i + 6} />;
            })}
          </div>
        )}
      </section>

      {/* Process KPIs */}
      <section>
        <SectionHeader title="Process KPIs" icon={Settings} count={3} />
        {renderGrid(PROCESS_NAMES, 8, 4)}
      </section>

      {/* Runout & Handling */}
      <section>
        <SectionHeader title="Runout & Handling" icon={Wind} count={3} />
        {renderGrid(RUNOUT_NAMES, 11, 4)}
      </section>

      {/* Scrap KPIs */}
      <section>
        <SectionHeader title="Scrap KPIs" icon={Scissors} count={3} />
        {renderGrid(SCRAP_NAMES, 14, 4)}
      </section>

      {/* Production Trend */}
      <section>
        <SectionHeader title="Production Trend" icon={Zap} />
        <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={activeChart}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="prodGradPM" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.55 0.18 230)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.55 0.18 230)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.88 0.008 255)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "oklch(0.50 0.012 255)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.50 0.012 255)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.55 0.18 230)"
                strokeWidth={2}
                fill="url(#prodGradPM)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
