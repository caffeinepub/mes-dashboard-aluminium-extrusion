import { cn } from "@/lib/utils";
import { AlertTriangle, Microscope, Star, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Kpi, TimePeriod } from "../../backend.d";
import {
  useChartData,
  useKpisForDashboard,
  useTopDefects,
} from "../../hooks/useQueries";
import { KPICard, KPICardSkeleton } from "../KPICard";
import { SectionHeader } from "../SectionHeader";

interface Props {
  period: TimePeriod;
}

// ── Fallback dummy KPIs ──
const FALLBACK_KPIS: Kpi[] = [
  {
    name: "First Pass Yield",
    value: 94.8,
    unit: "%",
    trend: 1.1,
    status: "good",
  },
  {
    name: "Internal Rejection",
    value: 1.4,
    unit: "%",
    trend: -0.3,
    status: "good",
  },
  {
    name: "Customer Rejection",
    value: 0.8,
    unit: "%",
    trend: -0.2,
    status: "good",
  },
  {
    name: "Die Line Defects",
    value: 0.6,
    unit: "%",
    trend: -0.1,
    status: "good",
  },
  { name: "Twist Defects", value: 0.4, unit: "%", trend: -0.2, status: "good" },
  {
    name: "Surface Defects",
    value: 1.2,
    unit: "%",
    trend: 0.1,
    status: "warning",
  },
  {
    name: "Dimension Failures",
    value: 0.8,
    unit: "%",
    trend: -0.1,
    status: "good",
  },
  {
    name: "Dent/Scratch Defects",
    value: 0.5,
    unit: "%",
    trend: -0.3,
    status: "good",
  },
  {
    name: "Inspection Pass Rate",
    value: 96.4,
    unit: "%",
    trend: 0.8,
    status: "good",
  },
  {
    name: "Lab Test Failures",
    value: 2,
    unit: "",
    trend: 0,
    status: "warning",
  },
];

const FALLBACK_DEFECTS = [
  { type: "Surface Defects", count: 48, pct: 32 },
  { type: "Dimension Failures", count: 32, pct: 21 },
  { type: "Die Line Defects", count: 24, pct: 16 },
  { type: "Twist/Bend", count: 18, pct: 12 },
  { type: "Dent/Scratch", count: 14, pct: 9 },
];

const FALLBACK_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: Number.parseFloat(
    (93 + Math.sin(i * 0.3) * 3 + (i % 5) * 0.4).toFixed(1),
  ),
}));

const QUALITY_NAMES = [
  "First Pass Yield",
  "Internal Rejection",
  "Customer Rejection",
];

const DEFECT_NAMES = [
  "Die Line Defects",
  "Twist Defects",
  "Surface Defects",
  "Dimension Failures",
  "Dent/Scratch Defects",
];

const INSPECTION_NAMES = ["Inspection Pass Rate", "Lab Test Failures"];

const CustomTooltipBar = ({
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
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-primary font-mono font-bold">
          {payload[0].value.toLocaleString()} defects
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltipLine = ({
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
        <p className="text-status-good font-mono font-bold">
          {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export function QualityDashboard({ period }: Props) {
  const { data: kpis = [], isLoading } = useKpisForDashboard("quality", period);
  const { data: defectRaw = [] } = useTopDefects();
  const { data: chartRaw = [] } = useChartData("quality");

  const defectData = useMemo(
    () =>
      [...defectRaw]
        .sort((a, b) => Number(b.count) - Number(a.count))
        .map((d) => ({
          type: d.defectType,
          count: Number(d.count),
          pct: d.percentage,
        })),
    [defectRaw],
  );

  const qualityTrend = useMemo(
    () =>
      chartRaw.map((d) => ({
        day: Number(d.day),
        value: Number(d.value.toFixed(1)),
      })),
    [chartRaw],
  );

  const activeKpis = kpis.length > 0 ? kpis : FALLBACK_KPIS;
  const activeDefects = defectData.length > 0 ? defectData : FALLBACK_DEFECTS;
  const activeTrend = qualityTrend.length > 0 ? qualityTrend : FALLBACK_TREND;

  const renderGrid = (names: string[], startIdx: number, cols = 3) => {
    if (isLoading) {
      return (
        <div
          className={cn(
            "grid gap-3",
            cols === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : cols === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
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
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
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
    <div className="space-y-8" data-ocid="dashboard.quality.section">
      {/* Quality KPIs */}
      <section>
        <SectionHeader title="Quality KPIs" icon={Star} count={3} />
        {renderGrid(QUALITY_NAMES, 0, 3)}
      </section>

      {/* Defect KPIs */}
      <section>
        <SectionHeader title="Defect KPIs" icon={AlertTriangle} count={5} />
        {renderGrid(DEFECT_NAMES, 3, 5)}
      </section>

      {/* Defect Pareto Chart */}
      <section>
        <SectionHeader title="Defect Pareto Chart" icon={AlertTriangle} />
        <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={activeDefects}
              margin={{ top: 4, right: 8, left: -16, bottom: 20 }}
              layout="vertical"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.88 0.008 255)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "oklch(0.50 0.012 255)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fontSize: 10, fill: "oklch(0.50 0.012 255)" }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar
                dataKey="count"
                name="Count"
                fill="oklch(0.55 0.22 25)"
                radius={[0, 3, 3, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Inspection */}
      <section>
        <SectionHeader title="Inspection KPIs" icon={Microscope} count={2} />
        {renderGrid(INSPECTION_NAMES, 8, 2)}
      </section>

      {/* Quality Trend */}
      <section>
        <SectionHeader title="Quality Trend" icon={TrendingUp} />
        <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={activeTrend}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
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
              <Tooltip content={<CustomTooltipLine />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="oklch(0.55 0.18 145)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
