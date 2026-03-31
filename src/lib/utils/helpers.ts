/**
 * Utility Helper Functions
 * Common operations on graphs and paths
 */
import type { Graph, Node, Edge } from './types';

/**
 * Find a node by ID
 */
export function findNode(graph: Graph, nodeId: string | number): Node | undefined {
  return graph.nodes.find((n) => String(n.id) === String(nodeId));
}

/**
 * Find an edge by source and target
 */
export function findEdge(
  graph: Graph,
  source: string | number,
  target: string | number
): Edge | undefined {
  return graph.edges.find(
    (e) => String(e.source) === String(source) && String(e.target) === String(target)
  );
}

/**
 * Get all incoming edges for a node
 */
export function getIncomingEdges(graph: Graph, nodeId: string | number): Edge[] {
  return graph.edges.filter((e) => String(e.target) === String(nodeId));
}

/**
 * Get all outgoing edges for a node
 */
export function getOutgoingEdges(graph: Graph, nodeId: string | number): Edge[] {
  return graph.edges.filter((e) => String(e.source) === String(nodeId));
}

/**
 * Get in-degree of a node
 */
export function getInDegree(graph: Graph, nodeId: string | number): number {
  return getIncomingEdges(graph, nodeId).length;
}

/**
 * Get out-degree of a node
 */
export function getOutDegree(graph: Graph, nodeId: string | number): number {
  return getOutgoingEdges(graph, nodeId).length;
}

/**
 * Get successor nodes
 */
export function getSuccessors(graph: Graph, nodeId: string | number): Node[] {
  const edges = getOutgoingEdges(graph, nodeId);
  return edges
    .map((e) => findNode(graph, e.target))
    .filter((n): n is Node => n !== undefined);
}

/**
 * Get predecessor nodes
 */
export function getPredecessors(graph: Graph, nodeId: string | number): Node[] {
  const edges = getIncomingEdges(graph, nodeId);
  return edges
    .map((e) => findNode(graph, e.source))
    .filter((n): n is Node => n !== undefined);
}

/**
 * Check if a node is reachable from another using BFS
 */
export function isReachable(
  graph: Graph,
  sourceId: string | number,
  targetId: string | number
): boolean {
  if (String(sourceId) === String(targetId)) return true;

  const visited = new Set<string>();
  const queue: (string | number)[] = [sourceId];
  visited.add(String(sourceId));

  while (queue.length > 0) {
    const current = queue.shift()!;
    const successors = getSuccessors(graph, current);

    for (const successor of successors) {
      if (String(successor.id) === String(targetId)) {
        return true;
      }

      const successorIdStr = String(successor.id);
      if (!visited.has(successorIdStr)) {
        visited.add(successorIdStr);
        queue.push(successor.id);
      }
    }
  }

  return false;
}

/**
 * Find all nodes reachable from a given node using BFS
 */
export function getReachableNodes(graph: Graph, nodeId: string | number): Set<string | number> {
  const reachable = new Set<string | number>([nodeId]);
  const queue: (string | number)[] = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const successors = getSuccessors(graph, current);

    for (const successor of successors) {
      const successorIdStr = String(successor.id);
      if (!reachable.has(successor.id)) {
        reachable.add(successor.id);
        queue.push(successor.id);
      }
    }
  }

  return reachable;
}

/**
 * Detect if graph has cycles using DFS
 */
export function hasCycles(graph: Graph): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string | number): boolean {
    const nodeIdStr = String(nodeId);
    visited.add(nodeIdStr);
    recursionStack.add(nodeIdStr);

    const successors = getSuccessors(graph, nodeId);
    for (const successor of successors) {
      const successorIdStr = String(successor.id);
      if (!visited.has(successorIdStr)) {
        if (dfs(successor.id)) return true;
      } else if (recursionStack.has(successorIdStr)) {
        return true;
      }
    }

    recursionStack.delete(nodeIdStr);
    return false;
  }

  for (const node of graph.nodes) {
    const nodeIdStr = String(node.id);
    if (!visited.has(nodeIdStr)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

/**
 * Get entry nodes (nodes with no predecessors)
 */
export function getEntryNodes(graph: Graph): Node[] {
  return graph.nodes.filter((n) => getInDegree(graph, n.id) === 0);
}

/**
 * Get exit nodes (nodes with no successors)
 */
export function getExitNodes(graph: Graph): Node[] {
  return graph.nodes.filter((n) => getOutDegree(graph, n.id) === 0);
}

/**
 * Calculate all paths between two nodes (up to a depth limit)
 * Returns array of paths, each path is an array of node IDs
 */
export function getAllPaths(
  graph: Graph,
  sourceId: string | number,
  targetId: string | number,
  maxDepth: number = 20
): (string | number)[][] {
  const paths: (string | number)[][] = [];

  function dfs(
    currentId: string | number,
    targetIdParam: string | number,
    path: (string | number)[],
    visited: Set<string>,
    depth: number
  ): void {
    if (depth > maxDepth) return;
    if (String(currentId) === String(targetIdParam)) {
      paths.push([...path]);
      return;
    }

    const successors = getSuccessors(graph, currentId);
    for (const successor of successors) {
      const successorIdStr = String(successor.id);
      if (!visited.has(successorIdStr)) {
        visited.add(successorIdStr);
        dfs(successor.id, targetIdParam, [...path, successor.id], visited, depth + 1);
        visited.delete(successorIdStr);
      }
    }
  }

  const visited = new Set<string>([String(sourceId)]);
  dfs(sourceId, targetId, [sourceId], visited, 0);

  return paths;
}

/**
 * Compute node labels from graph (with fallback)
 */
export function getNodeLabel(graph: Graph, nodeId: string | number): string {
  const node = findNode(graph, nodeId);
  return node?.label || String(nodeId);
}

/**
 * Get edge label (with fallback)
 */
export function getEdgeLabel(graph: Graph, source: string | number, target: string | number): string {
  const edge = findEdge(graph, source, target);
  return edge?.label || '';
}
