import type { Graph, Definition, Use, DUPair, DUPairCoverageResult } from '../utils/types';

/**
 * DUPairCoverageService
 * 
 * Calculates definition-use (DU) pair coverage.
 * A DU pair is a definition of a variable and a use of that same variable
 * that is reachable via a definition-clear path.
 */
export class DUPairCoverageService {
  /**
   * Extract definitions and uses from the graph
   * In graph testing, definitions and uses are typically marked on nodes/edges
   */
  extractDefinitionsAndUses(graph: Graph, markings: Map<string, { defs: string[]; uses: string[] }>): {
    definitions: Definition[];
    uses: Use[];
  } {
    const definitions: Definition[] = [];
    const uses: Use[] = [];
    let defId = 0;
    let useId = 0;

    for (const [nodeId, marking] of markings.entries()) {
      // Definitions
      for (const variable of marking.defs) {
        definitions.push({
          id: `d${defId++}`,
          variable,
          nodeId,
          line: parseInt(nodeId) || 0
        });
      }

      // Uses
      for (const variable of marking.uses) {
        uses.push({
          id: `u${useId++}`,
          variable,
          nodeId,
          isKilled: false,
          line: parseInt(nodeId) || 0
        });
      }
    }

    return { definitions, uses };
  }

  /**
   * Find all definition-clear paths from a definition node to a use node
   * for the same variable
   */
  private findDefinitionClearPaths(
    graph: Graph,
    startNode: string,
    endNode: string,
    variable: string,
    killNodes: Set<string>,
    maxDepth: number = 20
  ): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (current: string, path: string[], depth: number) => {
      if (depth > maxDepth) return;

      // Check if we reached the end node without passing through a kill node
      if (current === endNode) {
        paths.push([...path]);
        return;
      }

      if (visited.size > 1000) return; // Prevent memory explosion

      const neighbors = graph.edges
        .filter(e => e.source === current && !killNodes.has(e.target))
        .map(e => e.target);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) || neighbor === endNode) {
          visited.add(neighbor);
          path.push(neighbor);
          dfs(neighbor, path, depth + 1);
          path.pop();
          visited.delete(neighbor);
        }
      }
    };

    visited.add(startNode);
    dfs(startNode, [startNode], 0);
    return paths;
  }

  /**
   * Calculate DU-pair coverage
   */
  calculateDUPairCoverage(
    graph: Graph,
    duPairs: DUPair[],
    testPaths: string[][]
  ): DUPairCoverageResult {
    const coveredPairs = new Set<string>();

    // For each test path, check which DU pairs it covers
    for (const testPath of testPaths) {
      for (const duPair of duPairs) {
        const pairId = `${duPair.definition.id}-${duPair.use.id}`;
        if (coveredPairs.has(pairId)) continue;

        // Check if test path traverses from def node to use node in order
        const defIndex = testPath.indexOf(duPair.definition.nodeId);
        const useIndex = testPath.indexOf(duPair.use.nodeId);

        if (defIndex >= 0 && useIndex > defIndex) {
          // Verify the path from def to use is definition-clear
          const subPath = testPath.slice(defIndex, useIndex + 1);
          let isDefinitionClear = true;

          for (const nodeId of subPath.slice(1, -1)) {
            if (this.isKillNode(graph, nodeId, duPair.definition.variable)) {
              isDefinitionClear = false;
              break;
            }
          }

          if (isDefinitionClear) {
            coveredPairs.add(pairId);
          }
        }
      }
    }

    const totalPairs = duPairs.length;
    const coveredCount = coveredPairs.size;

    return {
      totalDUPairs: totalPairs,
      coveredDUPairs: coveredCount,
      uncoveredDUPairs: totalPairs - coveredCount,
      coverage: totalPairs > 0 ? (coveredCount / totalPairs) * 100 : 0,
      duPairCoverage: Array.from(coveredPairs).map(id => ({
        pairId: id,
        covered: true
      }))
    };
  }

  /**
   * Check if a node kills (redefines) a variable
   */
  private isKillNode(graph: Graph, nodeId: string, variable: string): boolean {
    // This would be determined by the markings in real usage
    // Placeholder implementation
    return false;
  }
}

export const duPairCoverageService = new DUPairCoverageService();
