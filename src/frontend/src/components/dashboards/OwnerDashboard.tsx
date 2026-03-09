import {
  AlertTriangle,
  DollarSign,
  Factory,
  Recycle,
  Star,
  TrendingUp,
  Truck,
} from "lucide-react";
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

// ── Fallback dummy KPIs shown when backend data hasn't loaded yet ──
const FALLBACK_KPIS: Kpi[] = [
  // Financial
  {
    name: "Revenue Today",
    value: 4820000,
    unit: "₹",
    trend: 3.2,
    status: "good",
  },
  {
    name: "Revenue MTD",
    value: 124000000,
    unit: "₹",
    trend: 5.1,
    status: "good",
  },
  {
    name: "Revenue YTD",
    value: 1420000000,
    unit: "₹",
    trend: 2.8,
    status: "good",
  },
  {
    name: "Profit per MT",
    value: 4250,
    unit: "₹/MT",
    trend: 1.5,
    status: "good",
  },
  {
    name: "Contribution Margin",
    value: 28.4,
    unit: "%",
    trend: -0.8,
    status: "warning",
  },
  { name: "EBITDA Margin", value: 18.6, unit: "%", trend: 1.2, status: "good" },
  {
    name: "Cost per Kg",
    value: 182,
    unit: "₹/kg",
    trend: -2.1,
    status: "warning",
  },
  {
    name: "Average Selling Price",
    value: 254,
    unit: "₹/kg",
    trend: 0.5,
    status: "good",
  },
  // Production
  {
    name: "Total Production Today",
    value: 48.6,
    unit: "MT",
    trend: 4.2,
    status: "good",
  },
  {
    name: "MTD Production",
    value: 1248,
    unit: "MT",
    trend: 3.8,
    status: "good",
  },
  {
    name: "Capacity Utilization",
    value: 82.4,
    unit: "%",
    trend: 2.1,
    status: "good",
  },
  {
    name: "Press Productivity",
    value: 284,
    unit: "kg/hr",
    trend: 1.5,
    status: "good",
  },
  { name: "Running Presses", value: 6, unit: "", trend: 0, status: "good" },
  { name: "Idle Presses", value: 1, unit: "", trend: 0, status: "warning" },
  {
    name: "Billets Consumed",
    value: 312,
    unit: "billets",
    trend: 3.2,
    status: "good",
  },
  {
    name: "Extruded Length",
    value: 18420,
    unit: "m",
    trend: 2.8,
    status: "good",
  },
  // Recovery
  {
    name: "Overall Recovery",
    value: 88.4,
    unit: "%",
    trend: 0.6,
    status: "good",
  },
  { name: "Scrap %", value: 4.2, unit: "%", trend: -1.2, status: "warning" },
  { name: "Rework %", value: 2.1, unit: "%", trend: 0.3, status: "warning" },
  {
    name: "Start-up Scrap %",
    value: 1.8,
    unit: "%",
    trend: -0.5,
    status: "good",
  },
  {
    name: "Butt Scrap %",
    value: 3.4,
    unit: "%",
    trend: 0.2,
    status: "warning",
  },
  {
    name: "Handling Scrap %",
    value: 0.6,
    unit: "%",
    trend: -0.1,
    status: "good",
  },
  // Quality
  { name: "Rejection %", value: 1.4, unit: "%", trend: -0.3, status: "good" },
  {
    name: "Customer Complaints",
    value: 2,
    unit: "",
    trend: 0,
    status: "warning",
  },
  {
    name: "First Pass Yield",
    value: 94.8,
    unit: "%",
    trend: 1.1,
    status: "good",
  },
  { name: "Warranty Claims", value: 0, unit: "", trend: 0, status: "good" },
  // Delivery
  {
    name: "Dispatch Today",
    value: 52.4,
    unit: "MT",
    trend: 6.2,
    status: "good",
  },
  { name: "Dispatch MTD", value: 1320, unit: "MT", trend: 4.5, status: "good" },
  {
    name: "On-Time Delivery %",
    value: 91.2,
    unit: "%",
    trend: 2.1,
    status: "good",
  },
  { name: "Delayed Orders", value: 4, unit: "", trend: -1, status: "warning" },
  // Risk
  {
    name: "Press Breakdown Hours",
    value: 2.4,
    unit: "hrs",
    trend: -15,
    status: "warning",
  },
  {
    name: "Energy Cost per Kg",
    value: 12.8,
    unit: "₹/kg",
    trend: -3.2,
    status: "warning",
  },
  {
    name: "Raw Material Price Index",
    value: 108.4,
    unit: "",
    trend: 2.1,
    status: "warning",
  },
];

const FALLBACK_CHART = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: Number.parseFloat(
    (45 + Math.sin(i * 0.4) * 8 + (i % 3) * 1.5).toFixed(1),
  ),
}));

