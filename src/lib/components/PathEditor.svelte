<script lang="ts">
  import { metricsStore, setTestPaths } from '$lib/stores/metricsStore';
  import { graphStore } from '$lib/stores/graphStore';
  import { allPathsCoverageService } from '$lib/services/allPathsCoverageService';
  import type { TestPath, Graph } from '$lib/utils/types';

  let testPaths: TestPath[] = [];
  let currentGraph: Graph | null = null;
  let newPathLabel = '';
  let newPathNodes = '';
  let selectedPath: TestPath | null = null;
  let autoPathLimit = 200;
  let autoPathMessage = '';

  metricsStore.subscribe((metrics) => {
    testPaths = metrics.testPaths || [];
  });

  graphStore.subscribe((state) => {
    currentGraph = state.current;
  });

  function addPath() {
    if (!newPathLabel.trim() || !newPathNodes.trim()) {
      alert('Please enter both path label and nodes');
      return;
    }

    const pathNodes = newPathNodes
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n);

    if (pathNodes.length === 0) {
      alert('Please enter at least one node');
      return;
    }

    // Validate nodes exist in graph
    if (currentGraph) {
      const invalidNodes = pathNodes.filter(
        (n) => !currentGraph!.nodes.some((node) => String(node.id) === n)
      );
      if (invalidNodes.length > 0) {
        alert(`Invalid node IDs: ${invalidNodes.join(', ')}`);
        return;
      }
    }

    const newPath: TestPath = {
      id: `path-${Date.now()}`,
      path: pathNodes.map((n) => {
        // Try to parse as number if it looks like one
        return isNaN(Number(n)) ? n : Number(n);
      }),
      label: newPathLabel,
    };

    testPaths = [...testPaths, newPath];
    setTestPaths(testPaths);

    newPathLabel = '';
    newPathNodes = '';
    autoPathMessage = '';
  }

  function generateAllPossiblePaths() {
    if (!currentGraph) {
      alert('Import or build a graph first');
      return;
    }

    const nodeIdMap = new Map<string, string | number>();
    currentGraph.nodes.forEach((node) => {
      nodeIdMap.set(String(node.id), node.id);
    });

    // Normalize IDs to strings because the path enumerator is string-based.
    const normalizedGraph = {
      ...currentGraph,
      nodes: currentGraph.nodes.map((node) => ({ ...node, id: String(node.id) })),
      edges: currentGraph.edges.map((edge) => ({
        ...edge,
        source: String(edge.source),
        target: String(edge.target)
      }))
    };

    const generated = allPathsCoverageService.enumerateAllPaths(normalizedGraph, autoPathLimit);

    if (generated.length === 0) {
      autoPathMessage = 'No complete entry-to-exit paths were found for this graph.';
      return;
    }

    const generatedTestPaths: TestPath[] = generated.map((path, index) => ({
      id: `auto-${Date.now()}-${index}`,
      label: `Auto Path ${index + 1}`,
      path: path.map((id) => nodeIdMap.get(id) ?? id)
    }));

    setTestPaths(generatedTestPaths);
    selectedPath = null;
    autoPathMessage = `Generated ${generatedTestPaths.length} paths (cap: ${autoPathLimit}).`;
  }

  function removePath(id: string) {
    testPaths = testPaths.filter((p) => p.id !== id);
    setTestPaths(testPaths);
    if (selectedPath?.id === id) {
      selectedPath = null;
    }
  }

  function selectPath(path: TestPath) {
    selectedPath = selectedPath?.id === path.id ? null : path;
  }

  function getNodeLabels(nodeIds: (string | number)[]): string {
    if (!currentGraph) return nodeIds.join(' → ');
    return nodeIds
      .map((id) => {
        const node = currentGraph!.nodes.find((n) => String(n.id) === String(id));
        return node?.label || String(id);
      })
      .join(' → ');
  }
</script>

