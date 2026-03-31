<script lang="ts">
  import { graphStore } from '$lib/stores/graphStore';
  import { metricsStore } from '$lib/stores/metricsStore';
  import CSVImport from '$lib/components/CSVImport.svelte';
  import RandomGraphGenerator from '$lib/components/RandomGraphGenerator.svelte';
  import TextGraphBuilder from '$lib/components/TextGraphBuilder.svelte';
  import GraphViewer from '$lib/components/GraphViewer.svelte';
  import MetricsPanel from '$lib/components/MetricsPanel.svelte';
  import PathEditor from '$lib/components/PathEditor.svelte';
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import PathHighlighter from '$lib/components/PathHighlighter.svelte';
  import ReportExporter from '$lib/components/ReportExporter.svelte';
  import type { Graph } from '$lib/utils/types';

  let currentGraph: Graph | null = null;
  let activeTab = 'paths'; // 'paths', 'results', 'analysis', 'export'
  let importToolsExpanded = false;

  graphStore.subscribe((state) => {
    currentGraph = state.current;
  });
</script>

<main class="container">
  <header>
    <h1>Graph Coverage Metrics Tool</h1>
    <p>Analyze coverage metrics for educational graphs</p>
  </header>

  <div class="content">
    <aside class="sidebar">
      <div class="sidebar-tabs">
        <button
          class="tab-btn"
          class:active={activeTab === 'paths'}
          on:click={() => (activeTab = 'paths')}
        >
          Paths
        </button>
        <button
          class="tab-btn"
          class:active={activeTab === 'results'}
          on:click={() => (activeTab = 'results')}
        >
          Results
        </button>
        <button
          class="tab-btn"
          class:active={activeTab === 'analysis'}
          on:click={() => (activeTab = 'analysis')}
        >
          Analysis
        </button>
        <button
          class="tab-btn"
          class:active={activeTab === 'export'}
          on:click={() => (activeTab = 'export')}
        >
          Export
        </button>
      </div>

      <div class="sidebar-content">
        {#if activeTab === 'paths'}
          <section class="import-tools">
            <button
              class="import-toggle"
              on:click={() => (importToolsExpanded = !importToolsExpanded)}
              aria-expanded={importToolsExpanded}
            >
              {importToolsExpanded ? 'Hide Graph Input Tools' : 'Show Graph Input Tools'}
            </button>

            {#if importToolsExpanded}
              <div class="import-tools-content">
                <CSVImport />
                <RandomGraphGenerator />
                <TextGraphBuilder />
              </div>
            {/if}
          </section>

          <PathEditor />
        {:else if activeTab === 'results'}
          <ResultsDisplay />
        {:else if activeTab === 'analysis'}
          <PathHighlighter />
        {:else if activeTab === 'export'}
          <ReportExporter />
        {/if}
      </div>
    </aside>

    <section class="main">
      <div class="graph-viewer-section">
        <GraphViewer graph={currentGraph} />
      </div>
      <div class="metrics-section">
        <MetricsPanel />
      </div>
    </section>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    background-color: #f8f9fa;
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  header {
    background-color: #2563eb;
    color: white;
    padding: 1.5rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  header h1 {
    margin: 0;
    font-size: 1.75rem;
  }

  header p {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
    opacity: 0.9;
  }

  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    width: 380px;
    border-right: 1px solid #ddd;
    background-color: #f5f5f5;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  .sidebar-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #ddd;
    background: white;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .tab-btn {
    flex: 1;
    min-width: 80px;
    padding: 10px 8px;
    border: none;
    background: white;
    cursor: pointer;
    font-weight: 500;
    font-size: 12px;
    color: #666;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    text-align: center;
  }

  .tab-btn:hover {
    background: #f9f9f9;
    color: #2563eb;
  }

  .tab-btn.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
  }

  .import-tools {
    margin-bottom: 0.75rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
  }

  .import-toggle {
    width: 100%;
    text-align: left;
    border: none;
    background: #f8fafc;
    padding: 0.65rem 0.75rem;
    cursor: pointer;
    font-weight: 600;
    color: #1f2937;
  }

  .import-toggle:hover {
    background: #eef2ff;
  }

  .import-tools-content {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 36vh;
    overflow-y: auto;
  }

  .main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .graph-viewer-section {
    flex: 2;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .metrics-section {
    flex: 1;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }
</style>
