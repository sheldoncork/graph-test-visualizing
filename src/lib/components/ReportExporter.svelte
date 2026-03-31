<script lang="ts">
  import { graphStore } from '$lib/stores/graphStore';
  import { metricsStore } from '$lib/stores/metricsStore';
  import type { CoverageMetricType } from '$lib/utils/types';

  type ExportFormat = 'csv' | 'json' | 'txt';

  let selectedFormat: ExportFormat = 'csv';
  let includeDetails = true;
  let isExporting = false;

  const metricKeys: CoverageMetricType[] = ['du-pair', 'prime-path', 'node', 'edge', 'all-paths', 'mcc'];

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

  function exportReport() {
    isExporting = true;
    try {
      const content =
        selectedFormat === 'csv'
          ? makeCsvReport()
          : selectedFormat === 'json'
            ? makeJsonReport()
            : makeTextReport();
      download(content, `coverage-report.${selectedFormat}`);
    } catch (err) {
      console.error(err);
      alert('Failed to export coverage report.');
    } finally {
      isExporting = false;
    }
  }

  function makeCsvReport(): string {
    const graph = $graphStore.current;
    const first = $metricsStore.results?.[0];
    const lines: string[] = [];

    lines.push('Graph,Metric,Coverage (%),Covered,Total');

    metricKeys.forEach((key) => {
      const metric = first?.metrics[key];
      lines.push(
        [
          `"${graph?.name || 'Untitled Graph'}"`,
          `"${metricLabel(key)}"`,
          metric ? metric.coverage.toFixed(1) : '0.0',
          metric ? String(metric.coveredRequirements) : '0',
          metric ? String(metric.totalRequirements) : '0'
        ].join(',')
      );
    });

    if (includeDetails) {
      lines.push('');
      lines.push('Path Id,Label,Node Sequence,Length');
      ($metricsStore.testPaths || []).forEach((path) => {
        lines.push(
          [
            `"${path.id}"`,
            `"${path.label || ''}"`,
            `"${path.path.map((n) => String(n)).join(' -> ')}"`,
            String(path.path.length)
          ].join(',')
        );
      });
    }

    return lines.join('\n');
  }

  function makeJsonReport(): string {
    const graph = $graphStore.current;
    const first = $metricsStore.results?.[0];

    return JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        graph: graph
          ? {
              id: graph.id,
              name: graph.name,
              nodes: graph.nodes.length,
              edges: graph.edges.length
            }
          : null,
        metrics: first ? first.metrics : {},
        testPaths: includeDetails ? $metricsStore.testPaths : []
      },
      null,
      2
    );
  }

  function makeTextReport(): string {
    const graph = $graphStore.current;
    const first = $metricsStore.results?.[0];
    const lines: string[] = [];

    lines.push('Graph Coverage Analysis Report');
    lines.push('============================');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Graph: ${graph?.name || 'Untitled Graph'}`);
    lines.push(`Nodes: ${graph?.nodes.length || 0}`);
    lines.push(`Edges: ${graph?.edges.length || 0}`);
    lines.push('');
    lines.push('Coverage');
    lines.push('--------');

    metricKeys.forEach((key) => {
      const metric = first?.metrics[key];
      lines.push(
        `${metricLabel(key)}: ${metric ? metric.coverage.toFixed(1) : '0.0'}% (${metric ? metric.coveredRequirements : 0}/${metric ? metric.totalRequirements : 0})`
      );
    });

    if (includeDetails && $metricsStore.testPaths.length > 0) {
      lines.push('');
      lines.push('Test Paths');
      lines.push('----------');
      $metricsStore.testPaths.forEach((path, idx) => {
        lines.push(`${idx + 1}. ${path.label || path.id}: ${path.path.join(' -> ')}`);
      });
    }

    return lines.join('\n');
  }

  function download(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="export-panel">
  <h3>Export Coverage Report</h3>

  <div class="format-section">
    <label for="format">Export Format</label>
    <select id="format" bind:value={selectedFormat}>
      <option value="csv">CSV</option>
      <option value="json">JSON</option>
      <option value="txt">Text</option>
    </select>
  </div>

  <label class="details-option">
    <input type="checkbox" bind:checked={includeDetails} />
    Include test path details
  </label>

  <button
    class="export-btn"
    on:click={exportReport}
    disabled={isExporting || !$metricsStore.results || $metricsStore.results.length === 0}
  >
    {isExporting ? 'Exporting...' : `Download ${selectedFormat.toUpperCase()} Report`}
  </button>

  <p class="hint">Run coverage first to enable exporting results.</p>
</div>

<style>
  .export-panel {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .format-section {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .format-section label {
    font-size: 0.85rem;
    color: #6b7280;
  }

  .format-section select {
    padding: 0.45rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .details-option {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
  }

  .export-btn {
    padding: 0.6rem 0.8rem;
    border: none;
    background: #2563eb;
    color: #fff;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
  }

  .export-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .hint {
    margin: 0;
    color: #6b7280;
    font-size: 0.8rem;
  }
</style>
