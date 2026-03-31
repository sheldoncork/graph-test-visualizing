# Tasks: Graph Coverage Metrics Tool

**Feature Branch**: `001-graph-coverage-metrics`  
**Created**: 2026-03-31  
**Input**: plan.md (tech stack, architecture), spec.md (user stories, requirements), data-model.md (entities), contracts/ (APIs), research.md (algorithms), quickstart.md (patterns)

**Implementation Strategy**: MVP-first approach starting with US1 (P1), then US2-US3 (P1), then US4-US5 (P2), then US6 (P3). Each user story is independently testable. All marked with `[P]` can be parallelized within their phase.

---

## Format: `- [ ] [TaskID] [P] [Story] Description with file path`

- **[TaskID]**: Sequential (T001, T002, etc.) in execution order
- **[P]**: Parallelizable task (can run simultaneously with other [P] tasks in same phase)
- **[Story]**: User story label (US1, US2, US3, US4, US5, US6) - only in user story phases
- **File Paths**: Exact locations where implementation happens

---

## Phase 1: Setup & Configuration

**Purpose**: Initialize SvelteKit + Vite + TypeScript project, configure build tooling and deployment

**Duration**: ~2-3 hours | **Blocking**: All subsequent phases

### Environment & Dependencies

- [x] T001 Initialize directory structure per plan.md in workspace root
- [x] T002 Create package.json with dependencies: Svelte 4.x, TypeScript 5.x, Vite, SvelteKit, Cytoscape.js 3.x, Vitest, @sveltejs/adapter-static
- [x] T003 [P] Install npm dependencies: `npm install`
- [x] T004 [P] Configure tsconfig.json for ES2020 target, enable strict mode, path aliases (`$lib`)
- [x] T005 [P] Initialize Vite config (vite.config.ts) for SvelteKit with development server on port 5173
- [x] T006 [P] Configure SvelteKit (svelte.config.js) with static adapter for GitHub Pages deployment
- [x] T007 [P] Setup ESLint (.eslintrc.cjs) with Svelte plugin, TypeScript parser, max-depth/cyclomatic-complexity rules
- [x] T008 [P] Configure Prettier (.prettierrc.json) with 2-space indent, semicolons, single quotes
- [x] T009 [P] Initialize Vitest (vitest.config.ts) with globals enabled, coverage at 80% minimum
- [x] T010 [P] Create Svelte Testing Library setup (test setup file with render, screen, fireEvent utilities)
- [x] T011 Create .github/workflows/deploy.yml for GitHub Pages deployment (build → publish to gh-pages branch)
- [x] T012 Create public/ directory structure: index.html entry point, favicon.svg, robots.txt
- [x] T013 Create src/routes/ basic structure: +layout.svelte, +page.svelte stubs
- [x] T014 Setup static/ directory for sample graphs (static/examples/simple-graph.csv)
- [x] T015 Create README.md with setup, development, test, build commands referencing quickstart.md

**Checkpoint**: `npm run dev` starts successfully; `npm run test` runs with 0 tests (all passing)

---

## Phase 2: Foundational Infrastructure

**Purpose**: Core data structures, type system, stores, utilities, and test fixtures - MUST complete before any user story begins

**Duration**: ~4-5 hours | **Blocking**: All user story phases (Phase 3+)

**⚠️ CRITICAL**: Cannot start US1 until Phase 2 is 100% complete

### TypeScript Types & Interfaces

- [x] T016 Create src/lib/utils/types.ts with Graph, Node, Edge, TestPath, CoverageResult, CoverageMetric interfaces (from data-model.md)
- [ ] T017 [P] Create validation type guards: `isValidGraph()`, `isValidNode()`, `isValidEdge()` in src/lib/utils/types.ts
- [x] T018 [P] Create src/lib/utils/constants.ts with: `MAX_PRIME_PATH_LENGTH = 20`, `MAX_NODES = 1000`, `MAX_EDGES = 5000`, metric type enums

### Svelte Stores (State Management)

