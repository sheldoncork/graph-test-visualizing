/**
 * Core Graph and Coverage Metric Types
 * Reference: specs/001-graph-coverage-metrics/data-model.md
 */

/**
 * Graph Node
 * Represents a vertex in the control flow graph
 */
export interface Node {
  id: string | number;
  label?: string;
  type?: 'entry' | 'exit' | 'decision' | 'normal';
  metadata?: Record<string, unknown>;
}

/**
 * Graph Edge
 * Represents a directed edge between two nodes
 */
export interface Edge {
  source: string | number;
  target: string | number;
  label?: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Graph Structure
 * Represents a complete directed acyclic graph
 */
export interface Graph {
  id: string;
  name?: string;
  nodes: Node[];
  edges: Edge[];
  entryNode?: string | number;
  exitNode?: string | number;
  isCyclic?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Definition-Use Pair
 * Represents a def-use pair for DU-pair coverage
 */
export interface DefUsePair {
  definition: string | number; // Node ID where variable is defined
  use: string | number;        // Node ID where variable is used
  variable?: string;
  path?: (string | number)[]; // Path from definition to use
}

/**
 * Prime Path
 * Represents a prime path for prime path coverage
 */
export interface PrimePath {
  id: string;
  path: (string | number)[]; // Sequence of node IDs
  isCyclic: boolean;
  length: number;
}

/**
 * Test Path
 * Represents a test execution path through the graph
 */
export interface TestPath {
  id: string;
  path: (string | number)[]; // Sequence of node IDs
  label?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Coverage Metric Types
 */
export type CoverageMetricType =
  | 'du-pair'      // Definition-Use pair coverage
  | 'prime-path'   // Prime path coverage
  | 'node'         // Node coverage
  | 'edge'         // Edge coverage
  | 'all-paths'    // All-paths coverage
  | 'mcc';         // McCabe cyclomatic complexity paths

/**
 * Coverage Result for a Single Metric
 */
export interface CoverageMetric {
  type: CoverageMetricType;
  totalRequirements: number;  // Total DU-pairs, prime paths, nodes, etc.
  coveredRequirements: number; // Number covered by at least one test path
  coverage: number;           // Percentage (0-100)
  details?: Record<string, unknown>; // Metric-specific details
  uncoveredItems?: (string | number)[]; // List of uncovered items
}

/**
 * Complete Coverage Results
 * All metrics for a graph and test suite
 */
export interface CoverageResult {
  id: string;
  graphId: string;
  timestamp: Date;
  metrics: Record<CoverageMetricType, CoverageMetric>;
  testPaths: TestPath[];
  summary: {
    overallCoverage: number; // Average of all metrics
    metricsCount: number;
    testPathsCount: number;
  };
}

/**
 * Validation Type Guards
 */

export function isValidNode(node: unknown): node is Node {
  if (!node || typeof node !== 'object') return false;
  const n = node as Node;
  return (n.id !== undefined && typeof n.id !== 'undefined');
}

export function isValidEdge(edge: unknown): edge is Edge {
  if (!edge || typeof edge !== 'object') return false;
  const e = edge as Edge;
  return (e.source !== undefined && e.target !== undefined);
}

export function isValidGraph(graph: unknown): graph is Graph {
  if (!graph || typeof graph !== 'object') return false;
  const g = graph as Graph;

  // Check basic structure
  if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) {
    return false;
  }

  // Validate all nodes
  if (!g.nodes.every((node) => isValidNode(node))) {
    return false;
  }

  // Validate all edges reference existing nodes
  const nodeIds = new Set(g.nodes.map((n) => String(n.id)));
  if (
    !g.edges.every(
      (edge) => isValidEdge(edge) && nodeIds.has(String(edge.source)) && nodeIds.has(String(edge.target))
    )
  ) {
    return false;
  }

  // Check for duplicate nodes
  if (new Set(g.nodes.map((n) => String(n.id))).size !== g.nodes.length) {
    return false;
  }

  return true;
}

export function isValidTestPath(path: unknown): path is TestPath {
  if (!path || typeof path !== 'object') return false;
  const p = path as TestPath;
  return p.id !== undefined && Array.isArray(p.path) && p.path.length > 0;
}
