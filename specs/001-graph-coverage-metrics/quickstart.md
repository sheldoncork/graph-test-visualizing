# Quickstart: Graph Coverage Metrics Tool

**Date**: 2026-03-31 | **For**: Developers implementing Phase 1+ features  
**Purpose**: Get up and running with the codebase structure and first contributions.

---

## Prerequisites

- Node.js 18+ (for Svelte/Vite build)
- npm or yarn
- Git (for version control)
- Visual Studio Code with Svelte extension (recommended)

---

## Initial Setup

### 1. Clone and Install

```bash
cd graph-testing
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open browser to `http://localhost:5173` (Vite default)

### 3. Run Tests

```bash
npm run test                 # Run all tests once
npm run test:watch         # Watch mode for development
npm run test:ui            # Interactive test UI
npm run test:coverage      # Generate coverage report (target 80%+)
```

### 4. Build and Preview

```bash
npm run build              # Production build
npm run preview            # Preview production build locally
```

---

## Project Structure Quick Reference

```
src/
├── lib/
│   ├── components/        # Svelte UI components
│   │   ├── GraphViewer.svelte
│   │   ├── MetricsPanel.svelte
│   │   ├── ImportForm.svelte
│   │   ├── ResultsDisplay.svelte
│   │   └── TestPathInput.svelte
│   ├── services/          # Graph and coverage algorithms
│   │   ├── graphParser.ts     # Parse CSV/JSON → Graph entity
│   │   ├── duPairCoverage.ts  # DU-pair calculation
│   │   ├── primePath.ts       # Prime path enumeration (max 20 edges)
│   │   ├── nodeCoverage.ts
│   │   ├── edgeCoverage.ts
│   │   └── testPathValidator.ts
│   ├── stores/            # Svelte stores (state management)
│   │   ├── graphStore.ts      # Graph state
│   │   └── metricsStore.ts    # Metrics and results
│   └── utils/
│       ├── types.ts       # TypeScript interfaces
│       └── constants.ts   # Limits (e.g., maxPathLength: 20)
tests/
├── unit/                  # Unit tests for services/utils
├── integration/           # Component and workflow tests
└── fixtures/              # Test data (sample graphs)
```

---

## First Task: Implement Node Coverage

**Why start here?** Simplest metric; validates graph import pipeline; teaches pattern.

### Step 1: Write Test First (TDD)

Create `tests/unit/nodeCoverage.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateNodeCoverage } from '$lib/services/nodeCoverage';
import { simpleGraph } from '../fixtures/simple-graph.json';

describe('Node Coverage', () => {
  it('should calculate 100% coverage when all nodes visited', () => {
    const testPaths = [
      { sequence: ['A', 'B', 'C', 'D'] },
      { sequence: ['A', 'C', 'D'] }
    ];
    
    const result = calculateNodeCoverage(simpleGraph, testPaths);
    
    expect(result.totalCount).toBe(4); // 4 nodes in graph
    expect(result.coveredCount).toBe(4); // All covered
    expect(result.coveragePercentage).toBe(100);
  });

  it('should calculate partial coverage when some nodes not visited', () => {
    const testPaths = [{ sequence: ['A', 'B', 'C'] }];
    
    const result = calculateNodeCoverage(simpleGraph, testPaths);
    
    expect(result.totalCount).toBe(4);
    expect(result.coveredCount).toBe(3); // Node D not in path
    expect(result.coveragePercentage).toBe(75.0);
  });

  it('should flag unreachable nodes as uncovered', () => {
    // simpleGraph has unreachable node 'X'
    const testPaths = [{ sequence: ['A', 'B', 'C', 'D'] }];
    
    const result = calculateNodeCoverage(simpleGraph, testPaths);
    
    expect(result.uncoveredItems).toContain('X');
  });
});
```

### Step 2: Create Service

Create `src/lib/services/nodeCoverage.ts`:

