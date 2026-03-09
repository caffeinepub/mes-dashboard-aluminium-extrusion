import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Kpi {
    status: string;
    trend: number;
    value: number;
    name: string;
    unit: string;
}
export interface SummaryStats {
    oee: number;
    activePressCount: bigint;
    energyCostPerKg: number;
    recovery: number;
    totalProductionToday: number;
    breakdownHours: number;
}
export interface MaintenanceEvent {
    status: string;
    duration: number;
    equipmentName: string;
    eventType: string;
}
export interface PressData {
    oee: number;
    status: string;
    output: number;
    pressName: string;
    recovery: number;
}
export interface ChartDataPoint {
    day: bigint;
    value: number;
}
export interface ShiftSummary {
    oee: number;
    output: number;
    recovery: number;
    shiftName: string;
}
export interface DefectData {
    defectType: string;
    count: bigint;
    percentage: number;
}
export enum TimePeriod {
    today = "today",
    monthToDate = "monthToDate",
    yearToDate = "yearToDate"
}
export interface backendInterface {
    getChartData(chartType: string): Promise<Array<ChartDataPoint>>;
    getKpisForDashboard(dashboard: string, period: TimePeriod): Promise<Array<Kpi>>;
    getMaintenanceEvents(): Promise<Array<MaintenanceEvent>>;
    getPressWiseData(): Promise<Array<PressData>>;
    getShiftSummaries(): Promise<Array<ShiftSummary>>;
    getSummaryStats(): Promise<SummaryStats>;
    getTopDefects(): Promise<Array<DefectData>>;
    initializeMockData(): Promise<void>;
    updateKpi(dashboard: string, newKpis: Array<Kpi>): Promise<void>;
}
