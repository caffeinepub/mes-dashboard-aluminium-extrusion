import { cn } from "@/lib/utils";
import { Flame, Gauge, Wind, Zap } from "lucide-react";
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
  {
    name: "Electricity Consumption",
    value: 48240,
    unit: "kWh",
    trend: -2.1,
    status: "good",
  },
  {
    name: "Electricity per Kg",
    value: 0.924,
    unit: "kWh/kg",
    trend: -1.8,
    status: "good",
  },
  {
    name: "Electricity Cost per Kg",
    value: 8.4,
    unit: "₹/kg",
    trend: -2.4,
    status: "good",
  },
  {
    name: "Gas Consumption",
    value: 12480,
    unit: "Nm³",
    trend: -1.2,
    status: "good",
  },
  {
    name: "Gas per Kg",
    value: 0.238,
    unit: "Nm³/kg",
    trend: -0.8,
    status: "good",
  },
  {
    name: "Billet Furnace Efficiency",
    value: 84.2,
    unit: "%",
    trend: 1.4,
    status: "good",
  },
  {
    name: "Holding Furnace Efficiency",
    value: 88.6,
    unit: "%",
    trend: 0.8,
    status: "good",
  },
  {
    name: "Compressor Load",
    value: 72,
    unit: "%",
    trend: -3.2,
    status: "good",
  },
  {
    name: "Cooling Water Flow",
    value: 18.4,
    unit: "m³/hr",
    trend: 0.6,
    status: "good",
  },
];

const FALLBACK_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: Number.parseFloat(
    (0.92 + Math.sin(i * 0.25) * 0.06 + (i % 4) * 0.01).toFixed(3),
  ),
}));

const ELECTRICITY_NAMES = [
  "Electricity Consumption",
  "Electricity per Kg",
  "Electricity Cost per Kg",
];

const GAS_NAMES = ["Gas Consumption", "Gas per Kg"];

const FURNACE_NAMES = [
  "Billet Furnace Efficiency",
  "Holding Furnace Efficiency",
];

const UTILITY_NAMES = ["Compressor Load", "Cooling Water Flow"];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">Day {label}</p>
        {payload.map((p) => (
          <p
            key={p.name}
            className="font-mono font-bold"
            style={{ color: p.color }}
          >
            {p.name}: {p.value.toFixed(3)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ComparisonCard({
  title,
  elecKpi,
  gasKpi,
}: {
  title: string;
  elecKpi: { value: number; unit: string } | undefined;
  gasKpi: { value: number; unit: string } | undefined;
}) {
  return (
    <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-chart-1" />
          <p className="text-xs text-muted-foreground mb-1">Electricity</p>
          <p className="kpi-value text-xl font-bold text-chart-1">
            {elecKpi?.value?.toFixed(3) ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">{elecKpi?.unit ?? ""}</p>
        </div>
        <div className="text-center">
          <Flame className="w-5 h-5 mx-auto mb-1 text-chart-3" />
          <p className="text-xs text-muted-foreground mb-1">Gas</p>
          <p className="kpi-value text-xl font-bold text-chart-3">
            {gasKpi?.value?.toFixed(3) ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">{gasKpi?.unit ?? ""}</p>
        </div>
      </div>
    </div>
  );
}

export function EnergyDashboard({ period }: Props) {
  const { data: kpis = [], isLoading } = useKpisForDashboard("energy", period);
  const { data: chartRaw = [] } = useChartData("energy");

  const energyTrend = useMemo(
    () =>
      chartRaw.map((d) => ({
        day: Number(d.day),
        value: Number(d.value.toFixed(2)),
      })),
    [chartRaw],
  );

  const activeKpis = kpis.length > 0 ? kpis : FALLBACK_KPIS;
  const activeTrend = energyTrend.length > 0 ? energyTrend : FALLBACK_TREND;

  const elecPerKg = activeKpis.find((k) => k.name === "Electricity per Kg");
  const gasPerKg = activeKpis.find((k) => k.name === "Gas per Kg");
  const elecCostPerKg = activeKpis.find(
    (k) => k.name === "Electricity Cost per Kg",
  );

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
                : "grid-cols-2 sm:grid-cols-4",
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
              : "grid-cols-2 sm:grid-cols-4",
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
    <div className="space-y-8" data-ocid="dashboard.energy.section">
      {/* Electricity */}
      <section>
        <SectionHeader title="Electricity KPIs" icon={Zap} count={3} />
        {renderGrid(ELECTRICITY_NAMES, 0, 3)}
      </section>

      {/* Gas */}
      <section>
        <SectionHeader title="Gas KPIs" icon={Flame} count={2} />
        {renderGrid(GAS_NAMES, 3, 2)}
      </section>

      {/* Electricity vs Gas comparison */}
      <section>
        <SectionHeader title="Energy Cost Comparison" icon={Zap} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ComparisonCard
            title="Cost per Kg"
            elecKpi={
              elecCostPerKg
                ? { value: elecCostPerKg.value, unit: elecCostPerKg.unit }
                : undefined
            }
            gasKpi={
              gasPerKg
                ? { value: gasPerKg.value, unit: gasPerKg.unit }
                : undefined
            }
          />
          <ComparisonCard
            title="Consumption per Kg"
            elecKpi={
              elecPerKg
                ? { value: elecPerKg.value, unit: elecPerKg.unit }
                : undefined
            }
            gasKpi={
              gasPerKg
                ? { value: gasPerKg.value, unit: gasPerKg.unit }
                : undefined
            }
          />
        </div>
      </section>

      {/* Furnace */}
      <section>
        <SectionHeader title="Furnace Efficiency" icon={Gauge} count={2} />
        {renderGrid(FURNACE_NAMES, 5, 2)}
      </section>

      {/* Utilities */}
      <section>
        <SectionHeader title="Utilities" icon={Wind} count={2} />
        {renderGrid(UTILITY_NAMES, 7, 2)}
      </section>

      {/* Energy Trend */}
      <section>
        <SectionHeader title="Energy Consumption Trend" icon={Zap} />
        <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={activeTrend}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.65 0.18 60)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.65 0.18 60)"
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
                name="kWh/kg"
                stroke="oklch(0.65 0.18 60)"
                strokeWidth={2}
                fill="url(#energyGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
