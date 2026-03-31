import type { Graph, Node, Edge } from '../utils/types';

/**
 * GraphService
 * 
 * Core service for graph data management and validation.
 * Handles graph creation, manipulation, and structure analysis.
 */
export class GraphService {
  /**
   * Validate graph structure
   */
  validateGraph(graph: Graph): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!graph.nodes || graph.nodes.length === 0) {
      errors.push('Graph must contain at least one node');
    }

    if (!graph.edges) {
      graph.edges = [];
    }

    // Check for isolated nodes
    const edgeNodeIds = new Set<string>();
    graph.edges.forEach(edge => {
      edgeNodeIds.add(edge.source);
      edgeNodeIds.add(edge.target);
    });

    const nodeIds = new Set(graph.nodes.map(n => n.id));
    graph.edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse CSV format: node_id,label[,type]
   *                    edge_id,source,target
   */
  parseCSV(csvContent: string): { graph: Graph; errors: string[] } {
    const lines = csvContent.trim().split('\n');
    const errors: string[] = [];
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let inEdgesSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line.startsWith('#')) continue;
      
      if (line.toUpperCase() === '[EDGES]') {
        inEdgesSection = true;
        continue;
      }

      const parts = line.split(',').map(p => p.trim());

      if (!inEdgesSection) {
        // Parse nodes
        if (parts.length < 2) {
          errors.push(`Line ${i + 1}: Invalid node format`);
          continue;
        }
        nodes.push({
          id: parts[0],
          label: parts[1],
          type: parts[2] || 'default'
        });
      } else {
        // Parse edges
        if (parts.length < 3) {
          errors.push(`Line ${i + 1}: Invalid edge format`);
          continue;
        }
        edges.push({
          id: parts[0],
          source: parts[1],
          target: parts[2]
        });
      }
    }

    const graph: Graph = { nodes, edges };
    return { graph, errors };
  }

  /**
   * Get all nodes reachable from a given node
   */
  getReachableNodes(graph: Graph, nodeId: string): string[] {
    const visited = new Set<string>();
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = graph.edges
        .filter(e => e.source === current)
        .map(e => e.target);
      queue.push(...neighbors);
    }

    return Array.from(visited);
  }

  /**
   * Detect cycles in the graph
   */
  hasCycle(graph: Graph): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = graph.edges
        .filter(e => e.source === nodeId)
        .map(e => e.target);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }
}

export const graphService = new GraphService();
