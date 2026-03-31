import type { Graph, AllPathsCoverageResult } from '../utils/types';

/**
 * AllPathsCoverageService
 * 
 * Calculates all-paths coverage.
 * All-paths coverage requires executing all possible paths in the program.
 * For cyclic programs, this is approximated with path enumeration limits.
 */
export class AllPathsCoverageService {
  private readonly MAX_ALL_PATHS = 1000; // Limit total paths to enumerate

  /**
   * Enumerate all possible paths in the graph
   */
  enumerateAllPaths(graph: Graph, maxPaths: number = this.MAX_ALL_PATHS): string[][] {
    const allPaths: string[][] = [];
    const visited = new Set<string>();

    // Find all entry nodes (nodes with no incoming edges)
    const entryNodes = this.findEntryNodes(graph);
    const exitNodes = this.findExitNodes(graph);

    // Find all paths from entry to exit nodes
    for (const entry of entryNodes) {
      for (const exit of exitNodes) {
        const paths = this.findAllPathsBetween(graph, entry, exit, maxPaths - allPaths.length);
        allPaths.push(...paths);

        if (allPaths.length >= maxPaths) {
          return allPaths.slice(0, maxPaths);
        }
      }
    }

    return allPaths;
  }

  /**
   * Find all entry nodes (no incoming edges)
   */
  private findEntryNodes(graph: Graph): string[] {
    const nodesWithIncoming = new Set<string>();
    for (const edge of graph.edges) {
      nodesWithIncoming.add(edge.target);
    }

    return graph.nodes
      .filter(node => !nodesWithIncoming.has(node.id))
      .map(node => node.id);
  }

  /**
   * Find all exit nodes (no outgoing edges)
   */
  private findExitNodes(graph: Graph): string[] {
    const nodesWithOutgoing = new Set<string>();
    for (const edge of graph.edges) {
      nodesWithOutgoing.add(edge.source);
    }

    return graph.nodes
      .filter(node => !nodesWithOutgoing.has(node.id))
      .map(node => node.id);
  }

  /**
   * Find all paths between two nodes
   */
  private findAllPathsBetween(
    graph: Graph,
    start: string,
    end: string,
    limit: number
  ): string[][] {
    const paths: string[][] = [];
    const visited = new Map<string, number>();
    const maxDepth = 20; // Prevent infinite recursion

    const dfs = (current: string, path: string[], depth: number) => {
      if (paths.length >= limit) return;
      if (depth > maxDepth) return;

      if (current === end) {
        paths.push([...path]);
        return;
      }

      const neighbors = graph.edges
        .filter(e => e.source === current)
        .map(e => e.target);

      for (const neighbor of neighbors) {
        path.push(neighbor);
        dfs(neighbor, path, depth + 1);
        path.pop();
      }
    };

    dfs(start, [start], 0);
    return paths;
  }

  /**
   * Calculate all-paths coverage
   */
  calculateAllPathsCoverage(graph: Graph, testPaths: string[][]): AllPathsCoverageResult {
    const allPossiblePaths = this.enumerateAllPaths(graph);
    const coveredPaths = new Set<string>();

    // Normalize paths for comparison
    const testPathNormalized = testPaths.map(p => p.join(','));
    const testPathSet = new Set(testPathNormalized);

    for (const possiblePath of allPossiblePaths) {
      const normalized = possiblePath.join(',');
      if (testPathSet.has(normalized)) {
        coveredPaths.add(normalized);
      }
    }

    const totalPaths = allPossiblePaths.length;
    const coveredCount = coveredPaths.size;

    return {
      totalAllPaths: totalPaths,
      coveredAllPaths: coveredCount,
      uncoveredAllPaths: totalPaths - coveredCount,
      coverage: totalPaths > 0 ? (coveredCount / totalPaths) * 100 : 0,
      allPathsCoverage: allPossiblePaths.map((path, idx) => ({
        pathId: `ap${idx}`,
        path,
        covered: testPathSet.has(path.join(','))
      }))
    };
  }
}

export const allPathsCoverageService = new AllPathsCoverageService();
