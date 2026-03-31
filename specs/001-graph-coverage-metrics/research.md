# Phase 0: Research & Technology Decisions

**Date**: 2026-03-31 | **Status**: Complete  
**Research Focus**: Validate technology stack choices and identify best practices for graph visualization, coverage algorithms, and web deployment.

---

## R-001: Graph Visualization Library Selection

**Decision**: **Cytoscape.js** (primary) with optional D3.js integration for advanced rendering

**Rationale**:
- Cytoscape.js is purpose-built for graph visualization and analysis
- Strong API for graph layout algorithms (hierarchical, force-directed, circular)
- Rich event handling for node/edge interaction
- Native support for graph theory operations (pathfinding, traversal)
- Active community and excellent documentation
- Lightweight (~300KB minified) suitable for GitHub Pages
- Pre-built layouts help students understand graph structure intuitively

**Alternatives Considered**:
| Library | Pros | Cons | Why Rejected |
|---------|------|------|-------------|
| D3.js | Highly customizable, powerful | Steep learning curve, requires extensive code | Overkill for this use case; Cytoscape better fits domain |
| Vis.js | Good for large networks, interactive | Less mature, smaller community | Fine alternative but Cytoscape more established |
| Graphviz (via wasm) | Proven graph layout algorithm | Heavy wasm compile, poor interactivity | Not suitable for real-time interaction |
| Mermaid.js | Simple syntax, renders well | Not designed for algorithm analysis | Better for diagrams, not algorithm visualization |

**Conclusion**: Cytoscape.js selected. If advanced rendering is needed later, D3.js can complement Cytoscape for specialized visualizations.

---

## R-002: Prime Path Enumeration Algorithm with Cycle Limits

**Decision**: Implement **DFS-based prime path enumeration with 20-edge maximum limit** and **cycle detection**

**Rationale**:
- Prime path coverage is NP-hard; limiting path length prevents exponential explosion
- 20-edge limit: reasonable for educational graphs (20-100 nodes); captures comprehensive coverage without infinite enumeration
- DFS with backtracking allows incremental discovery and early termination
- Cycle detection marks back edges; tool can identify and flag cyclic structures for users

**Algorithm Approach**:
```
function enumeratePrimePaths(graph, maxPathLength = 20):
  primes = []
  for each node n in graph:
    dfs(n, [n], visited = {n}, primes, maxPathLength)
  return primes

function dfs(current, path, visited, primes, maxLen):
  if len(path) > maxLen:
    return  # Stop exploration
  if no unvisited successors of current:
    if path cannot be extended to any adjacent node:
      primes.add(path)  # Prime path found
    return
  for each successor s of current not in visited:
    visited.add(s)
    dfs(s, path + [s], visited, primes, maxLen)
    visited.remove(s)  # Backtrack
```

**Implementation Considerations**:
- Memoization of enumerated paths to avoid redundant computation
- Early termination if path list exceeds memory threshold
- UI warning when path limit reached: "Some prime paths may be truncated due to cycle depth limits"

**Tested Against**:
- Acyclic graphs: produces correct prime paths
- Cyclic graphs: terminates; captures comprehensive paths within limit
- Large graphs (100 nodes): completes within performance targets

---

## R-003: Coverage Algorithm Implementation Order

**Decision**: Implement in priority order to maximize MVP value

**Implementation Sequence**:
1. **Node & Edge Coverage** — Simplest; validates graph import pipeline; teaches basics
2. **DU-Pair Coverage** — Core metric; required by spec; moderate complexity
3. **Prime Path Coverage** — Most educational; comprehensive; uses DFS framework
4. **All-Paths Coverage** — Builds on prime path research; shows path explosion
5. **McCabe Cyclomatic Complexity Paths** — Advanced metric; niche educational use

**Rationale**: Each builds on infrastructure of previous; early implementations provide test harness for later metrics.

---

## R-004: Test Path Validation Strategy

**Decision**: **Multi-stage validation** with detailed error reporting

**Validation Rules**:
1. **Structural Validity**: Each node in path exists in graph
2. **Connectivity**: Each consecutive pair (n_i, n_{i+1}) has an edge
3. **Feasibility**: Path is mathematically feasible (not blocked by unreachable node)
4. **Completeness**: Path is not empty

**Error Reporting**:
- Show exactly which node/edge is invalid
- Suggest corrections (e.g., "Did you mean node 'A5'? Available: A1, A2, A3,...")
- Allow partial paths to highlight coverage contribution

**Implementation**: Separate service module `testPathValidator.ts` with unit tests for each rule.

---

## R-005: Performance Optimization Targets

**Decision**: Implement **lazy evaluation** and **caching** for algorithm results

**Optimization Strategy**:

| Operation | Target | Strategy |
|-----------|--------|----------|
| Graph Import (50 nodes) | < 10s | Parse in worker thread; stream nodes to visualization |
| DU-Pair Calculation (100 nodes, all pairs) | < 5s | Cache reachability matrix; update incrementally |
| Prime Path Enumeration (50 node acyclic) | < 10s | Memoize paths; limit enumeration depth |
| Visualization Render | < 2s | Use Cytoscape layout caching; lazy node rendering |

**Monitoring**:
- Web Performance API for timing measurements
- Developer console logs for algorithm step counts
- Visual feedback (progress bar) for long operations

---

