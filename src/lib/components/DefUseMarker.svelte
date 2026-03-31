<script lang="ts">
  import { graphStore } from '$lib/stores/graphStore';
  import { metricsStore, setTestPaths } from '$lib/stores/metricsStore';
  import type { Graph, DefUsePair } from '$lib/utils/types';

  let graph: Graph | null = null;
  let duPairs: DefUsePair[] = [];
  let varName = '';
  let defNode = '';
  let useNode = '';

  graphStore.subscribe((state) => {
    graph = state.current;
  });

  function addDUPair() {
    if (!varName.trim() || !defNode.trim() || !useNode.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (defNode === useNode) {
      alert('Definition and use nodes must be different');
      return;
    }

    const pair: DefUsePair = {
      definition: defNode.includes('.') ? defNode : Number(defNode) || defNode,
      use: useNode.includes('.') ? useNode : Number(useNode) || useNode,
      variable: varName,
    };

    duPairs = [...duPairs, pair];
    varName = '';
    defNode = '';
    useNode = '';
  }

  function removePair(index: number) {
    duPairs = duPairs.filter((_, i) => i !== index);
  }

  function getNodeLabel(id: string | number): string {
    if (!graph) return String(id);
    const node = graph.nodes.find((n) => String(n.id) === String(id));
    return node?.label || String(id);
  }
</script>

<div class="def-use-marker">
  <div class="marker-header">
    <h3>Definition-Use Pairs</h3>
    <span class="pair-count">{duPairs.length} pairs</span>
  </div>

  <div class="marker-form">
    <div class="form-group">
      <label for="var-name">Variable:</label>
      <input
        id="var-name"
        type="text"
        bind:value={varName}
        placeholder="e.g., x, count, flag"
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="def-node">Definition Node:</label>
      <select id="def-node" bind:value={defNode} class="form-input">
        <option value="">Select definition node...</option>
        {#each graph?.nodes || [] as node (node.id)}
          <option value={String(node.id)}>
            {node.label || node.id}
          </option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="use-node">Use Node:</label>
      <select id="use-node" bind:value={useNode} class="form-input">
        <option value="">Select use node...</option>
        {#each graph?.nodes || [] as node (node.id)}
          <option value={String(node.id)}>
            {node.label || node.id}
          </option>
        {/each}
      </select>
    </div>

    <button class="btn-add" on:click={addDUPair}>Add DU-Pair</button>
  </div>

  <div class="pairs-list">
    {#if duPairs.length === 0}
      <div class="empty-state">
        <p>No definition-use pairs defined yet</p>
      </div>
    {:else}
      <ul class="pairs-ul">
        {#each duPairs as pair, idx (idx)}
          <li class="pair-item">
            <div class="pair-info">
              <span class="var-name">{pair.variable}</span>
              <span class="pair-path">
                {getNodeLabel(pair.definition)} → {getNodeLabel(pair.use)}
              </span>
            </div>
            <button class="btn-remove" on:click={() => removePair(idx)}>×</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .def-use-marker {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .marker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-color);
  }

  .marker-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .pair-count {
    background: var(--primary-color);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .marker-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }

  .form-input {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .btn-add {
    padding: 8px 16px;
    background-color: var(--success-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-add:hover {
    background-color: #059669;
  }

  .pairs-list {
    flex: 1;
    min-height: 100px;
    background: #f9fafb;
    border-radius: 6px;
    padding: 12px;
    overflow-y: auto;
  }

  .empty-state {
    text-align: center;
    padding: 20px;
    color: #6b7280;
    font-size: 13px;
  }

  .pairs-ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pair-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .pair-info {
    display: flex;
    gap: 12px;
    align-items: center;
    flex: 1;
  }

  .var-name {
    font-weight: 600;
    color: var(--primary-color);
    min-width: 60px;
    background: #f0f9ff;
    padding: 2px 8px;
    border-radius: 3px;
  }

  .pair-path {
    color: #6b7280;
    font-size: 12px;
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
</style>