- [x] T019 Create src/lib/stores/graphStore.ts: writable store for current graph, reachability flags, metadata
- [x] T020 [P] Create src/lib/stores/metricsStore.ts: writable store for selected metrics, coverage results, ui state
- [x] T021 [P] Create src/lib/stores/uiStore.ts: writable store for zoom level, selected nodes, display mode (dark/light)
- [x] T022 Create src/lib/utils/helpers.ts: utility functions (findNode, findEdge, getInDegree, getOutDegree, isReachable)

### Test Fixtures & Test Data

- [x] T023 Create tests/fixtures/simple-graph.json (5-node acyclic graph for quick tests)
- [ ] T024 [P] Create tests/fixtures/acyclic-graph.json (20-node acyclic graph with clear DU-pair structure)
- [ ] T025 [P] Create tests/fixtures/cyclic-graph.json (15-node cyclic graph for cycle handling validation)
- [ ] T026 [P] Create tests/fixtures/large-graph.json (100-node graph for performance benchmarks)
- [ ] T027 Create tests/fixtures/disconnected-graph.json (2 subgraphs for edge case testing)
- [ ] T028 Create tests/helpers.ts with `loadFixture()`, `createMockGraph()`, `createMockTestPath()` utilities

### Core Service Infrastructure

- [x] T029 Create src/lib/services/ directory structure (all service modules with GraphService, DUPairCoverageService, PrimePathCoverageService, NodeCoverageService, EdgeCoverageService, McCabeComplexityService, AllPathsCoverageService)
- [x] T030 Create tests/unit/ directory structure for algorithm tests (graphService.test.ts, duPairCoverage.test.ts, primePathCoverage.test.ts)
- [x] T031 Create tests/integration/ directory structure for workflow tests (coverage-workflows.test.ts)

**Checkpoint**: `npm run test` shows all type definitions compile; fixtures load correctly; stores initialized

---

## Phase 3: User Story 1 - Import & Visualize Graph (Priority: P1) 🎯 MVP

**Goal**: Students can import graph files (CSV/JSON) and see visual representation on screen before analyzing coverage

**Independent Test**: Import simple-graph.csv → see all nodes and edges rendered with labels, zoom/pan working

**Duration**: ~6-8 hours | **Builds on**: Phase 2

### Tests for US1 ⚠️ (Write FIRST, expect to FAIL)

- [ ] T032 [P] [US1] Create tests/unit/graphParser.test.ts with test cases for CSV parsing: valid graph, bad format, missing edges
- [ ] T033 [P] [US1] Create tests/unit/graphValidator.test.ts with validation tests: duplicate nodes, missing edges, invalid references
- [ ] T034 [P] [US1] Create tests/integration/import-workflow.test.ts with end-to-end: import CSV → graph loads → visualization shows nodes

### Implementation for US1

- [ ] T035 [P] [US1] Implement src/lib/services/graphParser.ts: `parseCSV()` function accepting CSV string, returning Graph object
  - Parse format: "source,target" or "node_id,label,type" rows
  - Validate structure, detect cycles, compute reachability
  - Return typed Graph entity with all properties validated

- [ ] T036 [P] [US1] Implement src/lib/services/graphValidator.ts: `validateGraph()` checking for edges referencing nonexistent nodes, self-loops detection
  
- [x] T037 [US1] Create src/lib/components/ImportForm.svelte: file upload input (drag-drop or file browser)
  - Accept CSV and JSON formats
  - Show error messages on parse failure
  - Bind to graphStore on successful import
  - Display "Importing..." progress for large files

- [x] T038 [US1] Implement src/lib/components/GraphViewer.svelte with Cytoscape.js integration
  - Props: `graph: Graph` (from graphStore)
  - Create Cytoscape container, instantiate with graph nodes/edges
  - Configure layout: "cose" (force-directed) or "hierarchical" based on user Toggle
  - Bind pan/zoom to uiStore
  - Highlight entry (green) and exit (red) nodes
  - Show node labels clearly

- [x] T039 [US1] Create src/lib/components/GraphControls.svelte for layout selection, zoom buttons, reset view
  - Buttons: "Layout (Hierarchical)", "Layout (Circular)", "Zoom In", "Zoom Out", "Reset"
  - Update uiStore on interactions

- [x] T040 [P] [US1] Create src/routes/+page.svelte layout: ImportForm + GraphViewer side-by-side or stacked
  - Left panel: ImportForm (narrow)
  - Right panel: GraphViewer (wide)
  - Top bar: Title, description