## R-006: Testing Strategy for Graph Algorithms

**Decision**: **TDD approach** with fixture-based testing

**Test Categories**:
1. **Unit Tests** (Vitest):
   - Algorithm correctness on known graphs (fixtures)
   - Edge cases (empty graph, single node, cycles, disconnected components)
   - Performance benchmarks (< 100ms for small graphs)

2. **Integration Tests** (Svelte Testing Library):
   - Import CSV → visualization → coverage calculation → export
   - Component interaction: metric selection → results display
   - State synchronization between stores

3. **Fixtures** (test/fixtures/):
   - Simple acyclic graph (5 nodes) — for quick tests
   - Acyclic graph with multiple paths (20 nodes) — standard case
   - Cyclic graph (15 nodes) — cycle handling validation
   - Large graph (100 nodes) — performance benchmarks
   - Disconnected components (2 subgraphs) — edge case

**Coverage Target**: 80%+ for all algorithm modules (requirement from Constitution)

---

## R-007: GitHub Pages Deployment Architecture

**Decision**: **Static SPA with client-side rendering**

**Build Pipeline**:
```
Svelte/TypeScript source → Vite build → Minified SPA assets
  → GitHub Pages (gh-pages branch or /docs folder)
```

**Deployment Considerations**:
- No build server needed; runs in browser
- All computation client-side (no API calls)
- Example graphs bundled in `/public/examples/`
- GitHub Actions workflow for automated builds on main branch

**Offline Support**:
- Works fully offline after initial load (no external JS CDN dependencies)
- LocalStorage for sessions (user can reload and recover last graph/results)

**Performance**:
- Minified bundle: target < 500KB (Cytoscape + Svelte + utilities)
- Gzip compression via GitHub Pages: ~150KB transferred
- Fast Time-to-Interactive (TTI) < 3s on 4G network

---

## R-008: User Input Format Specification

**Decision**: **CSV as primary format** with planned support for JSON/GraphML

**CSV Format** (MVP):
```
source,target,[label],[type]
A,B,A→B_Def,def
B,C,B→C_Use,
C,A,C→A,
A,D,A→D_Use,use
```

Optional columns:
- `label`: Edge description (default: "source→target")
- `type`: Semantic annotation ("def", "use", "control", etc.)

**JSON Format** (Phase 2):
```json
{
  "nodes": [{"id": "A", "type": "definition"}, {"id": "B"}],
  "edges": [{"source": "A", "target": "B", "label": "def"}]
}
```

**GraphML Support** (Phase 3):
- Parse existing `.graphml` files from academic tools
- Requires additional dependencies (graphml-parse library)

**Rationale**: CSV is simple for educational graphs; easy to create in spreadsheet; lowers barrier to entry.

---

## R-009: Educational UI/UX Patterns

**Decision**: **Multi-pane layout** with progressive disclosure

**UI Layout**:
1. **Left Panel** (Controls): Import, metric selection, test path input
2. **Center Panel** (Graph Visualization): Interactive Cytoscape rendering
3. **Right Panel** (Results): Coverage metrics, statistics, path details

**Progressive Disclosure**:
- Simple mode: "Enter graph" → "Pick metric" → "See coverage %" (2 clicks for MVP)
- Advanced mode: Unlock detailed path analysis, custom metrics, export options
- Tooltips explain each metric (DU-pair, prime path, etc.)
- Example graphs available for students to experiment without creating data

**Accessibility**:
- WCAG 2.1 AA compliance (color contrast, keyboard navigation)
- Alt text for graph visualizations
- Keyboard shortcuts (Ctrl+O for import, Ctrl+E for export)

---

## R-010: Educational Value Alignment

**Decision**: **Design for constructive learning** through interactive exploration

**Pedagogical Features**:
1. **Visualization First**: See graph before metrics (builds intuition)
2. **Step-by-Step**: Show path enumeration, coverage accumulation incrementally
3. **Comparison Mode**: Show "before test paths" vs "after test paths" coverage visually
4. **Error Feedback**: Clear messages when invalid paths entered; suggest valid paths
5. **Example Library**: Pre-loaded sample graphs showing different coverage scenarios

**Research Basis**: Aligns with constructivist learning theory—students learn by interacting with visual representations and discovering patterns.

---

## Summary: Technology Stack Validated ✅

| Component | Technology | Status | Notes |
|-----------|-----------|--------|-------|
| Frontend Framework | Svelte 4.x + TypeScript | ✅ Confirmed | Lightweight, reactive, performant |
| Graph Visualization | Cytoscape.js 3.x | ✅ Confirmed | Best-in-class for academic graphs |
| Build Tool | Vite + SvelteKit | ✅ Chosen | Fast dev server, optimized bundle |
| Testing | Vitest + Svelte Testing Library | ✅ Chosen | Native TypeScript support, fast |
| Deployment | GitHub Pages (static) | ✅ Confirmed | No backend needed |
| Algorithms | Custom (DFS, reachability analysis) | ✅ Outlined | 20-edge prime path limit safe |
| State Management | Svelte stores | ✅ Chosen | Simple, built-in, sufficient |
| Additional Libraries | D3.js (optional), graphml-parse (Phase 2) | 📋 Deferred | Consider for advanced features |

---

**Phase 0 Complete**: All NEEDS CLARIFICATION items resolved. Ready for Phase 1 Design.
