import type { Graph, NodeCoverageResult } from '../utils/types';

/**
 * NodeCoverageService
 * 
 * Calculates node coverage (statement coverage).
 * Node coverage measures the percentage of nodes visited by test paths.
 */
export class NodeCoverageService {
  /**
   * Calculate node coverage
   */
  calculateNodeCoverage(graph: Graph, testPaths: string[][]): NodeCoverageResult {
    const coveredNodes = new Set<string>();

    // Collect all nodes visited by test paths
    for (const testPath of testPaths) {
      for (const nodeId of testPath) {
        coveredNodes.add(nodeId);
      }
    }

    const totalNodes = graph.nodes.length;
    const coveredCount = coveredNodes.size;

    return {
      totalNodes,
      coveredNodes: coveredCount,
      uncoveredNodes: totalNodes - coveredCount,
      coverage: totalNodes > 0 ? (coveredCount / totalNodes) * 100 : 0,
      nodeCoverage: graph.nodes.map(node => ({
        nodeId: node.id,
        covered: coveredNodes.has(node.id)
      }))
    };
  }

  /**
   * Get uncovered nodes
   */
  getUncoveredNodes(graph: Graph, coveredNodeIds: Set<string>): string[] {
    return graph.nodes
      .filter(node => !coveredNodeIds.has(node.id))
      .map(node => node.id);
  }
}

export const nodeCoverageService = new NodeCoverageService();
