/**
 * Graph Store
 * Manages the current graph and related state
 */
import { writable, type Writable } from 'svelte/store';
import type { Graph } from '$lib/utils/types';

export interface GraphState {
  current: Graph | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean; // Has been modified
  reachability: {
    entryNode?: string | number;
    exitNode?: string | number;
    reachableNodes?: Set<string | number>;
  };
}

const initialState: GraphState = {
  current: null,
  isLoading: false,
  error: null,
  isDirty: false,
  reachability: {}
};

export const graphStore: Writable<GraphState> = writable(initialState);

/**
 * Load a graph into the store
 */
export function loadGraph(graph: Graph): void {
  graphStore.update((state) => ({
    ...state,
    current: graph,
    isLoading: false,
    error: null,
    isDirty: false
  }));
}

/**
 * Set loading state
 */
export function setLoading(isLoading: boolean): void {
  graphStore.update((state) => ({
    ...state,
    isLoading
  }));
}

/**
 * Set error message
 */
export function setError(error: string | null): void {
  graphStore.update((state) => ({
    ...state,
    error
  }));
}

/**
 * Clear current graph
 */
export function clearGraph(): void {
  graphStore.set(initialState);
}

/**
 * Update reachability information
 */
export function updateReachability(
  entryNode?: string | number,
  exitNode?: string | number,
  reachableNodes?: Set<string | number>
): void {
  graphStore.update((state) => ({
    ...state,
    reachability: {
      entryNode,
      exitNode,
      reachableNodes
    }
  }));
}

/**
 * Subscribe to graph changes
 */
export function onGraphChange(callback: (graph: Graph | null) => void): () => void {
  return graphStore.subscribe((state) => callback(state.current));
}
