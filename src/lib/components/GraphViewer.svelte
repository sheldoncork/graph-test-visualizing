<script lang="ts">
  import { onMount } from 'svelte';
  import cytoscape from 'cytoscape';
  import type { Graph, Node, Edge } from '../utils/types';

  export let graph: Graph | null = null;
  let container: HTMLDivElement;
  let cy: any;

  onMount(() => {
    if (!container) return;

    cy = cytoscape({
      container,
      style: [
        {
          selector: 'node',
          style: {
            content: 'data(label)',
            'background-color': '#3498db',
            'text-valign': 'center',
            'text-halign': 'center',
            color: '#fff',
            padding: '10px',
            'border-width': '2px',
            'border-color': '#2c3e50',
          },
        },
        {
          selector: 'edge',
          style: {
            'target-arrow-shape': 'triangle',
            'line-color': '#7f8c8d',
            'target-arrow-color': '#7f8c8d',
            width: '2px',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#e74c3c',
            'border-color': '#c0392b',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.5,
      },
    });

    // Enable zoom and pan
    cy.userPanningEnabled(true);
    cy.userZoomingEnabled(true);
    cy.boxSelectionEnabled(true);
  });

  $: if (cy && graph) {
    cy.elements().remove();

    const elements = [
      ...graph.nodes.map((node: Node) => ({
        data: {
          id: node.id,
          label: node.label || node.id,
        },
      })),
      ...graph.edges.map((edge: Edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
        },
      })),
    ];

    cy.add(elements);
    cy.layout({ name: 'breadthfirst', directed: true }).run();
    cy.fit();
  }

  function zoomIn() {
    if (cy) cy.zoom(cy.zoom() * 1.2);
  }

  function zoomOut() {
    if (cy) cy.zoom(cy.zoom() / 1.2);
  }

  function fitToScreen() {
    if (cy) cy.fit();
  }
</script>

<div class="graph-viewer">
  <div class="controls">
    <button on:click={zoomIn}>+ Zoom In</button>
    <button on:click={zoomOut}>- Zoom Out</button>
    <button on:click={fitToScreen}>Fit to Screen</button>
  </div>
  <div bind:this={container} class="cy-container"></div>
</div>

<style>
  .graph-viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .controls {
    padding: 10px;
    background: #ecf0f1;
    border-bottom: 1px solid #bdc3c7;
    display: flex;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  button:hover {
    background: #2980b9;
  }

  .cy-container {
    flex: 1;
    background: #f5f5f5;
  }
</style>
