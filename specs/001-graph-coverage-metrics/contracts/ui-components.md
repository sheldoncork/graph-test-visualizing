# Contract: UI Components API

**Date**: 2026-03-31 | **Version**: 1.0.0  
**Scope**: Defines public API surface for Svelte components. All components must export props, events, and slots according to this specification.

---

## Component: GraphViewer

**Purpose**: Render interactive graph visualization using Cytoscape.js. Central visualization component.

**File**: `src/lib/components/GraphViewer.svelte`

### Props

```typescript
interface GraphViewerProps {
  graph: Graph;                        // Graph entity to visualize (required)
  selectedNodes?: Set<string>;         // Node IDs to highlight (optional)
  selectedEdges?: Set<string>;         // Edge IDs to highlight (optional)
  highlightCoverage?: Map<string, boolean>; // Coverage status per node/edge
  layout?: "hierarchical" | "force-directed" | "circular" | "breadthfirst"; // Default: hierarchical
  panZoomEnabled?: boolean;            // Allow user pan/zoom? (Default: true)
  interactionMode?: "view" | "select" | "path-trace"; // Default: view
  showLabels?: boolean;                // Show node/edge labels? (Default: true)
  nodeSize?: number;                   // Override node size (px) (Default: 40)
  colorScheme?: "default" | "high-contrast" | "colorblind"; // Default: default
}
```

### Events

```typescript
interface GraphViewerEvents {
  nodeClick: CustomEvent<{ nodeId: string; position: {x, y} }>;
  edgeClick: CustomEvent<{ edgeId: string }>;
  selectionChanged: CustomEvent<{ nodes: Set<string>; edges: Set<string> }>;
  pathStarted: CustomEvent<{ startNodeId: string }>; // In path-trace mode
  pathNodeAdded: CustomEvent<{ path: string[] }>; // Node added to traced path
  pathCompleted: CustomEvent<{ path: string[] }>; // Path complete/submitted
  layoutChanged: CustomEvent<{ newLayout: string }>;
}
```

### Slots

```svelte
<GraphViewer {graph}>
  <div slot="overlay">Custom overlay content</div>
  <div slot="toolbar">Custom toolbar buttons</div>
</GraphViewer>
```

### Exported Functions

```typescript
export function zoomToNode(nodeId: string): void;
export function zoomToFit(): void;
export function exportAsSVG(): string;
export function highlightPath(path: string[], color?: string): void;
export function clearHighlights(): void;
```

### Accessibility

- ✅ Keyboard navigation (arrow keys to select, Enter to open detail)
- ✅ `role="region"` with `aria-label="Graph visualization"`
- ✅ Use semantic colors with pattern overlays (not color-only)
- ✅ Tooltips on node hover with full label and ID
- ✅ Focus indicators visible

---

## Component: MetricsPanel

**Purpose**: Allow users to select coverage metrics and view results.

**File**: `src/lib/components/MetricsPanel.svelte`

### Props

```typescript
interface MetricsPanelProps {
  graph: Graph;                        // Graph being analyzed
  availableMetrics: CoverageMetric[];  // List of metrics to choose from
  selectedMetric?: CoverageMetric;     // Currently selected metric (optional)
  testPaths: TestPath[];               // Available test paths for calculation
  isCalculating?: boolean;             // Show loading state (Default: false)
  results?: CoverageResult;            // Latest calculation results (optional)
  resultsHistory?: CoverageResult[];   // Previous results (optional, for comparison)
}
```

### Events

```typescript
interface MetricsPanelEvents {
  metricSelected: CustomEvent<{ metric: CoverageMetric }>;
  calculateRequested: CustomEvent<{ metric: CoverageMetric; testPaths: TestPath[] }>;
  compareRequested: CustomEvent<{ results: CoverageResult[] }>;
  exportRequested: CustomEvent<{ result: CoverageResult; format: "json" | "csv" | "text" }>;
  detailsRequested: CustomEvent<{ item: string }>; // Show details for specific coverage item
}
```

