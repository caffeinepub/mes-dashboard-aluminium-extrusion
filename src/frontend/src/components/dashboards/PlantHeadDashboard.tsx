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
  BarChart2,
  Clock,
  Cog,
  Factory,
  Gauge,
  RefreshCw,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Kpi, TimePeriod } from "../../backend.d";
import {
  useKpisForDashboard,
  usePressWiseData,
  useShiftSummaries,
} from "../../hooks/useQueries";
import { KPICard, KPICardSkeleton } from "../KPICard";
import { SectionHeader } from "../SectionHeader";

interface Props {
  period: TimePeriod;
}

// ── Fallback dummy KPIs ──
const FALLBACK_KPIS: Kpi[] = [
  {
    name: "Production per Press",
    value: 8100,
    unit: "kg",
    trend: 2.4,
    status: "good",
  },
  {
    name: "Shift Production",
    value: 16200,
    unit: "kg",
    trend: 1.8,
    status: "good",
  },
  {
    name: "Production vs Plan",
    value: 96.2,
    unit: "%",
    trend: 1.2,
    status: "good",
  },
  {
    name: "Production vs Capacity",
    value: 82.4,
    unit: "%",
    trend: 2.1,
    status: "good",
  },
  {
    name: "Billets per Shift",
    value: 104,
    unit: "billets",
    trend: 0.8,
    status: "good",
  },
  // OEE
  { name: "Plant OEE", value: 78.4, unit: "%", trend: 1.6, status: "good" },
  { name: "Availability", value: 91.2, unit: "%", trend: 0.9, status: "good" },
  {
    name: "Performance Rate",
    value: 87.6,
    unit: "%",
    trend: 1.3,
    status: "good",
  },
  { name: "Quality Rate", value: 94.8, unit: "%", trend: 0.6, status: "good" },
  // Press
  {
    name: "Ram Speed Average",
    value: 4.8,
    unit: "mm/s",
    trend: 0.3,
    status: "good",
  },
  {
    name: "Breakthrough Pressure",
    value: 180,
    unit: "bar",
    trend: -1.2,
    status: "good",
  },
  {
    name: "Extrusion Speed",
    value: 8.4,
    unit: "m/min",
    trend: 0.5,
    status: "good",
  },
  {
    name: "Puller Speed",
    value: 8.2,
    unit: "m/min",
    trend: 0.4,
    status: "good",
  },
  {
    name: "Puller Force",
    value: 12.4,
    unit: "kN",
    trend: -0.6,
    status: "good",
  },
  // Die
  {
    name: "Die Life",
    value: 1240,
    unit: "billets",
    trend: 2.1,
    status: "good",
  },
  { name: "Die Failures", value: 1, unit: "", trend: 0, status: "warning" },
  {
    name: "Die Change Time",
    value: 22,
    unit: "min",
    trend: -5.2,
    status: "good",
  },
  {
    name: "Die Availability",
    value: 94.2,
    unit: "%",
    trend: 1.0,
    status: "good",
  },
  // Downtime
  {
    name: "Breakdown Hours",
    value: 2.4,
    unit: "hrs",
    trend: -15,
    status: "warning",
  },
  { name: "Downtime Events", value: 3, unit: "", trend: 0, status: "warning" },
  { name: "MTBF", value: 18.4, unit: "hrs", trend: 4.2, status: "good" },
  { name: "MTTR", value: 1.8, unit: "hrs", trend: -8.4, status: "good" },
  // Recovery
  {
    name: "Recovery by Press",
    value: 88.2,
    unit: "%",
    trend: 0.6,
    status: "good",
  },
  {
    name: "Recovery by Alloy",
    value: 87.8,
    unit: "%",
    trend: 0.4,
    status: "good",
  },
  {
    name: "Recovery by Die",
    value: 89.1,
    unit: "%",
    trend: 0.8,
    status: "good",
  },
  {
    name: "Recovery by Profile",
    value: 88.6,
    unit: "%",
    trend: 0.5,
    status: "good",
  },
];

const FALLBACK_PRESS_DATA = [
  { pressName: "Press 1", output: 8420, oee: 81.2 },
  { pressName: "Press 2", output: 7980, oee: 76.8 },
  { pressName: "Press 3", output: 8640, oee: 83.4 },
  { pressName: "Press 4", output: 7620, oee: 74.2 },
  { pressName: "Press 5", output: 8240, oee: 79.6 },
  { pressName: "Press 6", output: 8100, oee: 78.4 },
];

const FALLBACK_SHIFT_DATA = [
  {
    shiftName: "Shift A (06:00–14:00)",
    output: 16420,
    oee: 81.2,
    recovery: 88.6,
  },
  {
    shiftName: "Shift B (14:00–22:00)",
    output: 15840,
    oee: 76.4,
    recovery: 87.8,
  },
  {
    shiftName: "Shift C (22:00–06:00)",
    output: 16240,
    oee: 78.8,
    recovery: 88.4,
  },
];

const PRODUCTION_NAMES = [
  "Production per Press",
  "Shift Production",
  "Production vs Plan",
  "Production vs Capacity",
  "Billets per Shift",
];

const OEE_NAMES = [
  "Plant OEE",
  "Availability",
  "Performance Rate",
  "Quality Rate",
];

const PRESS_NAMES = [
  "Ram Speed Average",
  "Breakthrough Pressure",
  "Extrusion Speed",
  "Puller Speed",
  "Puller Force",
];

const DIE_NAMES = [
  "Die Life",
  "Die Failures",
  "Die Change Time",
  "Die Availability",
];

const DOWNTIME_NAMES = ["Breakdown Hours", "Downtime Events", "MTBF", "MTTR"];

