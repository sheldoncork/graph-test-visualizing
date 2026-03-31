import type { Graph, PrimePath, PrimePathCoverageResult } from '../utils/types';

/**
 * PrimePathCoverageService
 * 
 * Calculates prime path coverage for graph-based testing.
 * A prime path is a path that does not contain any other path as a sub-path.
 * Prime path coverage requires executing all prime paths.
 */
export class PrimePathCoverageService {
  private readonly MAX_PATH_LENGTH = 20; // Prevent infinite enumeration for cyclic graphs

  /**
   * Enumerate all prime paths in the graph
   * Using depth-first search with length limitation
   */
  enumeratePrimePaths(graph: Graph): PrimePath[] {
    const allPaths: string[][] = [];

    // Initialize: all single-edge paths
    const singleEdgePaths: string[][] = [];
    for (const edge of graph.edges) {
      singleEdgePaths.push([edge.source, edge.target]);
    }

    // Extend paths until no more extensions possible
    let currentPaths = singleEdgePaths;
    let iteration = 0;

    while (currentPaths.length > 0 && iteration < this.MAX_PATH_LENGTH) {
      allPaths.push(...currentPaths);

      const extendedPaths: string[][] = [];
      for (const path of currentPaths) {
        const lastNode = path[path.length - 1];
        const successors = graph.edges
          .filter(e => e.source === lastNode)
          .map(e => e.target);

        for (const successor of successors) {
          // Avoid cycles unless we're within depth limit
          if (path.length < this.MAX_PATH_LENGTH) {
            const newPath = [...path, successor];
            extendedPaths.push(newPath);
          }
        }
      }

      currentPaths = extendedPaths;
      iteration++;
    }

    // Filter to only prime paths (paths not contained in another path)
    const primePaths = this.filterPrimePaths(allPaths);

    return primePaths.map((path, idx) => ({
      id: `pp${idx}`,
      path,
      length: path.length,
      isCyclic: this.isPathCyclic(path)
    }));
  }

  /**
   * Filter to only prime paths
   * A prime path is a path that is not a sub-path of another path
   */
  private filterPrimePaths(allPaths: string[][]): string[][] {
    const primePaths: string[][] = [];

    for (const path of allPaths) {
      let isPrime = true;

      // Check if this path is contained in any other path
      for (const otherPath of allPaths) {
        if (path === otherPath) continue;

        if (this.isSubpath(path, otherPath)) {
          isPrime = false;
          break;
        }
      }

      if (isPrime) {
        primePaths.push(path);
      }
    }

    // Remove duplicate paths
    const uniquePaths = new Map<string, string[]>();
    for (const path of primePaths) {
      const key = path.join(',');
      if (!uniquePaths.has(key)) {
        uniquePaths.set(key, path);
      }
    }

    return Array.from(uniquePaths.values());
  }

  /**
   * Check if subPath is contained in parentPath
   */
  private isSubpath(subPath: string[], parentPath: string[]): boolean {
    if (subPath.length > parentPath.length) return false;
    if (subPath.length === parentPath.length) return false; // Equal paths excluded

    for (let i = 0; i <= parentPath.length - subPath.length; i++) {
      let match = true;
      for (let j = 0; j < subPath.length; j++) {
        if (parentPath[i + j] !== subPath[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }

    return false;
  }

  /**
   * Check if a path contains cycles
   */
  private isPathCyclic(path: string[]): boolean {
    const seen = new Set<string>();
    for (const node of path) {
      if (seen.has(node)) return true;
      seen.add(node);
    }
    return false;
  }

  /**
   * Calculate prime path coverage
   */
  calculatePrimePathCoverage(
    primePaths: PrimePath[],
    testPaths: string[][]
  ): PrimePathCoverageResult {
    const coveredPrimes = new Set<string>();

    // Check which prime paths are covered by test paths
    for (const testPath of testPaths) {
      for (const primePath of primePaths) {
        if (this.isPathCovered(primePath.path, testPath)) {
          coveredPrimes.add(primePath.id);
        }
      }
    }

    const totalPrimes = primePaths.length;
    const coveredCount = coveredPrimes.size;

    return {
      totalPrimePaths: totalPrimes,
      coveredPrimePaths: coveredCount,
      uncoveredPrimePaths: totalPrimes - coveredCount,
      coverage: totalPrimes > 0 ? (coveredCount / totalPrimes) * 100 : 0,
      primePathCoverage: primePaths.map(pp => ({
        pathId: pp.id,
        path: pp.path,
        covered: coveredPrimes.has(pp.id)
      }))
    };
  }

  /**
   * Check if a prime path is covered by a test path
   */
  private isPathCovered(primePath: string[], testPath: string[]): boolean {
    if (primePath.length > testPath.length) return false;

    for (let i = 0; i <= testPath.length - primePath.length; i++) {
      let match = true;
      for (let j = 0; j < primePath.length; j++) {
        if (testPath[i + j] !== primePath[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }

    return false;
  }
}

export const primePathCoverageService = new PrimePathCoverageService();
