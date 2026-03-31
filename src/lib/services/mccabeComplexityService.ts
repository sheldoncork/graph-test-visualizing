import type { Graph, McCabeComplexityResult } from '../utils/types';

/**
 * McCabeComplexityService
 * 
 * Calculates cyclomatic complexity and linearly independent paths.
 * McCabe cyclomatic complexity measures the number of linearly independent paths
 * through a program, which approximates the number of test cases needed.
 */
export class McCabeComplexityService {
  /**
   * Calculate cyclomatic complexity using formula: M = E - N + 2P
   * where E = edges, N = nodes, P = connected components
   */
  calculateCyclomaticComplexity(graph: Graph): number {
    if (graph.nodes.length === 0) return 0;

    const E = graph.edges.length;
    const N = graph.nodes.length;
    const P = this.countConnectedComponents(graph);

    return E - N + 2 * P;
  }

  /**
   * Calculate linearly independent paths (basis paths)
   * These are the minimum set of paths needed to cover all edges
   */
  calculateLinearlyIndependentPaths(graph: Graph, testPaths: string[][]): McCabeComplexityResult {
    const complexity = this.calculateCyclomaticComplexity(graph);
    
    // The number of linearly independent paths equals cyclomatic complexity
    // We need at least this many test paths to achieve full coverage
    const basisPaths = this.findBasisPaths(graph, testPaths, complexity);
    
    const coveredCount = Math.min(testPaths.length, complexity);
    
    return {
      cyclomaticComplexity: complexity,
      requiredTestPaths: complexity,
      executedTestPaths: testPaths.length,
      basisPathsCovered: coveredCount,
      coverage: complexity > 0 ? (coveredCount / complexity) * 100 : 0,
      basisPaths: basisPaths.map((path, idx) => ({
        pathId: `bp${idx}`,
        path,
        isCovered: testPaths.some(tp => this.pathsEqual(tp, path))
      }))
    };
  }

  /**
   * Find a basis set of paths (minimum set covering all edges)
   */
  private findBasisPaths(graph: Graph, testPaths: string[][], complexity: number): string[][] {
    const basisPaths: string[][] = [];
    const uncoveredEdges = new Set<string>(
      graph.edges.map((_, idx) => `e${idx}`)
    );

    // Add test paths until all edges are covered or we reach complexity limit
    for (const testPath of testPaths) {
      if (basisPaths.length >= complexity) break;

      const edges = this.extractEdges(graph, testPath);
      let coversNewEdges = false;

      for (const edge of edges) {
        if (uncoveredEdges.has(edge)) {
          coversNewEdges = true;
          uncoveredEdges.delete(edge);
        }
      }

      if (coversNewEdges) {
        basisPaths.push(testPath);
      }
    }

    return basisPaths;
  }

  /**
   * Extract edges from a path
   */
  private extractEdges(graph: Graph, path: string[]): string[] {
    const edges: string[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i];
      const target = path[i + 1];
      const edge = graph.edges.find(e => e.source === source && e.target === target);
      if (edge) {
        edges.push(edge.id);
      }
    }

    return edges;
  }

  /**
   * Count connected components
   */
  private countConnectedComponents(graph: Graph): number {
    const visited = new Set<string>();
    let components = 0;

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        this.dfsVisit(graph, node.id, visited);
        components++;
      }
    }

    return components;
  }

  /**
   * DFS visit for connected component detection
   */
  private dfsVisit(graph: Graph, nodeId: string, visited: Set<string>) {
    visited.add(nodeId);

    const neighbors = new Set<string>();
    for (const edge of graph.edges) {
      if (edge.source === nodeId) neighbors.add(edge.target);
      if (edge.target === nodeId) neighbors.add(edge.source);
    }

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfsVisit(graph, neighbor, visited);
      }
    }
  }

  /**
   * Check if two paths are equal
   */
  private pathsEqual(path1: string[], path2: string[]): boolean {
    if (path1.length !== path2.length) return false;
    return path1.every((node, idx) => node === path2[idx]);
  }
}

export const mccabeComplexityService = new McCabeComplexityService();