<div class="path-editor">
  <div class="editor-header">
    <h2>Test Paths</h2>
    <span class="path-count">{testPaths.length} paths</span>
  </div>

  <div class="editor-form">
    <div class="form-group">
      <label for="path-label">Path Label:</label>
      <input
        id="path-label"
        type="text"
        bind:value={newPathLabel}
        placeholder="e.g., Happy Path 1"
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="path-nodes">Nodes (comma-separated):</label>
      <input
        id="path-nodes"
        type="text"
        bind:value={newPathNodes}
        placeholder="e.g., node1, node2, node3"
        class="form-input"
      />
      <small>Enter node IDs separated by commas</small>
    </div>

    <button class="btn-add" on:click={addPath}>Add Test Path</button>

    <div class="auto-path-controls">
      <label for="auto-path-limit">Auto-generate all test paths (max):</label>
      <div class="auto-path-row">
        <input
          id="auto-path-limit"
          type="number"
          min="1"
          max="1000"
          bind:value={autoPathLimit}
          class="form-input auto-limit-input"
        />
        <button class="btn-generate" on:click={generateAllPossiblePaths}>Generate Paths</button>
      </div>
      {#if autoPathMessage}
        <small>{autoPathMessage}</small>
      {/if}
    </div>
  </div>

  <div class="paths-list">
    {#if testPaths.length === 0}
      <div class="empty-state">
        <p>No test paths added yet</p>
      </div>
    {:else}
      {#each testPaths as path (path.id)}
        <div class="path-item" class:selected={selectedPath?.id === path.id}>
          <div
            class="path-item-header"
            role="button"
            tabindex="0"
            on:click={() => selectPath(path)}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectPath(path);
              }
            }}
          >
            <div class="path-title">
              <h4>{path.label || path.id}</h4>
              <span class="node-count">{path.path.length} nodes</span>
            </div>
            <button 
              class="btn-remove" 
              on:click={(e) => {
                e.stopPropagation?.();
                removePath(path.id);
              }}
            >
              ✕
            </button>
          </div>

          {#if selectedPath?.id === path.id}
            <div class="path-details">
              <div class="path-visualization">
                {getNodeLabels(path.path)}
              </div>
              <div class="path-nodes">
                <strong>Nodes:</strong>
                <ul>
                  {#each path.path as nodeId}
                    <li>{nodeId}</li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .path-editor {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .editor-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .editor-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .path-count {
    background: var(--primary-color);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .editor-form {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    background: #f9fafb;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .form-group small {
    display: block;
    margin-top: 4px;
    color: #6b7280;
    font-size: 12px;
  }

  .btn-add {
    width: 100%;
    padding: 10px 16px;
    background-color: var(--success-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-add:hover {
    background-color: #059669;
  }

  .auto-path-controls {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--border-color);
  }

  .auto-path-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 6px;
  }

  .auto-limit-input {
    width: 110px;
  }

  .btn-generate {
    flex: 1;
    padding: 10px 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-generate:hover {
    background-color: #1d4ed8;
  }

  .paths-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
  }

  .path-item {
    margin-bottom: 8px;
    background: #f9fafb;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    transition: all 0.2s;
  }

  .path-item.selected {
    background: #f0f9ff;
    border-color: var(--primary-color);
  }

  .path-item-header {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .path-item-header:hover {
    background: rgba(37, 99, 235, 0.05);
  }

  .path-title {
    flex: 1;
  }

  .path-title h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .node-count {
    color: #6b7280;
    font-size: 12px;
    margin-left: 8px;
  }

  .btn-remove {
    background: none;
    border: none;
    color: var(--error-color);
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .btn-remove:hover {
    background-color: rgba(239, 68, 68, 0.1);
    border-radius: 4px;
  }

  .path-details {
    padding: 0 12px 12px 12px;
    border-top: 1px solid var(--border-color);
  }

  .path-visualization {
    font-size: 12px;
    font-weight: 500;
    color: var(--primary-color);
    padding: 8px;
    background: white;
    border-radius: 4px;
    margin-bottom: 8px;
    overflow-x: auto;
    white-space: nowrap;
  }

  .path-nodes strong {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .path-nodes ul {
    margin: 0;
    padding-left: 18px;
    list-style: disc;
    font-size: 12px;
    color: #6b7280;
  }

  .path-nodes li {
    margin-bottom: 2px;
  }
</style>
