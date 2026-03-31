/**
 * Metrics Store
 * Manages coverage metrics selection and results
 */
import { writable, type Writable, derived } from 'svelte/store';
import type { CoverageMetricType, CoverageResult, CoverageMetric, TestPath } from '$lib/utils/types';

export interface MetricsState {
  selectedMetrics: Set<CoverageMetricType>;
  results: CoverageResult[] | null;
  testPaths: TestPath[];
  isCalculating: boolean;
  error: string | null;
}

const initialState: MetricsState = {
  selectedMetrics: new Set(['du-pair', 'prime-path']), // Default: DU-pair and prime-path
  results: null,
  testPaths: [],
  isCalculating: false,
  error: null
};

export const metricsStore: Writable<MetricsState> = writable(initialState);

/**
 * Toggle a metric on/off
 */
export function toggleMetric(metric: CoverageMetricType): void {
  metricsStore.update((state) => {
    const newSelected = new Set(state.selectedMetrics);
    if (newSelected.has(metric)) {
      newSelected.delete(metric);
    } else {
      newSelected.add(metric);
    }
    return {
      ...state,
      selectedMetrics: newSelected
    };
  });
}

/**
 * Set selected metrics
 */
export function setSelectedMetrics(metrics: CoverageMetricType[]): void {
  metricsStore.update((state) => ({
    ...state,
    selectedMetrics: new Set(metrics)
  }));
}

/**
 * Update coverage results
 */
export function setCoverageResults(results: CoverageResult[]): void {
  metricsStore.update((state) => ({
    ...state,
    results,
    isCalculating: false,
    error: null
  }));
}

/**
 * Set test paths
 */
export function setTestPaths(testPaths: TestPath[]): void {
  metricsStore.update((state) => ({
    ...state,
    testPaths
  }));
}

/**
 * Set calculating state
 */
export function setCalculating(isCalculating: boolean): void {
  metricsStore.update((state) => ({
    ...state,
    isCalculating
  }));
}

/**
 * Set error message
 */
export function setMetricsError(error: string | null): void {
  metricsStore.update((state) => ({
    ...state,
    error
  }));
}

/**
 * Get results for a specific metric
 */
export function getMetricResult(store: MetricsState, metric: CoverageMetricType): CoverageMetric | null {
  if (!store.results || store.results.length === 0) return null;
  const firstResult = store.results[0];
  return firstResult.metrics[metric] || null;
}

/**
 * Derived store: whether all required metrics are selected
 */
export const hasSelectedMetrics = derived(metricsStore, ($store) => $store.selectedMetrics.size > 0);

/**
 * Derived store: average coverage across all metrics
 */
export const averageCoverage = derived(metricsStore, ($store) => {
  if (!$store.results || $store.results.length === 0) return 0;
  const firstResult = $store.results[0];
  const metrics = Object.values(firstResult.metrics);
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + m.coverage, 0);
  return Math.round(total / metrics.length);
});
