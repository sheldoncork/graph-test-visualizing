<script lang="ts">
  import { graphStore } from '$lib/stores/graphStore';
  import { metricsStore } from '$lib/stores/metricsStore';
  import type { CoverageMetricType, TestPath } from '$lib/utils/types';

  interface PathAnalysis {
    id: string;
    label: string;
    nodeCount: number;
    edgeCount: number;
    validEdgeCount: number;
    contribution: number;
    status: 'full' | 'partial' | 'uncovered';
  }

  let selectedMetric: CoverageMetricType = 'du-pair';
  let analyses: PathAnalysis[] = [];

  const metricOptions: CoverageMetricType[] = [
    'du-pair',
    'prime-path',
    'node',
    'edge',
    'all-paths',
    'mcc'
  ];

  $: analyses = buildAnalyses($metricsStore.testPaths || []);

  function buildAnalyses(testPaths: TestPath[]): PathAnalysis[] {
    const graph = $graphStore.current;
    if (!graph || testPaths.length === 0) return [];

    const edges = new Set(graph.edges.map((e) => `${String(e.source)}->${String(e.target)}`));
    const totalGraphEdges = Math.max(graph.edges.length, 1);

    return testPaths.map((path, index) => {
      const nodes = path.path || [];
      let validEdgeCount = 0;

      for (let i = 0; i < nodes.length - 1; i += 1) {
        const edgeKey = `${String(nodes[i])}->${String(nodes[i + 1])}`;
        if (edges.has(edgeKey)) {
          validEdgeCount += 1;
        }
      }

      const contribution = Math.min(100, Math.round((validEdgeCount / totalGraphEdges) * 100));
      const status: PathAnalysis['status'] = contribution >= 90 ? 'full' : contribution > 0 ? 'partial' : 'uncovered';

      return {
        id: path.id,
        label: path.label || `Path ${index + 1}`,
        nodeCount: nodes.length,
        edgeCount: Math.max(nodes.length - 1, 0),
        validEdgeCount,
        contribution,
        status
      };
    });
  }

  function statusLabel(status: PathAnalysis['status']): string {
    if (status === 'full') return 'Fully contributing';
    if (status === 'partial') return 'Partially contributing';
    return 'No contribution';
  }

  function metricLabel(metric: CoverageMetricType): string {
    const labels: Record<CoverageMetricType, string> = {
      'du-pair': 'DU-Pair',
      'prime-path': 'Prime Path',
      node: 'Node',
      edge: 'Edge',
      'all-paths': 'All Paths',
      mcc: 'McCabe'
    };
    return labels[metric];
  }

  function topContributors(): PathAnalysis[] {
    return [...analyses].sort((a, b) => b.contribution - a.contribution).slice(0, 5);
  }
</script>

<div class="path-analysis">
  <div class="header">
    <h3>Path Analysis</h3>
    <label for="metric">Metric</label>
    <select id="metric" bind:value={selectedMetric}>
      {#each metricOptions as option}
        <option value={option}>{metricLabel(option)}</option>
      {/each}
    </select>
  </div>

  {#if analyses.length === 0}
    <p class="empty">No test paths available yet.</p>
  {:else}
    <div class="list">
      {#each analyses as item (item.id)}
        <div class="row status-{item.status}">
          <div class="row-head">
            <strong>{item.label}</strong>
            <span>{item.contribution}%</span>
          </div>
          <div class="row-body">
            <span>{item.nodeCount} nodes</span>
            <span>{item.edgeCount} edges</span>
            <span>{item.validEdgeCount} valid edges</span>
            <span>{statusLabel(item.status)}</span>
          </div>
        </div>
      {/each}
    </div>

    <div class="summary">
      <h4>Top Contributors</h4>
      <ul>
        {#each topContributors() as item}
          <li>{item.label}: {item.contribution}%</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .path-analysis {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem;
  }

  .header {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .header label {
    font-size: 0.85rem;
    color: #6b7280;
  }

  .header select {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .empty {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .row {
    border: 1px solid #e5e7eb;
    border-left-width: 4px;
    border-radius: 4px;
    padding: 0.5rem;
    background: #f9fafb;
  }

  .status-full {
    border-left-color: #10b981;
  }

  .status-partial {
    border-left-color: #f59e0b;
  }

  .status-uncovered {
    border-left-color: #ef4444;
  }

  .row-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .row-body {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .summary {
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #eee;
  }

  .summary h4 {
    margin: 0 0 0.4rem 0;
    font-size: 0.9rem;
  }

  .summary ul {
    margin: 0;
    padding-left: 1rem;
    font-size: 0.85rem;
  }
</style>
