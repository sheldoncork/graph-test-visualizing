import type { Graph, EdgeCoverageResult } from '../utils/types';

/**
 * EdgeCoverageService
 * 
 * Calculates edge coverage (branch coverage).
 * Edge coverage measures the percentage of edges traversed by test paths.
 */
export class EdgeCoverageService {
  /**
   * Calculate edge coverage
   */
  calculateEdgeCoverage(graph: Graph, testPaths: string[][]): EdgeCoverageResult {
    const coveredEdges = new Set<string>();

    // Collect all edges traversed by test paths
    for (const testPath of testPaths) {
      for (let i = 0; i < testPath.length - 1; i++) {
        const source = testPath[i];
        const target = testPath[i + 1];
        
        // Find the edge id
        const edge = graph.edges.find(e => e.source === source && e.target === target);
        if (edge) {
          coveredEdges.add(edge.id);
        }
      }
    }

    const totalEdges = graph.edges.length;
    const coveredCount = coveredEdges.size;

    return {
      totalEdges,
      coveredEdges: coveredCount,
      uncoveredEdges: totalEdges - coveredCount,
      coverage: totalEdges > 0 ? (coveredCount / totalEdges) * 100 : 0,
      edgeCoverage: graph.edges.map(edge => ({
        edgeId: edge.id,
        covered: coveredEdges.has(edge.id)
      }))
    };
  }

  /**
   * Get uncovered edges
   */
  getUncoveredEdges(graph: Graph, coveredEdgeIds: Set<string>): string[] {
    return graph.edges
      .filter(edge => !coveredEdgeIds.has(edge.id))
      .map(edge => edge.id);
  }
}

export const edgeCoverageService = new EdgeCoverageService();
