/**
 * UI Store
 * Manages UI state like zoom, pan, selected nodes, display options
 */
import { writable, type Writable } from 'svelte/store';

export interface UIState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodes: Set<string | number>;
  selectedEdges: Set<string>;
  displayMode: 'light' | 'dark';
  layout: 'cose' | 'hierarchical' | 'circular';
  showLabels: boolean;
  showDegrees: boolean;
  highlightedPath?: (string | number)[]; // Currently highlighted test path
}

const initialState: UIState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedNodes: new Set(),
  selectedEdges: new Set(),
  displayMode: 'light',
  layout: 'cose',
  showLabels: true,
  showDegrees: false,
  highlightedPath: undefined
};

export const uiStore: Writable<UIState> = writable(initialState);

/**
 * Set zoom level
 */
export function setZoom(zoom: number): void {
  uiStore.update((state) => ({
    ...state,
    zoom: Math.max(0.1, Math.min(zoom, 3)) // Clamp between 0.1 and 3
  }));
}

/**
 * Set pan offset
 */
export function setPan(x: number, y: number): void {
  uiStore.update((state) => ({
    ...state,
    pan: { x, y }
  }));
}

/**
 * Toggle display mode (light/dark)
 */
export function toggleDisplayMode(): void {
  uiStore.update((state) => ({
    ...state,
    displayMode: state.displayMode === 'light' ? 'dark' : 'light'
  }));
}

/**
 * Change layout
 */
export function setLayout(layout: UIState['layout']): void {
  uiStore.update((state) => ({
    ...state,
    layout
  }));
}

/**
 * Toggle label visibility
 */
export function toggleLabels(): void {
  uiStore.update((state) => ({
    ...state,
    showLabels: !state.showLabels
  }));
}

/**
 * Toggle degree visibility
 */
export function toggleDegrees(): void {
  uiStore.update((state) => ({
    ...state,
    showDegrees: !state.showDegrees
  }));
}

/**
 * Select nodes
 */
export function selectNodes(nodeIds: (string | number)[]): void {
  uiStore.update((state) => ({
    ...state,
    selectedNodes: new Set(nodeIds)
  }));
}

/**
 * Toggle node selection
 */
export function toggleNodeSelection(nodeId: string | number): void {
  uiStore.update((state) => {
    const newSelected = new Set(state.selectedNodes);
    if (newSelected.has(nodeId)) {
      newSelected.delete(nodeId);
    } else {
      newSelected.add(nodeId);
    }
    return {
      ...state,
      selectedNodes: newSelected
    };
  });
}

/**
 * Clear selections
 */
export function clearSelections(): void {
  uiStore.update((state) => ({
    ...state,
    selectedNodes: new Set(),
    selectedEdges: new Set(),
    highlightedPath: undefined
  }));
}

/**
 * Highlight a test path
 */
export function highlightPath(path?: (string | number)[]): void {
  uiStore.update((state) => ({
    ...state,
    highlightedPath: path
  }));
}

/**
 * Reset view (zoom + pan)
 */
export function resetView(): void {
  uiStore.update((state) => ({
    ...state,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }));
}
