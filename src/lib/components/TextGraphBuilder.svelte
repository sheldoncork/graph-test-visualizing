<script lang="ts">
  import { loadGraph } from '$lib/stores/graphStore';
  import { graphService } from '$lib/services/graphService';
  import type { Edge, Graph, Node } from '$lib/utils/types';

  let graphText = `# Simple text graph format
# Use either "A -> B" lines or CSV-like "A,B"
# Optional node labels: NODE id,label
NODE 1,Start
NODE 2,Check
NODE 3,End
1 -> 2
2 -> 3`;

  let statusMessage = '';
  let errorMessage = '';

  function normalizeLine(line: string): string {
    return line.trim();
  }

  function parseNodeLine(line: string): Node | null {
    const payload = line.replace(/^NODE\s+/i, '');
    const parts = payload.split(',').map((p) => p.trim()).filter(Boolean);

    if (parts.length < 1) return null;

    return {
      id: parts[0],
      label: parts[1] ?? parts[0],
      type: 'normal'
    };
  }

  function parseEdgeLine(line: string): { source: string; target: string } | null {
    if (line.includes('->')) {
      const parts = line.split('->').map((p) => p.trim()).filter(Boolean);
      if (parts.length === 2) {
        return { source: parts[0], target: parts[1] };
      }
      return null;
    }

    const csvParts = line.split(',').map((p) => p.trim()).filter(Boolean);
    if (csvParts.length >= 2) {
      return { source: csvParts[0], target: csvParts[1] };
    }

    return null;
  }

  function buildFromText(): void {
    try {
      errorMessage = '';
      statusMessage = '';

      const rawLines = graphText.split(/\r?\n/).map(normalizeLine);
      const lines = rawLines.filter((line) => line.length > 0 && !line.startsWith('#'));

      const nodesById = new Map<string, Node>();
      const edges: Edge[] = [];
      const edgeKeys = new Set<string>();

      for (const line of lines) {
        if (/^NODE\s+/i.test(line)) {
          const parsedNode = parseNodeLine(line);
          if (!parsedNode) {
            errorMessage = `Invalid node line: ${line}`;
            return;
          }
          nodesById.set(String(parsedNode.id), parsedNode);
          continue;
        }

        const parsedEdge = parseEdgeLine(line);
        if (!parsedEdge) {
          errorMessage = `Invalid edge line: ${line}`;
          return;
        }

        if (!nodesById.has(parsedEdge.source)) {
          nodesById.set(parsedEdge.source, { id: parsedEdge.source, label: parsedEdge.source, type: 'normal' });
        }

        if (!nodesById.has(parsedEdge.target)) {
          nodesById.set(parsedEdge.target, { id: parsedEdge.target, label: parsedEdge.target, type: 'normal' });
        }

        const key = `${parsedEdge.source}->${parsedEdge.target}`;
        if (edgeKeys.has(key)) {
          continue;
        }

        edgeKeys.add(key);
        edges.push({
          source: parsedEdge.source,
          target: parsedEdge.target,
          label: key
        });
      }

      if (nodesById.size === 0) {
        errorMessage = 'No nodes found. Add NODE lines or edge lines.';
        return;
      }

      const nodes = Array.from(nodesById.values());
      const graph: Graph = {
        id: `text-${Date.now()}`,
        name: 'Text Graph',
        nodes,
        edges,
        entryNode: nodes[0]?.id,
        exitNode: nodes[nodes.length - 1]?.id
      };

      const validation = graphService.validateGraph(graph);
      if (!validation.valid) {
        errorMessage = `Validation errors: ${validation.errors.join('; ')}`;
        return;
      }

      graph.isCyclic = graphService.hasCycle(graph);
      loadGraph(graph);

      statusMessage = `Built graph with ${nodes.length} nodes and ${edges.length} edges (${graph.isCyclic ? 'cyclic' : 'acyclic'}).`;
    } catch (error) {
      errorMessage = `Failed to parse graph text: ${String(error)}`;
    }
  }
</script>

<section class="panel">
  <h3>Text Graph Builder</h3>

  <textarea
    bind:value={graphText}
    rows="10"
    spellcheck="false"
    aria-label="Graph text input"
  ></textarea>

  <button class="build" on:click={buildFromText}>Build Graph From Text</button>

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

  textarea {
    width: 100%;
    min-height: 160px;
    resize: vertical;
    box-sizing: border-box;
    border: 1px solid #ccd3d8;
    border-radius: 4px;
    padding: 8px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 1.4;
  }

  .build {
    width: 100%;
    margin-top: 10px;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background: #2563eb;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .build:hover {
    background: #1d4ed8;
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