function groupKpis(kpis: Kpi[], names: string[]) {
  return names
    .map((name) => kpis.find((k) => k.name === name))
    .filter(Boolean) as Kpi[];
}

const FINANCIAL_NAMES = [
  "Revenue Today",
  "Revenue MTD",
  "Revenue YTD",
  "Profit per MT",
  "Contribution Margin",
  "EBITDA Margin",
  "Cost per Kg",
  "Average Selling Price",
];

const PRODUCTION_NAMES = [
  "Total Production Today",
  "MTD Production",
  "Capacity Utilization",
  "Press Productivity",
  "Running Presses",
  "Idle Presses",
  "Billets Consumed",
  "Extruded Length",
];

const RECOVERY_NAMES = [
  "Overall Recovery",
  "Scrap %",
  "Rework %",
  "Start-up Scrap %",
  "Butt Scrap %",
  "Handling Scrap %",
];

const QUALITY_NAMES = [
  "Rejection %",
  "Customer Complaints",
  "First Pass Yield",
  "Warranty Claims",
];

const DELIVERY_NAMES = [
  "Dispatch Today",
  "Dispatch MTD",
  "On-Time Delivery %",
  "Delayed Orders",
];

const RISK_NAMES = [
  "Press Breakdown Hours",
  "Energy Cost per Kg",
  "Raw Material Price Index",
];

function renderKpiGrid(
  kpis: Kpi[],
  names: string[],
  isLoading: boolean,
  startIdx = 0,
) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {names.map((n) => (
          <KPICardSkeleton key={n} />
        ))}
      </div>
    );
  }

  const grouped = groupKpis(kpis, names);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {names.map((name, i) => {
        const kpi = grouped.find((k) => k.name === name);
        const ocidIdx = startIdx + i + 1;
        if (!kpi) {
          return (
            <KPICard
              key={name}
              name={name}
              value="—"
              status="good"
              data-ocid={`kpi.card.${ocidIdx}`}
            />
          );
        }
        return (
          <KPICard
            key={kpi.name}
            name={kpi.name}
            value={kpi.value}
            unit={kpi.unit}
            trend={kpi.trend}
            status={kpi.status as "good" | "warning" | "critical"}
            data-ocid={`kpi.card.${ocidIdx}`}
          />
        );
      })}
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
  if (active && payload && payload.length) {
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

export function OwnerDashboard({ period }: Props) {
  const { data: kpis = [], isLoading } = useKpisForDashboard("owner", period);
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

  return (
    <div className="space-y-8" data-ocid="dashboard.owner.section">
      {/* Financial KPIs */}
      <section>
        <SectionHeader title="Financial KPIs" icon={DollarSign} count={8} />
        {renderKpiGrid(activeKpis, FINANCIAL_NAMES, isLoading, 0)}
      </section>

      {/* Production KPIs */}
      <section>
        <SectionHeader title="Production KPIs" icon={Factory} count={8} />
        {renderKpiGrid(activeKpis, PRODUCTION_NAMES, isLoading, 8)}
      </section>

      {/* Production Trend Chart */}
      <section>
        <SectionHeader title="Production Trend — 30 Days" icon={TrendingUp} />
        <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={activeChart}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#prodGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recovery & Scrap */}
      <section>
        <SectionHeader title="Recovery & Scrap" icon={Recycle} count={6} />
        {renderKpiGrid(activeKpis, RECOVERY_NAMES, isLoading, 16)}
      </section>

      {/* Quality */}
      <section>
        <SectionHeader title="Quality KPIs" icon={Star} count={4} />
        {renderKpiGrid(activeKpis, QUALITY_NAMES, isLoading, 22)}
      </section>

      {/* Delivery */}
      <section>
        <SectionHeader title="Delivery KPIs" icon={Truck} count={4} />
        {renderKpiGrid(activeKpis, DELIVERY_NAMES, isLoading, 26)}
      </section>

      {/* Risk Indicators */}
      <section>
        <SectionHeader title="Risk Indicators" icon={AlertTriangle} count={3} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isLoading
            ? RISK_NAMES.map((n) => <KPICardSkeleton key={n} />)
            : RISK_NAMES.map((name, i) => {
                const kpi = activeKpis.find((k) => k.name === name);
                return kpi ? (
                  <KPICard
                    key={kpi.name}
                    name={kpi.name}
                    value={kpi.value}
                    unit={kpi.unit}
                    trend={kpi.trend}
                    status={kpi.status as "good" | "warning" | "critical"}
                    data-ocid={`kpi.card.${30 + i + 1}`}
                  />
                ) : (
                  <KPICard
                    key={name}
                    name={name}
                    value="—"
                    status="good"
                    data-ocid={`kpi.card.${30 + i + 1}`}
                  />
                );
              })}
        </div>
      </section>
    </div>
  );
}