```typescript
import type { Graph, TestPath, CoverageResult } from '$lib/utils/types';

export function calculateNodeCoverage(
  graph: Graph,
  testPaths: TestPath[]
): CoverageResult {
  // Find all nodes visited across all test paths
  const visitedNodes = new Set<string>();
  
  for (const path of testPaths) {
    for (const nodeId of path.sequence) {
      if (graph.nodes.find(n => n.id === nodeId)) {
        visitedNodes.add(nodeId);
      }
    }
  }

  const reachableNodes = graph.nodes.filter(n => n.isReachable);
  const coveredCount = [...visitedNodes].filter(
    id => reachableNodes.some(n => n.id === id)
  ).length;
  const totalCount = reachableNodes.length;
  
  return {
    id: `result-${Date.now()}`,
    graphId: graph.id,
    metricType: 'node',
    metricLabel: 'Node Coverage',
    totalCount,
    coveredCount,
    coveragePercentage: parseFloat(((coveredCount / totalCount) * 100).toFixed(1)),
    uncoveredCount: totalCount - coveredCount,
    uncoveredPercentage: parseFloat((100 - ((coveredCount / totalCount) * 100)).toFixed(1)),
    // ... other required fields
  };
}
```

### Step 3: Run Tests

```bash
npm run test:watch
```

Watch output for test pass. If tests fail, the error message tells you what's broken.

### Step 4: Hide Implementation in MetricsPanel

Add to `src/lib/components/MetricsPanel.svelte`:

```svelte
<script>
  import { calculateNodeCoverage } from '$lib/services/nodeCoverage';
  
  async function calculateMetric() {
    const result = calculateNodeCoverage(graph, testPaths);
    results = result;
  }
</script>

<button on:click={calculateMetric}>Calculate Node Coverage</button>
```

---

## Second Task: Implement DU-Pair Coverage

**Pattern**: Same as node coverage, but more complex algorithm.

**Algorithm Outline**:
```
1. Find all definition nodes (type='definition')
2. Find all use nodes (type='use')
3. For each (def, use) pair:
   - Is 'use' reachable from 'def' in graph?
   - Is this pair covered by any test path?
   - Mark as covered/uncovered
4. Calculate percentage
```

**Testing**: Fixture with marked def/use nodes.

---

## Architecture Patterns

### Pattern 1: Service Functions

All coverage metrics are pure functions:

```typescript
function calculateXXXCoverage(
  graph: Graph,
  testPaths: TestPath[]
): CoverageResult
```

Benefits:
- Easy to test (no state, no side effects)
- Reusable in different components
- Can run in Web Worker for performance

### Pattern 2: Stores for State

Graph and metrics stored in Svelte stores:

```typescript
// src/lib/stores/graphStore.ts
import { writable } from 'svelte/store';
import type { Graph } from '$lib/utils/types';

export const currentGraph = writable<Graph | null>(null);
export const testPaths = writable<TestPath[]>([]);

// Use in components:
import { currentGraph, testPaths } from '$lib/stores/graphStore';
```

Benefits:
- Reactive (components auto-update when store changes)
- Accessible from any component
- Decoupled communication

### Pattern 3: TypeScript for Safety

All major abstractions have TypeScript interfaces:

```typescript
// src/lib/utils/types.ts
export interface Graph {
  id: string;
  nodes: Node[];
  edges: Edge[];
  // ...
}

export interface Node {
  id: string;
  label: string;
  type: 'definition' | 'use' | 'regular';
  // ...
}
```

Benefits:
- Compile-time type checking
- IDE autocomplete
- Catches bugs early

---

## Performance Targets

From Constitution and spec:

| Operation | Target | Strategy |
|-----------|--------|----------|
| Import 50-node graph | < 10s | Stream parsing; no blocking operations |
| Calculate node/edge coverage | < 5s | O(n) algorithms; no nested loops |
| Calculate DU-pair coverage | < 5s | O(n²) reachability check; memoize |
| Calculate prime path coverage | < 10s | DFS with 20-edge limit; memoize paths |

