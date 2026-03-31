<script lang="ts">
  import { loadGraph } from '$lib/stores/graphStore';
  import { graphService } from '$lib/services/graphService';
  import type { Edge, Graph, Node } from '$lib/utils/types';

  let nodeCount = 8;
  let extraEdges = 6;
  let allowCycles = false;
  let statusMessage = '';
  let errorMessage = '';

  function randomInt(maxExclusive: number): number {
    return Math.floor(Math.random() * maxExclusive);
  }

  function buildNode(id: string, index: number, total: number): Node {
    if (index === 0) return { id, label: 'Start', type: 'entry' };
    if (index === total - 1) return { id, label: 'End', type: 'exit' };
    return { id, label: `N${index + 1}`, type: 'normal' };
  }

  function edgeKey(source: string, target: string): string {
    return `${source}->${target}`;
  }

  function addEdgeIfMissing(edges: Edge[], edgeSet: Set<string>, source: string, target: string): boolean {
    if (source === target) return false;

    const key = edgeKey(source, target);
    if (edgeSet.has(key)) return false;

    edgeSet.add(key);
    edges.push({ source, target, label: `${source} to ${target}` });
    return true;
  }

  function generateGraph(): void {
    try {
      errorMessage = '';
      statusMessage = '';

      if (nodeCount < 2 || nodeCount > 60) {
        errorMessage = 'Node count must be between 2 and 60.';
        return;
      }

      if (extraEdges < 0 || extraEdges > 400) {
        errorMessage = 'Extra edges must be between 0 and 400.';
        return;
      }

      const nodeIds = Array.from({ length: nodeCount }, (_, i) => String(i + 1));
      const nodes: Node[] = nodeIds.map((id, index) => buildNode(id, index, nodeIds.length));

      const edges: Edge[] = [];
      const edgeSet = new Set<string>();

      // Ensure basic connectivity with a backbone path 1->2->...->n.
      for (let i = 0; i < nodeIds.length - 1; i++) {
        addEdgeIfMissing(edges, edgeSet, nodeIds[i], nodeIds[i + 1]);
      }

      const maxAttempts = extraEdges * 25;
      let attempts = 0;
      let added = 0;

      while (added < extraEdges && attempts < maxAttempts) {
        attempts += 1;

        const sourceIndex = randomInt(nodeIds.length);
        const targetIndex = randomInt(nodeIds.length);

        if (!allowCycles && sourceIndex >= targetIndex) {
          continue;
        }

        const source = nodeIds[sourceIndex];
        const target = nodeIds[targetIndex];

        if (addEdgeIfMissing(edges, edgeSet, source, target)) {
          added += 1;
        }
      }

      const graph: Graph = {
        id: `random-${Date.now()}`,
        name: `Random Graph (${nodeCount} nodes)` ,
        nodes,
        edges,
        entryNode: nodeIds[0],
        exitNode: nodeIds[nodeIds.length - 1]
      };

      const validation = graphService.validateGraph(graph);
      if (!validation.valid) {
        errorMessage = `Generated graph failed validation: ${validation.errors.join('; ')}`;
        return;
      }

      graph.isCyclic = graphService.hasCycle(graph);
      loadGraph(graph);

      statusMessage = `Generated graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges (${graph.isCyclic ? 'cyclic' : 'acyclic'}).`;
    } catch (error) {
      errorMessage = `Failed to generate graph: ${String(error)}`;
    }
  }
</script>

<section class="panel">
  <h3>Random Graph</h3>

  <div class="grid">
    <label>
      Nodes
      <input type="number" min="2" max="60" bind:value={nodeCount} />
    </label>

    <label>
      Extra Edges
      <input type="number" min="0" max="400" bind:value={extraEdges} />
    </label>

    <label class="checkbox">
      <input type="checkbox" bind:checked={allowCycles} />
      Allow cycles
    </label>
  </div>

  <button class="generate" on:click={generateGraph}>Generate Graph</button>

  {#if statusMessage}
    <p class="status success">{statusMessage}</p>
  {/if}

  {#if errorMessage}
    <p class="status error">{errorMessage}</p>
  {/if}
</section>

<style>
  .panel {
    background: white;
    border: 1px solid #d9e1e7;
    border-radius: 6px;
    padding: 12px;
    margin-top: 12px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 14px;
    color: #34495e;
  }

  .grid {
    display: grid;
    gap: 8px;
  }

  label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #34495e;
    gap: 8px;
  }

  input[type='number'] {
    width: 90px;
    padding: 4px 6px;
    border: 1px solid #ccd3d8;
    border-radius: 4px;
  }

  .checkbox {
    justify-content: flex-start;
    gap: 8px;
  }

  .generate {
    width: 100%;
    margin-top: 10px;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background: #0f766e;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .generate:hover {
    background: #0a5d57;
  }

  .status {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.4;
  }

  .success {
    color: #1e7e34;
  }

  .error {
    color: #b42318;
  }
</style>