### Slots

```svelte
<MetricsPanel {graph} {availableMetrics}>
  <div slot="metric-description">Custom help text</div>
  <div slot="results-header">Custom result header</div>
</MetricsPanel>
```

### Exported Functions

```typescript
export function getSelectedMetric(): CoverageMetric | null;
export function setSelectedMetric(metric: CoverageMetric): void;
export function startCalculation(metric: CoverageMetric): Promise<CoverageResult>;
export function clearResults(): void;
```

---

## Component: ImportForm

**Purpose**: Handle graph file import (CSV, JSON, GraphML).

**File**: `src/lib/components/ImportForm.svelte`

### Props

```typescript
interface ImportFormProps {
  acceptedFormats?: string[];          // ".csv,.json,.graphml" (Default: all supported)
  maxFileSizeKB?: number;              // Max file size in KB (Default: 1000)
  showExamples?: boolean;              // Show example graph links? (Default: true)
  autoValidate?: boolean;              // Validate while user selects? (Default: true)
}
```

### Events

```typescript
interface ImportFormEvents {
  graphImported: CustomEvent<{ graph: Graph; originalFile: File }>;
  validationError: CustomEvent<{ errors: ValidationError[]; warnings: ValidationWarning[] }>;
  parseError: CustomEvent<{ message: string }>;
  cancelled: CustomEvent<void>;
}
```

### Slots

```svelte
<ImportForm on:graphImported>
  <div slot="instructions">Step-by-step import guide</div>
  <div slot="errors">Custom error display</div>
  <div slot="examples">Links to sample graphs</div>
</ImportForm>
```

### Exported Functions

```typescript
export function triggerFileSelect(): void;
export function parseCSV(content: string): ParseResult;
export function parseJSON(content: string): ParseResult;
export function downloadTemplate(format: "csv" | "json"): void;
```

---

## Component: ResultsDisplay

**Purpose**: Show coverage results in readable format with details and export options.

**File**: `src/lib/components/ResultsDisplay.svelte`

### Props

```typescript
interface ResultsDisplayProps {
  result: CoverageResult;              // Result to display (required)
  showDetails?: boolean;               // Expand detailed breakdown? (Default: false)
  drilldownDepth?: "summary" | "medium" | "detailed"; // Default: medium
  graph: Graph;                        // For context (optional)
  highlightOnGraph?: boolean;          // Highlight covered items on GraphViewer? (Default: true)
}
```

### Events

```typescript
interface ResultsDisplayEvents {
  exportRequested: CustomEvent<{ format: "json" | "csv" | "text" }>;
  compareRequested: CustomEvent<{ result: CoverageResult }>;
  itemSelected: CustomEvent<{ itemId: string; itemType: string }>; // e.g., pair_1, prime_path_3
  detailsToggled: CustomEvent<{ expanded: boolean }>;
}
```

### Slots

```svelte
<ResultsDisplay {result}>
  <div slot="header">Custom result header</div>
  <div slot="summary">Custom summary display</div>
  <div slot="details">Custom detail view</div>
  <div slot="footer">Custom actions</div>
</ResultsDisplay>
```

### Exported Functions

```typescript
export function downloadCSV(result: CoverageResult): void;
export function downloadJSON(result: CoverageResult): void;
export function downloadTextReport(result: CoverageResult): void;
export function printReport(result: CoverageResult): void;
export function expandAllDetails(): void;
export function collapseAllDetails(): void;
```

---

## Component: TestPathInput

**Purpose**: Allow users to enter test paths as node sequences and validate.

**File**: `src/lib/components/TestPathInput.svelte`

### Props