- [x] T041 [US1] Add error handling in src/lib/services/graphService.ts: catch parse errors, throw descriptive messages
  - "Invalid CSV format: expected 'source,target' on line X"
  - "Node 'A5' referenced in edge but not defined"

- [ ] T042 [P] [US1] Create tests/fixtures/sample-graphs/ with CSV examples: simple-graph.csv, complex.csv, invalid.csv

**Checkpoint**: `npm run dev` + upload simple-graph.csv → nodes and edges appear on screen with zoom/pan working

---

## Phase 4: User Story 2 - Calculate DU-Pair Coverage (Priority: P1)

**Goal**: Students can select DU-pair metric and see coverage percentage + detailed breakdown of covered/uncovered pairs

**Independent Test**: Import graph with marked def/use nodes → select DU-pair metric → get report "X of Y pairs covered (Z%)"

**Duration**: ~6-8 hours | **Builds on**: Phase 2 + Phase 3 (US1)

### Tests for US2 ⚠️ (Write FIRST)

- [x] T043 [P] [US2] Create tests/unit/duPairCoverage.test.ts with test cases:
  - Define-use reachability (is use reachable from def?)
  - Coverage percentage calculation
  - Infeasible pairs (def and use are unreachable)
  - All pairs covered (100%)
  - No pairs covered (0%)

- [x] T044 [P] [US2] Create tests/integration/coverage-workflows.test.ts: import graph → mark def/use nodes → calculate DU-pair → results display

### Implementation for US2

- [x] T045 [US2] Create src/lib/services/duPairCoverageService.ts: `calculateDUPairCoverage()` function
  - Input: Graph, list of definition nodes, list of use nodes, testPaths[]
  - Algorithm: For each (def, use) pair, check if use is reachable from def via any testPath
  - Output: CoverageResult { totalCount, coveredCount, coveragePercentage, coveredItems[], uncoveredItems[] }
  - Use BFS/DFS reachability from graphStore helpers

- [ ] T046 [P] [US2] Implement src/lib/services/testPathValidator.ts: `validateTestPath()` function
  - Check each node in sequence exists in graph
  - Check consecutive nodes have edge between them
  - Return { isValid: boolean, errors: string[] }

- [ ] T047 [P] [US2] Create src/lib/components/MetricsPanel.svelte: metric selection UI
  - Radio buttons or dropdown: "Node", "Edge", "DU-Pair", "Prime Path", "All Paths", "McCabe"
  - Show description for each metric
  - Emit selection to metricsStore
  - Props: graph: Graph (from graphStore)

- [ ] T048 [US2] Create src/lib/components/NodeMarker.svelte for marking nodes as def/use
  - Display on graph overlay
  - Right-click on node → mark as "Definition" / "Use" / "Clear"
  - Persist to graphStore

- [ ] T049 [P] [US2] Create src/lib/components/TestPathInput.svelte: input field for test paths
  - Format: "1,2,3,4" or "A,B,C" (comma-separated node sequence)
  - Validate on input blur
  - Store multiple test paths in array
  - Show error inline if invalid

- [ ] T050 [US2] Create src/lib/components/ResultsDisplay.svelte for showing coverage results
  - Props: coverageResult: CoverageResult
  - Display: metric name, coverage percentage (large), covered/total count
  - Show pie chart or progress bar
  - List uncovered items (if not too many)

- [ ] T051 [P] [US2] Implement metric calculation trigger in src/routes/+page.svelte:
  - Button: "Calculate Coverage"
  - Calls appropriate algorithm based on metricsStore selection
  - Updates metricsStore.results on completion
  - Show loading indicator during calculation

**Checkpoint**: Import graph → mark definition/use nodes → add test path "1,2,3" → click Calculate → see "3 of 5 DU-pairs covered (60%)"

---

## Phase 5: User Story 3 - Calculate Prime Path Coverage (Priority: P1)

**Goal**: Students understand which prime paths exist in graph and how many are covered by test paths

**Independent Test**: Import acyclic graph → click "Prime Path" metric → see enumerated prime paths with coverage status

