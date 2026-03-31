<script lang="ts">
  import { graphStore } from '$lib/stores/graphStore';
  import { metricsStore, setCalculating, setCoverageResults, setMetricsError } from '$lib/stores/metricsStore';
  import { duPairCoverageService } from '$lib/services/duPairCoverageService';
  import { primePathCoverageService } from '$lib/services/primePathCoverageService';
  import { nodeCoverageService } from '$lib/services/nodeCoverageService';
  import { edgeCoverageService } from '$lib/services/edgeCoverageService';
  import { mccabeComplexityService } from '$lib/services/mccabeComplexityService';
  import { allPathsCoverageService } from '$lib/services/allPathsCoverageService';
  import type { Graph, TestPath, CoverageResult, CoverageMetricType, DefUsePair } from '$lib/utils/types';

  let graph: Graph | null = null;
  let testPaths: TestPath[] = [];
  let duPairs: DefUsePair[] = [];
  let selectedMetrics: Set<CoverageMetricType> = new Set(['du-pair', 'prime-path']);
  let isCalculating = false;

  graphStore.subscribe((state) => {
    graph = state.current;
  });

  metricsStore.subscribe((store) => {
    testPaths = store.testPaths;
    duPairs = store.duPairs;
    selectedMetrics = store.selectedMetrics;
    isCalculating = store.isCalculating;
  });

  function normalizeGraphIds(input: Graph): Graph {
    return {
      ...input,
      nodes: input.nodes.map((node) => ({ ...node, id: String(node.id) })),
      edges: input.edges.map((edge, index) => ({
        ...edge,
        source: String(edge.source),
        target: String(edge.target),
        id: (edge as { id?: string }).id || `${String(edge.source)}->${String(edge.target)}#${index}`,
      })),
    };
  }

  function normalizeTestPaths(input: TestPath[]): string[][] {
    return input.map((path) => path.path.map((nodeId) => String(nodeId)));
  }

  function buildDUPairsForService(
    normalizedGraph: Graph,
    pairs: DefUsePair[]
  ): Array<{ definition: { id: string; variable: string; nodeId: string }; use: { id: string; variable: string; nodeId: string } }> {
    const markings = new Map<string, { defs: string[]; uses: string[] }>();

    for (const pair of pairs) {
      const variable = pair.variable?.trim();
      if (!variable) continue;

      const defNodeId = String(pair.definition);
      const useNodeId = String(pair.use);

      const defMark = markings.get(defNodeId) || { defs: [], uses: [] };
      if (!defMark.defs.includes(variable)) {
        defMark.defs.push(variable);
      }
      markings.set(defNodeId, defMark);

      const useMark = markings.get(useNodeId) || { defs: [], uses: [] };
      if (!useMark.uses.includes(variable)) {
        useMark.uses.push(variable);
      }
      markings.set(useNodeId, useMark);
    }

    const extracted = duPairCoverageService.extractDefinitionsAndUses(normalizedGraph, markings);
    const defsByVariable = new Map<string, Array<{ id: string; variable: string; nodeId: string }>>();
    const usesByVariable = new Map<string, Array<{ id: string; variable: string; nodeId: string }>>();

    for (const definition of extracted.definitions) {
      const arr = defsByVariable.get(definition.variable) || [];
      arr.push(definition);
      defsByVariable.set(definition.variable, arr);
    }

    for (const use of extracted.uses) {
      const arr = usesByVariable.get(use.variable) || [];
      arr.push(use);
      usesByVariable.set(use.variable, arr);
    }

    const servicePairs: Array<{ definition: { id: string; variable: string; nodeId: string }; use: { id: string; variable: string; nodeId: string } }> = [];
    for (const [variable, defs] of defsByVariable.entries()) {
      const uses = usesByVariable.get(variable) || [];
      for (const definition of defs) {
        for (const use of uses) {
          servicePairs.push({ definition, use });
        }
      }
    }

    return servicePairs;
  }

  async function calculateCoverage() {
    if (!graph) {
      setMetricsError('No graph loaded');
      return;
    }

    if (testPaths.length === 0) {
      setMetricsError('No test paths defined');
      return;
    }

    setCalculating(true);
    setMetricsError(null);

    try {
      const emptyMetric = (type: CoverageMetricType) => ({
        type,
        totalRequirements: 0,
        coveredRequirements: 0,
        coverage: 0,
        details: {},
        uncoveredItems: [],
      });

      const result: CoverageResult = {
        id: `coverage-${Date.now()}`,
        graphId: graph.id,
        timestamp: new Date(),
        metrics: {
          'du-pair': emptyMetric('du-pair'),
          'prime-path': emptyMetric('prime-path'),
          'node': emptyMetric('node'),
          'edge': emptyMetric('edge'),
          'all-paths': emptyMetric('all-paths'),
          'mcc': emptyMetric('mcc'),
        },
        testPaths,
        summary: {
          overallCoverage: 0,
          metricsCount: 0,
          testPathsCount: testPaths.length,
        },
      };

      const normalizedGraph = normalizeGraphIds(graph);
      const normalizedTestPaths = normalizeTestPaths(testPaths);

      const metricCalculations: Record<CoverageMetricType, () => any> = {
        'du-pair': () => {
          const servicePairs = buildDUPairsForService(normalizedGraph, duPairs);
          const du = duPairCoverageService.calculateDUPairCoverage(normalizedGraph, servicePairs, normalizedTestPaths);
          return {
            total: du.totalDUPairs,
            covered: du.coveredDUPairs,
            percentage: du.coverage,
            details: { coveredPairs: du.duPairCoverage.length },
            uncovered: []
          };
        },
        'prime-path': () => {
          const primePaths = primePathCoverageService.enumeratePrimePaths(normalizedGraph);
          const prime = primePathCoverageService.calculatePrimePathCoverage(primePaths, normalizedTestPaths);
          return {
            total: prime.totalPrimePaths,
            covered: prime.coveredPrimePaths,
            percentage: prime.coverage,
            details: { pathCount: prime.primePathCoverage.length },
            uncovered: []
          };
        },
        'node': () => {
          const node = nodeCoverageService.calculateNodeCoverage(normalizedGraph, normalizedTestPaths);
          return {
            total: node.totalNodes,
            covered: node.coveredNodes,
            percentage: node.coverage,
            details: { uncovered: node.uncoveredNodes },
            uncovered: []
          };
        },
        'edge': () => {
          const edge = edgeCoverageService.calculateEdgeCoverage(normalizedGraph, normalizedTestPaths);
          return {
            total: edge.totalEdges,
            covered: edge.coveredEdges,
            percentage: edge.coverage,
            details: { uncovered: edge.uncoveredEdges },
            uncovered: []
          };
        },
        'all-paths': () => {
          const all = allPathsCoverageService.calculateAllPathsCoverage(normalizedGraph, normalizedTestPaths);
          return {
            total: all.totalAllPaths,
            covered: all.coveredAllPaths,
            percentage: all.coverage,
            details: { uncovered: all.uncoveredAllPaths },
            uncovered: []
          };
        },
        'mcc': () => {
          const mcc = mccabeComplexityService.calculateLinearlyIndependentPaths(normalizedGraph, normalizedTestPaths);
          return {
            total: mcc.requiredTestPaths,
            covered: mcc.basisPathsCovered,
            percentage: mcc.coverage,
            details: { complexity: mcc.cyclomaticComplexity },
            uncovered: []
          };
        },
      };

      let totalCoverage = 0;
      let metricsCount = 0;

      for (const metric of selectedMetrics) {
        const calculator = metricCalculations[metric];
        if (calculator) {
          const coverageData = calculator();
          result.metrics[metric] = {
            type: metric,
            totalRequirements: coverageData.total,
            coveredRequirements: coverageData.covered,
            coverage: coverageData.percentage,
            details: coverageData.details,
            uncoveredItems: coverageData.uncovered,
          };
          totalCoverage += coverageData.percentage;
          metricsCount++;
        }
      }

      result.summary.overallCoverage = metricsCount > 0 ? totalCoverage / metricsCount : 0;
      result.summary.metricsCount = metricsCount;

      setCoverageResults([result]);
      setCalculating(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error calculating coverage';
      setMetricsError(message);
      setCalculating(false);
    }
  }

  function toggleMetric(metric: CoverageMetricType) {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(metric)) {
      newSelected.delete(metric);
    } else {
      newSelected.add(metric);
    }
    metricsStore.update((state) => ({
      ...state,
      selectedMetrics: newSelected,
    }));
  }
