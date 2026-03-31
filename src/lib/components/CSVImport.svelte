<script lang="ts">
  import { loadGraph } from '../stores/graphStore';
  import { graphService } from '../services/graphService';
  import type { Graph } from '../utils/types';

  let fileInput: HTMLInputElement;
  let csvContent = '';
  let errorMessage = '';
  let successMessage = '';

  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const { graph, errors } = graphService.parseCSV(text);

      if (errors.length > 0) {
        errorMessage = `Import errors:\n${errors.join('\n')}`;
        successMessage = '';
        return;
      }

      const validation = graphService.validateGraph(graph);
      if (!validation.valid) {
        errorMessage = `Validation errors:\n${validation.errors.join('\n')}`;
        successMessage = '';
        return;
      }

      loadGraph(graph);
      successMessage = `Graph imported: ${graph.nodes.length} nodes, ${graph.edges.length} edges`;
      errorMessage = '';
      csvContent = text;
    } catch (error) {
      errorMessage = `Error reading file: ${error}`;
      successMessage = '';
    }
  }

  function downloadTemplate() {
    const template = `# Graph Definition (CSV Format)
# Nodes: id,label[,type]
# Edges: [EDGES] section

# Nodes
1,Start,start
2,Process A,process
3,Decision,decision
4,Process B,process
5,End,end

[EDGES]
# Edges: id,source,target
e1,1,2
e2,2,3
e3,3,4
e4,3,5
e5,4,5
`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="import-panel">
  <h2>Import Graph</h2>

  <div class="actions">
    <button on:click={() => fileInput.click()} class="primary-btn"> Choose CSV File </button>
    <button on:click={downloadTemplate} class="secondary-btn"> Download Template </button>
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept=".csv,.txt"
    on:change={handleFileSelect}
    style="display: none;"
  />

  {#if errorMessage}
    <div class="error-message">
      {errorMessage}
    </div>
  {/if}

  {#if successMessage}
    <div class="success-message">
      {successMessage}
    </div>
  {/if}

  {#if csvContent}
    <details>
      <summary>View Imported CSV</summary>
      <pre>{csvContent}</pre>
    </details>
  {/if}
</div>

<style>
  .import-panel {
    padding: 20px;
    background: #ecf0f1;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  h2 {
    margin-top: 0;
    color: #2c3e50;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  }

  .primary-btn {
    background: #27ae60;
    color: white;
  }

  .primary-btn:hover {
    background: #229954;
  }

  .secondary-btn {
    background: #3498db;
    color: white;
  }

  .secondary-btn:hover {
    background: #2980b9;
  }

  .error-message {
    padding: 10px;
    background: #fadad4;
    color: #c0392b;
    border-radius: 4px;
    margin-bottom: 10px;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 12px;
  }

  .success-message {
    padding: 10px;
    background: #d5f4e6;
    color: #27ae60;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  details {
    margin-top: 10px;
  }

  pre {
    background: #fff;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
  }
</style>