const RECOVERY_NAMES = [
  "Recovery by Press",
  "Recovery by Alloy",
  "Recovery by Die",
  "Recovery by Profile",
];

function OEEGauge({
  label,
  value,
  status,
  "data-ocid": dataOcid,
}: { label: string; value: number; status: string; "data-ocid"?: string }) {
  const color =
    status === "good"
      ? "oklch(0.55 0.18 145)"
      : status === "warning"
        ? "oklch(0.65 0.18 60)"
        : "oklch(0.55 0.22 25)";

  return (
    <div
      className="bg-white border border-border rounded-lg p-3 flex flex-col items-center gap-1.5 shadow-sm"
      data-ocid={dataOcid}
    >
      <span className="text-xs text-muted-foreground uppercase tracking-wider text-center">
        {label}
      </span>
      <span className="kpi-value text-2xl font-bold" style={{ color }}>
        {value.toFixed(1)}%
      </span>
      <Progress
        value={value}
        className="w-full h-2"
        style={{ "--progress-color": color } as React.CSSProperties}
      />
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1 font-medium">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="font-mono" style={{ color: p.color }}>
            {p.name}: {p.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PlantHeadDashboard({ period }: Props) {
  const { data: kpis = [], isLoading } = useKpisForDashboard(
    "plantHead",
    period,
  );
  const { data: pressData = [] } = usePressWiseData();
  const { data: shiftData = [] } = useShiftSummaries();

  const activeKpis = kpis.length > 0 ? kpis : FALLBACK_KPIS;
  const activePressData =
    pressData.length > 0 ? pressData : FALLBACK_PRESS_DATA;
  const activeShiftData =
    shiftData.length > 0 ? shiftData : FALLBACK_SHIFT_DATA;

  const oeeKpis = useMemo(
    () =>
      OEE_NAMES.map((name) => activeKpis.find((k) => k.name === name)).filter(
        Boolean,
      ) as Kpi[],
    [activeKpis],
  );

  const renderGrid = (names: string[], startIdx: number, cols = 4) => {
    if (isLoading) {
      return (
        <div
          className={`grid grid-cols-2 sm:grid-cols-${Math.min(cols, 3)} lg:grid-cols-${cols} gap-3`}
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
          cols === 4
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            : cols === 5
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
    <div className="space-y-4" data-ocid="dashboard.planthead.section">
      {/* Production */}
      <section>
        <SectionHeader title="Production" icon={Factory} count={5} />
        {renderGrid(PRODUCTION_NAMES, 0, 5)}
      </section>

      {/* OEE Gauges */}
      <section>
        <SectionHeader title="OEE & Efficiency" icon={Gauge} count={4} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {oeeKpis.length > 0
            ? oeeKpis.map((kpi, i) => (
                <OEEGauge
                  key={kpi.name}
                  label={kpi.name}
                  value={kpi.value}
                  status={kpi.status}
                  data-ocid={`kpi.card.${i + 1}`}
                />
              ))
            : OEE_NAMES.map((n, i) => (
                <OEEGauge
                  key={n}
                  label={n}
                  value={0}
                  status="good"
                  data-ocid={`kpi.card.${i + 1}`}
                />
              ))}
        </div>
      </section>

      {/* Press KPIs */}
      <section>
        <SectionHeader title="Press" icon={Cog} count={5} />
        {renderGrid(PRESS_NAMES, 4, 5)}
      </section>

      {/* Die KPIs */}
      <section>
        <SectionHeader title="Die" icon={RefreshCw} count={4} />
        {renderGrid(DIE_NAMES, 9, 4)}
      </section>

      {/* Downtime */}
      <section>
        <SectionHeader title="Downtime" icon={Clock} count={4} />
        {renderGrid(DOWNTIME_NAMES, 13, 4)}
      </section>

      {/* Recovery */}
      <section>
        <SectionHeader
          title="Recovery by Dimension"
          icon={Activity}
          count={4}
        />
        {renderGrid(RECOVERY_NAMES, 17, 4)}
      </section>

      {/* Press-wise Chart */}
      <section>
        <SectionHeader title="Press-Wise Output & OEE" icon={BarChart2} />
        <div className="bg-white border border-border rounded-lg p-3 shadow-sm">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={activePressData}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.88 0.008 255)"
              />
              <XAxis
                dataKey="pressName"
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
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  color: "oklch(0.50 0.012 255)",
                }}
              />
              <Bar
                dataKey="output"
                name="Output (kg)"
                fill="oklch(0.55 0.18 230)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="oee"
                name="OEE %"
                fill="oklch(0.55 0.18 145)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Shift Summary Table */}
      <section>
        <SectionHeader title="Shift Summary" icon={Activity} />
        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/30">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Shift
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                  Output (kg)
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                  OEE %
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                  Recovery %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeShiftData.map((s, i) => (
                <TableRow
                  key={s.shiftName}
                  className="border-border hover:bg-accent/30"
                  data-ocid={`shift.row.${i + 1}`}
                >
                  <TableCell className="font-medium text-sm">
                    {s.shiftName}
                  </TableCell>
                  <TableCell className="text-right kpi-value text-sm">
                    {s.output.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "kpi-value text-sm font-bold",
                        s.oee >= 70
                          ? "text-status-good"
                          : s.oee >= 50
                            ? "text-status-warning"
                            : "text-status-critical",
                      )}
                    >
                      {s.oee.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "kpi-value text-sm font-bold",
                        s.recovery >= 88
                          ? "text-status-good"
                          : s.recovery >= 82
                            ? "text-status-warning"
                            : "text-status-critical",
                      )}
                    >
                      {s.recovery.toFixed(1)}%
                    </span>
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