</script>

<div class="coverage-control">
  <div class="control-header">
    <h3>Calculate Coverage</h3>
  </div>

  <div class="control-body">
    <div class="metrics-selection">
      <label class="metric-label">
        <input type="checkbox" checked={selectedMetrics.has('du-pair')} on:change={() => toggleMetric('du-pair')} />
        DU-Pair Coverage
      </label>
      <label class="metric-label">
        <input type="checkbox" checked={selectedMetrics.has('prime-path')} on:change={() => toggleMetric('prime-path')} />
        Prime Path Coverage
      </label>
      <label class="metric-label">
        <input type="checkbox" checked={selectedMetrics.has('node')} on:change={() => toggleMetric('node')} />
        Node Coverage
      </label>
      <label class="metric-label">
        <input type="checkbox" checked={selectedMetrics.has('edge')} on:change={() => toggleMetric('edge')} />
        Edge Coverage
      </label>
      <label class="metric-label">
        <input type="checkbox" checked={selectedMetrics.has('all-paths')} on:change={() => toggleMetric('all-paths')} />
        All Paths Coverage
      </label>
      <label class="metric-label">
        <input type="checkbox" checked={selectedMetrics.has('mcc')} on:change={() => toggleMetric('mcc')} />
        McCabe Complexity
      </label>
    </div>

    <button
      class="btn-calculate"
      on:click={calculateCoverage}
      disabled={!graph || testPaths.length === 0 || selectedMetrics.size === 0 || isCalculating}
    >
      {isCalculating ? 'Calculating...' : 'Calculate Coverage'}
    </button>

    {#if !graph}
      <div class="status-message error">Load a graph first</div>
    {:else if testPaths.length === 0}
      <div class="status-message warning">Add test paths first</div>
    {:else if selectedMetrics.size === 0}
      <div class="status-message warning">Select at least one metric</div>
    {/if}
  </div>
</div>

<style>
  .coverage-control {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: white;
    border-radius: 6px;
    border: 1px solid var(--border-color);
  }

  .control-header {
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-color);
  }

  .control-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .control-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .metrics-selection {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .metric-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
  }

  .metric-label input[type='checkbox'] {
    cursor: pointer;
  }

  .btn-calculate {
    padding: 12px 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-calculate:hover:not(:disabled) {
    background-color: #1d4ed8;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  }

  .btn-calculate:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
  }

  .status-message {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-message.error {
    background-color: #fee2e2;
    color: #dc2626;
  }

  .status-message.warning {
    background-color: #fef3c7;
    color: #d97706;
  }
</style>