```typescript
interface TestPathInputProps {
  graph: Graph;                        // Graph for validation (required)
  existingPaths?: TestPath[];          // Already entered paths (optional)
  suggestNodeCompletion?: boolean;     // Auto-suggest node IDs? (Default: true)
  allowPathTracing?: boolean;          // Enable interactive path tracing on graph? (Default: true)
  maxPathsLimit?: number;              // Max paths user can enter (Default: 100)
}
```

### Events

```typescript
interface TestPathInputEvents {
  pathAdded: CustomEvent<{ path: TestPath }>;
  pathRemoved: CustomEvent<{ pathId: string }>;
  pathsSubmitted: CustomEvent<{ paths: TestPath[] }>;
  validationError: CustomEvent<{ pathId?: string; message: string }>;
  tracingStarted: CustomEvent<{ startNodeId: string }>;
  tracingCompleted: CustomEvent<{ path: string[] }>;
}
```

### Slots

```svelte
<TestPathInput {graph}>
  <div slot="instructions">How to enter paths</div>
  <div slot="path-item" let:path let:index>
    Custom path display item
  </div>
</TestPathInput>
```

### Exported Functions

```typescript
export function addPath(path: string[]): TestPath;
export function removePath(pathId: string): void;
export function validatePath(path: string[]): ValidationResult;
export function suggestNextNode(currentPath: string[]): string[];
export function clearAllPaths(): void;
export function getPaths(): TestPath[];
```

---

## Layout Component: MainLayout

**Purpose**: Master layout for app; arranges panels and routes.

**File**: `src/routes/+layout.svelte`

### Structure

```svelte
<MainLayout>
  <div class="top-nav">Navigation bar</div>
  <div class="main-container">
    <div class="left-sidebar">
      <ImportForm />
      <TestPathInput />
      <MetricsPanel />
    </div>
    <div class="center">
      <GraphViewer />
    </div>
    <div class="right-sidebar">
      <ResultsDisplay />
    </div>
  </div>
  <div class="status-bar">Status messages, progress</div>
</MainLayout>
```

---

## Global Event Bus

**Purpose**: Allow decoupled communication between components via stores.

**File**: `src/lib/stores/eventBus.ts`

```typescript
import { writable } from 'svelte/store';

// Global events
export const appEvent = writable<AppEvent | null>(null);

interface AppEvent {
  type: "graph-imported" | "metric-calculated" | "path-added" | "error";
  payload: any;
  timestamp: number;
}

// Usage in components:
import { appEvent } from '$lib/stores/eventBus';
appEvent.set({
  type: 'graph-imported',
  payload: { graphId: graph.id },
  timestamp: Date.now()
});
```

---

## Accessibility Standards

All components must comply with WCAG 2.1 Level AA:

- ✅ Keyboard navigable (no mouse-only features)
- ✅ Focus indicators visible (not hidden)
- ✅ Semantic HTML (`<button>`, `<label>`, `<main>`, etc.)
- ✅ ARIA labels for interactive elements
- ✅ Color contrast: 4.5:1 for text, 3:1 for graphics
- ✅ Sufficient spacing between interactive elements (44px min)
- ✅ Motion and animations can be disabled (prefers-reduced-motion)

---

## Testing Contract

Each component must have:

1. **Unit Tests** (`tests/unit/components/`)
   - Props validation
   - Event emission
   - Slot rendering
   - Export function calls

2. **Accessibility Tests** (`tests/integration/`)
   - Keyboard navigation works
   - ARIA labels present
   - Focus order logical
   - Color contrast verified

3. **Integration Tests** (`tests/integration/workflows.test.ts`)
   - Component interactions (MetricsPanel → ResultsDisplay)
   - Data flow through stores
   - End-to-end workflows (Import → Calculate → Export)

---

## Summary

✅ 5 main components with clear responsibilities  
✅ Consistent props/events/slots patterns  
✅ Exported functions for programmatic control  
✅ Global event bus for decoupled communication  
✅ WCAG 2.1 AA accessibility compliance required  
✅ Comprehensive test coverage expected  