**Monitoring**: Use `console.time()` during development:

```typescript
console.time('du-pair-calculation');
const result = calculateDUPairCoverage(graph, testPaths);
console.timeEnd('du-pair-calculation'); // Logs: "du-pair-calculation: 42ms"
```

---

## Testing Workflow

### Run All Tests
```bash
npm run test
```

### Run Specific Test File
```bash
npm run test -- src/services/nodeCoverage.test.ts
```

### View Coverage Report
```bash
npm run test:coverage
```

Open `coverage/index.html` in browser. Target: **80%+ coverage** for all files.

### Interactive Test Explorer
```bash
npm run test:ui
```

Opens web UI for test exploration and debugging.

---

## Code Quality Standards (Constitution)

Before committing:

1. **Tests Pass**
   ```bash
   npm run test
   ```

2. **Code Formatted**
   ```bash
   npm run format
   ```

3. **Linting Passes**
   ```bash
   npm run lint
   ```

4. **Types Check**
   ```bash
   npm run type-check
   ```

Example pre-commit workflow:
```bash
npm run test && npm run lint && npm run type-check && git commit -m "feat: add node coverage"
```

---

## Debugging Tips

### 1. VS Code Debugger

`.vscode/launch.json` configured for debugging tests:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:debug"],
  "console": "integratedTerminal"
}
```

Press F5 to start debugger.

### 2. Browser DevTools

App runs at `http://localhost:5173`. Open DevTools (F12):
- **Console**: Log coverage calculations
- **Network**: Check import file transfer speed
- **Performance**: Profile slow operations

### 3. Test Fixtures

Sample graphs in `tests/fixtures/`:
- `simple-graph.json` — 4 nodes, acyclic (quick iteration)
- `acyclic-graph.json` — 20 nodes, multiple paths (realistic)
- `cyclic-graph.json` — 15 nodes with cycles (edge case)

Use in tests:
```typescript
import acyclicGraph from '../fixtures/acyclic-graph.json';
const result = calculateDUPairCoverage(acyclicGraph, testPaths);
```

---

## Deployment

### Local GitHub Pages Preview

```bash
npm run build
npm run preview
# Then manually copy dist/ → docs/ and push to main branch
```

### Automated Deployment (via GitHub Actions)

`.github/workflows/deploy.yml` automatically:
1. Runs tests on push
2. Builds on `main` branch
3. Deploys to `gh-pages` branch → GitHub Pages

---

## Common Questions

**Q: Where does the TDD cycle start?**
A: Write a failing test first. Then write the minimal code to make it pass. Then refactor. Repeat.

**Q: Can I use external libraries?**
A: Yes, but run by Constitution Check. Prefer maintained, popular libraries (Cytoscape.js ✅, Vitest ✅). Avoid bloat.

**Q: How do I handle large graphs (100+ nodes)?**
A: Profile with DevTools Performance tab. Consider:
- Lazy rendering (render visible nodes only)
- Web Worker for heavy calculation
- Streaming import for large files

**Q: What if my algorithm times out?**
A: Check implementation for nested loops. For DU-pair: O(n²) is acceptable. For prime path: 20-edge limit prevents explosion.

---

## Next Steps

1. **Implement Node Coverage** ← Start here
2. **Implement Edge Coverage**
3. **Implement DU-Pair Coverage**
4. **Implement Prime Path Coverage**
5. **Integrate with UI components**
6. **Add export/reporting**

Each step builds on previous patterns and infrastructure.

---

## Resources

- [Svelte Documentation](https://svelte.dev/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Docs](https://vitest.dev/api/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Cytoscape.js API](https://js.cytoscape.org/api/)
- [WCAG 2.1 Compliance](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Ready to start?** Begin with `npm install && npm run dev` and create your first test! 🚀
