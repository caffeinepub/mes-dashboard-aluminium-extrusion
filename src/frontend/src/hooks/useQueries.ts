import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TimePeriod } from "../backend.d";
import { useActor } from "./useActor";

export function useInitializeMockData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.initializeMockData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useKpisForDashboard(dashboard: string, period: TimePeriod) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["kpis", dashboard, period],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getKpisForDashboard(dashboard, period);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSummaryStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["summaryStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSummaryStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useChartData(chartType: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["chartData", chartType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChartData(chartType);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function usePressWiseData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pressWiseData"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPressWiseData();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useTopDefects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topDefects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopDefects();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useMaintenanceEvents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["maintenanceEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMaintenanceEvents();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useShiftSummaries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["shiftSummaries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShiftSummaries();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}