**Duration**: ~8-10 hours | **Builds on**: Phase 2 + Phase 3 (US1) + Phase 4 (US2)

### Tests for US3 ⚠️ (Write FIRST)

- [ ] T052 [P] [US3] Create tests/unit/primePath.test.ts with test cases:
  - Acyclic graph: enumerate all prime paths correctly
  - Cyclic graph: enumerate paths up to max length (20 edges), no infinite loops
  - Path coverage: which prime paths are covered by given testPaths
  - Edge cases: single-node graph, linear graph, complex DAG

- [ ] T053 [P] [US3] Create tests/unit/cycleDetection.test.ts: detect cycles, mark back edges

- [ ] T054 [P] [US3] Create tests/integration/prime-path-workflow.test.ts: import graph → enumerate primes → load test paths → calculate coverage

### Implementation for US3

- [ ] T055 [P] [US3] Implement src/lib/services/primePath.ts: `enumeratePrimePaths()` function
  - Input: Graph (from graphStore)
  - Algorithm: DFS-based enumeration (see research.md R-002) with 20-edge maximum limit
  - Use cycle detection to identify back edges
  - Memoization to avoid redundant computation
  - Output: PrimePath[] { path: string[], length: number, isCovered: boolean }

- [ ] T056 [P] [US3] Implement src/lib/services/cycleDetection.ts: `detectCycles()` and `markBackEdges()`
  - Use DFS to classify edges: tree, back, forward, cross
  - Mark back edges in Graph structure
  - Return isAcyclic boolean

- [ ] T057 [US3] Implement src/lib/services/primePathCoverage.ts: `calculatePrimePathCoverage()` function
  - Input: primePaths[], testPaths[]
  - For each prime path, check if it's covered by any test path (subsequence match)
  - Output: CoverageResult { totalCount: primePaths.length, coveredCount, ... }

- [ ] T058 [P] [US3] Create src/lib/components/PrimePathList.svelte: display enumerated prime paths with coverage status
  - Table or list showing: Path ID, Path (node sequence), Length, Covered? (checkmark/X)
  - Highlight covered paths (green background)
  - Show warning if path limit reached: "Some prime paths may be truncated (max 20 edges)"

- [ ] T059 [US3] Update src/routes/+page.svelte to trigger prime path calculation
  - "Prime Path" metric selection → call enumeratePrimePaths() → call calculatePrimePathCoverage() → update metricsStore

- [ ] T060 [P] [US3] Add logging to src/lib/services/primePath.ts for debugging:
  - Log path count at each DFS depth
  - Log memoization hits/misses
  - Log DFS traversal order for student learning

**Checkpoint**: Import acyclic-graph.json → select "Prime Path" → see list of all prime paths → add test paths → coverage shows "X of Y prime paths covered"

---

## Phase 6: User Story 4 - Calculate Additional Coverage Metrics (Priority: P2)

**Goal**: Support diversity of educational contexts by providing node, edge, all-paths, and McCabe cyclomatic complexity metrics

**Independent Test**: For each metric type, select → calculate → see results independently

**Duration**: ~8-10 hours | **Builds on**: Phase 2 + Phase 3

### Implementation for US4

- [ ] T061 [P] [US4] Implement src/lib/services/nodeCoverage.ts: `calculateNodeCoverage()` function
  - Input: Graph, testPaths[]
  - Count which nodes are traversed by at least one test path
  - Output: CoverageResult { totalCount: nodeCount, coveredCount, ... }
  - Include unreachable nodes in total (0% coverage for those)

- [ ] T062 [P] [US4] Implement src/lib/services/edgeCoverage.ts: `calculateEdgeCoverage()` function
  - Input: Graph, testPaths[]
  - Count which edges are traversed
  - Output: CoverageResult { totalCount: edgeCount, coveredCount, ... }

- [ ] T063 [P] [US4] Implement src/lib/services/allPathsCoverage.ts: `calculateAllPathsCoverage()` function
  - Input: Graph (acyclic only; warn if cyclic), testPaths[]
  - Enumerate ALL paths from entry to exit nodes (not just prime paths)
  - Add timeout: 10s maximum enumeration time
  - If timeout exceeded: show partial results with warning "Enumeration stopped after 10s"
  - Output: CoverageResult with partial counts

