<script lang="ts">
  import { metricsStore } from '$lib/stores/metricsStore';
  import type { CoverageResult, CoverageMetricType } from '$lib/utils/types';

  let results: CoverageResult[] = [];
  let selectedMetric: CoverageMetricType = 'du-pair';
  const metricOptions: CoverageMetricType[] = ['du-pair', 'prime-path', 'node', 'edge', 'all-paths', 'mcc'];

  metricsStore.subscribe((metrics) => {
    results = metrics.results || [];
  });

  function getMetricColor(percentage: number): string {
    if (percentage >= 90) return '#10b981'; // green
    if (percentage >= 70) return '#f59e0b'; // yellow
    if (percentage >= 50) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  function getMetricLabel(type: string): string {
    const labels: Record<string, string> = {
      'du-pair': 'DU-Pair Coverage',
      'prime-path': 'Prime Path Coverage',
      'node': 'Node Coverage',
      'edge': 'Edge Coverage',
      'all-paths': 'All Paths Coverage',
      'mcc': 'McCabe Complexity Coverage',
    };
    return labels[type] || type;
  }

  function formatPercentage(value: number): string {
    return value.toFixed(1);
  }

</script>

<div class="results-display">
  <div class="results-header">
    <h2>Coverage Results</h2>
    <div class="metric-selector">
      {#each metricOptions as metric}
        <button
          class="metric-btn"
          class:active={selectedMetric === metric}
          on:click={() => (selectedMetric = metric)}
        >
          {getMetricLabel(metric)}
        </button>
      {/each}
    </div>
  </div>

  <div class="results-body">
    {#if results.length === 0}
      <div class="no-results">
        <p>No coverage results yet. Import a graph and add test paths to see results.</p>
      </div>
    {:else}
      {#each results as result}
        {#if result.metrics[selectedMetric]}
          <div class="result-card">
            <div class="result-header">
              <h3>{getMetricLabel(selectedMetric)}</h3>
              <div
                class="coverage-badge"
                style="background-color: {getMetricColor(result.metrics[selectedMetric].coverage)}"
              >
                {formatPercentage(result.metrics[selectedMetric].coverage)}%
              </div>
            </div>

            <div class="result-details">
              <div class="detail-row">
                <span class="label">Coverage:</span>
                <span class="value">{result.metrics[selectedMetric].coveredRequirements} / {result.metrics[selectedMetric].totalRequirements}</span>
              </div>
              {#if result.metrics[selectedMetric].details}
                <div class="detail-row">
                  <span class="label">Details:</span>
                  <span class="value">{JSON.stringify(result.metrics[selectedMetric].details)}</span>
                </div>
              {/if}
            </div>

            {#if (result.metrics[selectedMetric].uncoveredItems ?? []).length > 0}
              <div class="uncovered-section">
                <h4>Uncovered Items ({(result.metrics[selectedMetric].uncoveredItems ?? []).length}):</h4>
                <ul class="uncovered-list">
                  {#each (result.metrics[selectedMetric].uncoveredItems ?? []).slice(0, 10) as item}
                    <li>{item}</li>
                  {/each}
                  {#if (result.metrics[selectedMetric].uncoveredItems ?? []).length > 10}
                    <li class="more">+{(result.metrics[selectedMetric].uncoveredItems ?? []).length - 10} more...</li>
                  {/if}
                </ul>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .results-display {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .results-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .results-header h2 {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .metric-selector {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .metric-btn {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: white;
    color: #374151;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .metric-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .metric-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .results-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .no-results {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
  }

  .result-card {
    margin-bottom: 20px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 6px;
    border-left: 4px solid var(--primary-color);
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .result-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .coverage-badge {
    padding: 6px 12px;
    border-radius: 20px;
    color: white;
    font-weight: 600;
    font-size: 14px;
  }

  .result-details {
    margin-bottom: 12px;
  }

  .detail-row {
    display: flex;
    padding: 8px 0;
    font-size: 14px;
  }

  .detail-row .label {
    font-weight: 500;
    min-width: 80px;
  }

  .detail-row .value {
    color: #6b7280;
    flex: 1;
    word-break: break-all;
  }

  .uncovered-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
  }

  .uncovered-section h4 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: var(--error-color);
  }

  .uncovered-list {
    margin: 0;
    padding-left: 20px;
    list-style: disc;
    font-size: 13px;
    color: #6b7280;
  }

  .uncovered-list .more {
    color: var(--primary-color);
    font-weight: 500;
  }
</style>