- [ ] T064 [P] [US4] Implement src/lib/services/mccCoverage.ts: `calculateMCCPaths()` function
  - Calculate cyclomatic complexity: M = E - N + 2P (edges - nodes + 2*connected_components)
  - Enumerate M linearly independent paths (basis for all paths)
  - Input: Graph, testPaths[]
  - Output: CoverageResult { totalCount: M, coveredCount, independentPaths: string[] }

- [ ] T065 [US4] [P] Create unit tests tests/unit/nodeCoverage.test.ts, edgeCoverage.test.ts, allPathsCoverage.test.ts, mccCoverage.test.ts
  - Test each metric on fixtures (simple, acyclic, cyclic, large-graph)
  - Verify calculations match expected values

- [ ] T066 [P] [US4] Update src/lib/components/MetricsPanel.svelte to list all 6 metric options with descriptions
  - "Node Coverage": How many nodes are executed?
  - "Edge Coverage": How many branches are taken?
  - "DU-Pair Coverage": How many definition-use relationships are exercised?
  - "Prime Path Coverage": How many maximal paths are covered?
  - "All-Paths Coverage": How many paths from entry to exit?
  - "McCabe Paths": How many linearly independent paths?

**Checkpoint**: Select each metric type independently → see correct coverage percentages for each

---

## Phase 7: User Story 5 - Analyze & Compare Test Paths (Priority: P2)

**Goal**: Visualize individual test paths on graph and understand their contribution to coverage metrics

**Independent Test**: Import graph → add test path "A,B,C,D" → see path highlighted on graph → see which metrics it covers

**Duration**: ~6-8 hours | **Builds on**: Phase 2 + Phase 3

### Implementation for US5

- [ ] T067 [P] [US5] Create src/lib/components/PathVisualization.svelte: highlight test path on graph
  - Input: testPath: TestPath, graph: Graph
  - Highlight nodes in sequence (thick border or color)
  - Highlight edges traversed (thick line, color)
  - Show path sequence as text overlay
  - Props: activePathId: string (which path to highlight)

- [ ] T068 [P] [US5] Create src/lib/services/pathAnalysis.ts: `analyzePathContribution()` function
  - Input: testPath, graph, all metrics' definitions (primes, du-pairs, etc.)
  - Output: { coversNodes: string[], coversEdges: string[], coversDUPairs: string[], coversPrimePaths: string[], ... }
  - Explains which elements THIS path covers

- [ ] T069 [US5] Create src/lib/components/PathContribution.svelte: display what coverage elements path covers
  - Table or list: "Path X covers: 5 nodes, 4 edges, 3 DU-pairs, 2 prime paths"
  - Link to actual elements (clickable to highlight on graph)

- [ ] T070 [P] [US5] Update src/lib/components/TestPathInput.svelte to show path list:
  - Show all test paths as list: "Path 1: A→B→C→D"
  - Hover/click to highlight on graph
  - Delete button per path

- [ ] T071 [US5] Update src/routes/+page.svelte: integrate path visualization
  - When test path selected → call analyzePathContribution() → show PathContribution component
  - Synchronize graph highlighting with selected path

- [ ] T072 [P] [US5] Create tests/integration/path-analysis.test.ts: verify path contribution calculations

**Checkpoint**: Add test path "A,B,C" → see path highlighted on graph → see "Covers 3 nodes, 2 edges, 1 DU-pair"

---

## Phase 8: User Story 6 - Export Coverage Reports (Priority: P3)

**Goal**: Teachers can export analysis results in standard formats (CSV, JSON, text) for sharing and documentation

**Independent Test**: After calculating coverage → click "Export" → download coverage-report.csv with all metrics

**Duration**: ~4-5 hours | **Builds on**: Phase 2 + metrics (Phase 4-6)

### Implementation for US6

- [ ] T073 [P] [US6] Implement src/lib/services/reportGenerator.ts: `generateReport()` function
  - Input: graph: Graph, allCoverageResults: CoverageResult[], testPaths: TestPath[]
  - Generate structured report object with all analysis data

- [ ] T074 [P] [US6] Implement CSV export in src/lib/services/reportGenerator.ts: `exportCSV()` function
  - Format: rows with headers "Metric", "Total", "Covered", "Percentage"
  - One row per metric type with results
  - Additional section: Test paths list
  - Example output file: `coverage-report.csv`

- [ ] T075 [P] [US6] Implement JSON export in src/lib/services/reportGenerator.ts: `exportJSON()` function
  - Structure: { graph: {...}, metrics: [...], testPaths: [...], timestamp: ... }
  - Include all detailed data for re-import/analysis

- [ ] T076 [P] [US6] Implement text report export: `exportText()` function
  - Plain text format readable in email or terminal
  - Headers: Graph Name, Metrics Calculated, Results Table, Test Paths List, Timestamp

- [ ] T077 [US6] Create src/lib/components/ExportPanel.svelte:
  - Radio buttons: Format choice (CSV, JSON, Text)
  - Button: "Download Report"
  - Show filename that will be created: `coverage-report-[timestamp].csv`

- [ ] T078 [P] [US6] Implement browser download in src/lib/utils/helpers.ts: `downloadFile(filename, content, mimeType)` function
  - Create Blob, generate download link, trigger click, clean up

- [ ] T079 [US6] Update src/routes/+page.svelte to show ExportPanel after any calculation
  - Button only enabled if results exist
  - Show success toast on download completion

- [ ] T080 [P] [US6] Create tests/unit/reportGenerator.test.ts: verify report formats
  - CSV parsing, JSON structure, text formatting

**Checkpoint**: Calculate coverage → click "Export" dropdown → select CSV → download file with all results

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, error handling, deployment, final documentation

**Duration**: ~8-10 hours | **Builds on**: All previous phases

### Error Handling & Validation

- [ ] T081 [P] Create src/lib/services/errorHandler.ts: centralized error handling
  - Catch and log all algorithm errors
  - Return user-friendly messages: "Prime path enumeration exceeded 10-second timeout"
  - Distinguish user errors (bad input) from system errors

- [ ] T082 [P] Update all services to throw descriptive errors from errorHandler.ts
  - graphParser: file format errors
  - duPairCoverage: missing def/use nodes
  - primePath: cyclic graph warnings, timeout warnings
  - testPathValidator: path validation errors

- [ ] T083 Create src/lib/components/ErrorBoundary.svelte: catch and display component errors gracefully
  - Show error message with "Reload" button
  - Log error to console for debugging

- [ ] T084 Add UI error display in src/routes/+page.svelte: toast notifications for errors
  - Transient errors (quick dismiss)
  - Persistent errors (require user action)

### Performance Optimization

- [ ] T085 [P] Profile algorithms with Web Performance API:
  - Add timing logs to duPairCoverage.ts, primePath.ts, etc.
  - Measure CSV parsing time, graph rendering time, calculation time
  - Log to browser console: "DU-pair calculation completed in 245ms"

- [ ] T086 [P] Implement memoization for reachability queries in src/lib/services/graphUtils.ts:
  - Cache reachability matrix: reachable[i][j] = can i reach j?
  - Invalidate cache when graph changes
  - Measure cache hit rate

- [ ] T087 [P] Optimize Cytoscape rendering in GraphViewer.svelte:
  - Use Cytoscape batch rendering for multiple updates
  - Lazy-load node labels for large graphs (show on hover)
  - Implement viewport culling (don't render off-screen nodes)

- [ ] T088 [P] Add Web Worker for long-running algorithms:
  - Move allPathsCoverage and mccCoverage calculations to worker thread
  - Prevent UI blocking on large graph computations
  - Show progress indicator: "Calculating paths... 45%"

- [ ] T089 Create performance regression test in tests/integration/performance.test.ts:
  - Import 100-node graph: should complete < 10s
  - Calculate all 6 metrics: should complete < 30s total
  - Fail test if regression detected

### Documentation & Quickstart Validation

- [ ] T090 Verify src/lib/services/ modules have JSDoc comments:
  - @param, @returns, @throws for all public functions
  - Algorithm description for complex functions (primePath, allPathsCoverage)
  - Example usage in comments

- [ ] T091 [P] Create CONTRIBUTING.md with developer guidelines:
  - How to add a new coverage metric
  - Testing patterns (TDD with Vitest)
  - Performance expectations
  - Code review checklist

- [ ] T092 [P] Validate quickstart.md walkthrough:
  - Follow every step from `npm install` to `npm run test`
  - Verify it works on clean machine (CI/CD pipeline test)

- [ ] T093 Create API documentation in docs/API.md:
  - Export formats (CSV, JSON, text) with examples
  - Graph import format specification (CSV columns, JSON schema)
  - Coverage result structure

### Testing & Coverage

- [ ] T094 [P] Ensure 80%+ test coverage: `npm run test:coverage`
  - Coverage report shows uncovered lines
  - Add tests for any branches < 80%
  - Focus on algorithm logic, not UI component branches

- [ ] T095 [P] Run all tests in CI/CD: `npm run test` (should run all tests)
  - No skipped or pending tests
  - All fixtures load correctly

- [ ] T096 Create tests/e2e/ directory for manual testing checklist:
  - Import 3 sample graphs (simple, medium, complex)
  - Calculate all 6 metrics on each
  - Export in all 3 formats
  - Verify results on paper (spot-check DU-pair calculations)

### Deployment

- [ ] T097 Configure GitHub Pages deployment:
  - Run `.github/workflows/deploy.yml` on push to main (from Phase 1)
  - Build output to docs/ or gh-pages branch
  - Verify site loads at `https://[org].github.io/graph-testing/`

- [ ] T098 [P] Create DEPLOYMENT.md with steps to publish new version
  - Merge PR to main → GitHub Actions builds → deployed automatically
  - Manual deploy: `npm run build` then `npm run publish`

- [ ] T099 Create .nojekyll file in public/ (tells GitHub Pages to serve static files as-is, no Jekyll processing)

- [ ] T100 Test deployed site:
  - Upload sample graph
  - Calculate coverage
  - Export report
  - Verify all features work in production

### Final Polish

- [ ] T101 [P] Accessibility review (a11y):
  - Tab navigation works through all controls
  - Color-blind safe: don't rely on color alone (use labels + icons)
  - Screen reader testing on components
  - ARIA labels on buttons, inputs

- [ ] T102 [P] UX Polish:
  - Keyboard shortcuts: ?/h for help
  - Undo/redo for graph modifications (if applicable)
  - Responsive design: works on tablet (640px+) and desktop
  - Loading indicators for all async operations

- [ ] T103 [P] Code cleanup:
  - Remove all `console.log()` debug statements (keep only errors)
  - Remove all `@ts-ignore` comments (do proper typing)
  - Run ESLint and fix all warnings: `npm run lint:fix`

- [ ] T104 Create CHANGELOG.md with feature summary:
  - Version 1.0.0 (2026-03-31)
  - 6 user stories implemented
  - 6 coverage metrics supported
  - Export functionality
  - GitHub Pages deployment

- [ ] T105 Final validation: run all checks
  - `npm run lint` (no errors)
  - `npm run test` (all pass)
  - `npm run test:coverage` (≥ 80%)
  - `npm run build` (no errors)
  - Manual spot-check of each user story

**Checkpoint**: `npm run build` produces production-ready output; site deploys successfully; all features tested

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └─> Phase 2 (Foundational) ← BLOCKER for all user stories
            ├─> Phase 3 (US1: Import & Visualize)
            │       └─> Phase 4 (US2: DU-Pair)
            │               └─> Phase 5 (US3: Prime Path)
            ├─> Phase 6 (US4: Additional Metrics) ← depends on Phase 2 or Phase 3
            ├─> Phase 7 (US5: Path Analysis) ← depends on Phase 3
            └─> Phase 8 (US6: Export) ← depends on metrics (Phase 4+)
                    
Phase 9 (Polish) ← all phases complete
```

### User Story Dependencies

All 6 user stories CAN START immediately after Phase 2 completion, but optimal order is:

1. **Phase 3 (US1)** - MUST complete first; everything visualizes graphs
2. **Phase 4 (US2)** & **Phase 5 (US3)** - Can overlap; both P1 priority
3. **Phase 6 (US4)** & **Phase 7 (US5)** - Can overlap; both P2 priority
4. **Phase 8 (US6)** - Can start after any metric phase; uses all results
5. **Phase 9** - Polish when all features ready

### Parallel Execution Examples

**Example 1: Minimum Viable Product (MVP)**
```bash
# Day 1-2: Setup + Foundational
T001-T031 (sequential)

# Day 3-4: Import & Visualize (critical path)
T032-T042 (US1 complete)

# Day 5-6: DU-Pair Coverage
T043-T051 (US2 complete)

# Day 7: Prime Path Coverage (can demo MVP with U1+U2)
T052-T060 (US3 complete)
```

**Example 2: Full Parallel (4-person team)**
```bash
# Person 1: Setup + Phase 2 (2-3 days)
T001-T031

# Then parallel (2-3 days each):
Person 2: Phase 3 (US1 Import & Visualize)
Person 3: Phase 4 (US2 DU-Pair)
Person 4: Phase 5 (US3 Prime Path)

# Then parallel (1-2 days each):
Person 2: Phase 6 (US4 Additional Metrics)
Person 3: Phase 7 (US5 Path Analysis)
Person 4: Phase 8 (US6 Export)

# Finally: Phase 9 (Polish) - 1 day, all team members
```

**Example 3: Sequential (1-person development)**
```bash
Day 1-2: Phase 1-2 (Setup + Foundation)
Day 3-4: Phase 3 (US1)
Day 5-6: Phase 4 (US2)
Day 7-8: Phase 5 (US3) ← Can demo MVP at end of Day 8
Day 9-10: Phase 6 (US4)
Day 11-12: Phase 7 (US5)
Day 13-14: Phase 8 (US6)
Day 15: Phase 9 (Polish)

Total: ~15 developer-days for complete feature
```

### Within-Phase Parallelism

All tasks marked `[P]` within a phase can run in parallel:

**Phase 1 Example (if 3 devs available)**:
- Dev 1: T002 (package.json + install)
- Dev 2: T004-T010 (tsconfig, vite.config, svelte.config, eslint, prettier, vitest)
- Dev 3: T011-T015 (workflows, public files, tests fixtures stubs)
- Then merge and verify: T001, T003, T012-T015 complete sequentially

---

## Success Criteria & Testing Strategy

### Definition of Done (Per Task)

Each task is DONE when:
1. ✅ Code written and passes linting (`npm run lint`)
2. ✅ Tests written first (TDD) + all pass (`npm run test`)
3. ✅ Code reviewed (pair programming or PR review)
4. ✅ Integrated with sketch of next phase where applicable

### Checkpoint Validation

After each phase, verify:
- **Phase 1**: `npm run dev` starts successfully; `npm run build` produces no errors
- **Phase 2**: `npm run test` passes all type checks; fixtures load; stores initialize
- **Phase 3**: Import CSV → visualization displays correctly; zoom/pan work
- **Phase 4**: Add DU-pair metric → calculate → show coverage percentage
- **Phase 5**: Add prime paths → enumerate correctly → calculate coverage
- **Phase 6**: Select each metric → verify correct coverage values
- **Phase 7**: Highlight test paths on graph; show coverage contribution
- **Phase 8**: Export in all 3 formats; verify file contains correct data
- **Phase 9**: Full end-to-end test; performance verified; 80%+ coverage; docs complete

### MVP Scope (End of Phase 5)

Minimum viable product = Users can:
1. ✅ Import a graph (US1)
2. ✅ See it visualized (US1)
3. ✅ Calculate DU-pair coverage (US2)
4. ✅ Calculate prime path coverage (US3)
5. ✅ View coverage percentages and results

**Total effort**: ~12 developer-days; ~10 hours/day = 120+ engineering hours
**Timeline**: 2-3 weeks with 1 developer, 1 week with 2 concurrent developers

---

## Notes & Assumptions

- All times are estimates; actual may vary based on developer experience
- Phase 2 is a one-time investment; all subsequent user stories leverage it
- Tests MUST be written before implementation (TDD - per project constitution)
- All marked [P] tasks can be done in parallel; those without [P] have ordering dependencies
- GitHub Pages deployment means static-only (no backend); all computation is browser-side
- Cytoscape.js handles visualization; don't build custom graph rendering
- Performance profiling should happen continuously, especially after Phase 6+
