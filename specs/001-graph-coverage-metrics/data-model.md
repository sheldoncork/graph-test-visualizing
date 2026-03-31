# Phase 1: Data Model & Entities

**Date**: 2026-03-31 | **Status**: Complete  
**Focus**: Define entities, relationships, validation rules, and state transitions for graph coverage tool.

---

## Core Entities

### Entity 1: Graph

**Purpose**: Represents the control flow structure for coverage analysis. Root aggregate containing all nodes and edges.

**Attributes**:
| Attribute | Type | Required | Constraints | Notes |
|-----------|------|----------|-------------|-------|
| `id` | string | Yes | Unique, alphanumeric | e.g., "graph-001", generated on import |
| `name` | string | No | Max 256 chars | e.g., "Control Flow Graph - Assignment 1" |
| `description` | string | No | Max 1024 chars | Educational context (course, topic, etc.) |
| `nodes` | Node[] | Yes | Non-empty | Ordered list of nodes in graph |
| `edges` | Edge[] | Yes | Empty allowed | Ordered list of edges; can be empty for single-node graphs |
| `nodeCount` | number | Yes | >= 1 | Computed property: len(nodes) |
| `edgeCount` | number | Yes | >= 0 | Computed property: len(edges) |
| `isAcyclic` | boolean | Yes | True/False | Computed property via cycle detection |
| `hasUnreachableNodes` | boolean | Yes | True/False | Computed property via reachability analysis |
| `importedAt` | ISO8601 | Yes | Timestamp | When graph was imported/created |
| `importFormat` | string | Yes | "csv" \| "json" \| "graphml" | Format of original import |

**Validation Rules**:
- All node IDs referenced in edges must exist in nodes array
- No duplicate node IDs
- No self-loops (edge from node to itself) unless explicitly intended
- At least one node must exist
- Graph must be connected or flag "hasUnreachableNodes = true"

**State Transitions**:
```
EMPTY → IMPORTING → IMPORTED → ANALYZED → RESULTS_READY
         ↑__________(error)_________↓
```

**Relationships**:
- Graph **contains many** Nodes
- Graph **contains many** Edges
- Graph **can have many** Coverage Results (one per metric calculated)

---

### Entity 2: Node

**Purpose**: Represent vertices in the graph. May be marked as definition, use, or regular node for coverage analysis.

**Attributes**:
| Attribute | Type | Required | Constraints | Notes |
|-----------|------|----------|-------------|-------|
| `id` | string | Yes | Unique within graph | e.g., "1", "A", "node_entry" |
| `label` | string | Yes | 1-100 chars | Display name; user-friendly |
| `type` | enum | Yes | "definition" \| "use" \| "regular" | Semantic role for DU-pair coverage |
| `isReachable` | boolean | Yes | True/False | Computed: reachable from entry node? |
| `isEntry` | boolean | Yes | True/False | Entry point? Typically one per graph |
| `isExit` | boolean | Yes | True/False | Exit point? May be multiple |
| `inDegree` | number | Yes | >= 0 | Computed: count incoming edges |
| `outDegree` | number | Yes | >= 0 | Computed: count outgoing edges |

**Validation Rules**:
- Node ID must be non-empty, alphanumeric with underscores/hyphens allowed
- Label must not be empty
- Type must be one of the three enum values
- Exactly one entry node per graph (or flag as error)
- At least one exit node per graph

**Relationships**:
- Node **belongs to** Graph
- Node **may have many** incoming Edges
- Node **may have many** outgoing Edges
- Node **appears in many** Test Paths

---

### Entity 3: Edge

**Purpose**: Represent directed connections between nodes. Carries control flow semantics.

**Attributes**:
| Attribute | Type | Required | Constraints | Notes |
|-----------|------|----------|-------------|-------|
| `id` | string | Yes | Unique within graph | e.g., "edge_A_B", generated as "source→target" |
| `source` | string (Node.id) | Yes | Valid node ID | Reference to source node |
| `target` | string (Node.id) | Yes | Valid node ID | Reference to target node |
| `label` | string | No | 1-100 chars | Optional edge annotation (e.g., "true branch", "loop back") |
| `weight` | number | No | >= 0 | Optional; default = 1 | For weighted paths (not used in MVP) |
| `isBackEdge` | boolean | Yes | True/False | Computed: part of cycle? |
| `isCritical` | boolean | No | True/False | Optional flag: important for coverage? |

**Validation Rules**:
- Source and target must exist as node IDs in graph
- Source ≠ target (no self-loops unless explicitly marked)
- No duplicate edges (source, target) pairs
- Back edges marked based on DFS traversal order

**Relationships**:
- Edge **connects** two Nodes (source and target)
- Edge **belongs to** Graph
- Edge **appears in many** Test Paths

---

### Entity 4: Coverage Metric

**Purpose**: Define what coverage criterion to measure and parameters for calculation.

**Attributes**:
| Attribute | Type | Required | Constraints | Notes |
|-----------|------|----------|-------------|-------|
| `id` | string | Yes | Unique | e.g., "metric-du-pair" |
| `name` | string | Yes | Max 50 chars | e.g., "DU-Pair Coverage" |
| `type` | enum | Yes | "du-pair" \| "prime-path" \| "node" \| "edge" \| "all-paths" \| "mcc-paths" | Metric classification |
| `description` | string | No | Max 500 chars | Educational explanation |
| `parameters` | object | No | Varies per type | e.g., {maxPathLength: 20} for prime path |
| `createdAt` | ISO8601 | Yes | Timestamp | When metric definition created |

**Metric-Specific Parameters**:
```typescript
// DU-Pair Coverage
{ maxPairs: 10000 }

// Prime Path Coverage
{ maxPathLength: 20, enableMemoization: true }

// All-Paths Coverage
{ maxPaths: 50000, timeoutMs: 10000 }

// McCabe Cyclomatic Complexity Paths
{ useIndependentPaths: true }
```

**Relationships**:
- Metric **produces** Coverage Result

---

### Entity 5: Coverage Result

**Purpose**: Store output of applying a metric to a specific graph with test paths.

**Attributes**:
| Attribute | Type | Required | Constraints | Notes |
|-----------|------|----------|-------------|-------|
| `id` | string | Yes | Unique | UUID or timestamp-based |
| `graphId` | string (Graph.id) | Yes | Valid graph ID | Reference to analyzed graph |
| `metricType` | enum | Yes | Same as Metric.type | Which metric was calculated |
| `totalCount` | number | Yes | >= 0 | Total items (pairs, paths, nodes, edges) |
| `coveredCount` | number | Yes | >= 0, <= totalCount | Items covered by test paths |
| `coveragePercentage` | number | Yes | 0-100, 1 decimal place | e.g., 87.5 |
| `uncoveredItems` | string[] | No | IDs/descriptions | Which items not covered (for drill-down) |
| `coveredItems` | string[] | No | IDs/descriptions | Which items covered (for drill-down) |
| `details` | object | No | Varies per metric | Detailed analysis (prime paths list, etc.) |
| `calculatedAt` | ISO8601 | Yes | Timestamp | When result computed |
| `parametersUsed` | object | Yes | Copy of Metric.parameters | For reproducibility |
| `errorOccurred` | boolean | Yes | True/False | Was there an error? |
| `errorMessage` | string | No | Max 500 chars | Error details if errorOccurred = true |

**Computation Rules**:
```
coveragePercentage = (coveredCount / totalCount) * 100
  → rounded to 1 decimal place
  → handle division by zero (0% if no items)
```

**Relationships**:
- Result **describes coverage of** Graph
- Result **measures** Metric
- Result **compares against** Test Paths

---

### Entity 6: Test Path

**Purpose**: Represent a single test case as a sequence of nodes (or edges) through the graph.

**Attributes**:
| Attribute | Type | Required | Constraints | Notes |
|-----------|------|----------|-------------|-------|
| `id` | string | Yes | Unique | e.g., "test-1", "test-case-A" |
| `graphId` | string (Graph.id) | Yes | Valid graph ID | Which graph does this apply to? |
| `sequence` | string[] | Yes | Non-empty | Node IDs in order: [n1, n2, n3, ...] |
| `label` | string | No | Max 100 chars | Human description: "Test case: handle error" |
| `isFeasible` | boolean | Yes | True/False | Can this path be executed? |
| `feasibilityReason` | string | No | Max 200 chars | Why feasible or not (computed) |
| `edgesTraversed` | Edge[] | No | Computed | Which edges are used in this path |
| `isCovered` | boolean | No | True/False | Marked after coverage calculation |
| `contributesTo` | string[] | No | List of covered items | Which DU-pairs, prime paths, nodes, edges? |
| `addedAt` | ISO8601 | Yes | Timestamp | When user added test path |

**Validation Rules**:
- All node IDs in sequence must exist in graph
- Consecutive nodes (seq[i], seq[i+1]) must have an edge in graph
- Entry node should be first in sequence (or flag as invalid)
- Exit node should be last in sequence (or flag as warning)
- No empty sequences
- No duplicate paths

**Feasibility Computation**:
```
path is FEASIBLE if:
  1. All consecutive edges exist in graph, AND
  2. No node is unreachable from entry, AND
  3. Path can reach exit node or is valid subpath
```

**Relationships**:
- Test Path **applies to** Graph
- Test Path **contributes to** Coverage Results (many metrics can evaluate same path)

---

## Data Relationships Diagram

```
Graph (1) ──┬─→ (many) Node
            └─→ (many) Edge
            └─→ (many) Coverage Result
            └─→ (many) Test Path

Node (1) ──→ (many) Edge (source)
Node (1) ──→ (many) Edge (target)

Coverage Metric (1) ──→ (many) Coverage Result

Test Path (many) ──→ (1) Coverage Result
```

---

## Validation Rules (by Entity)

| Entity | Rule | Severity | Error Message |
|--------|------|----------|---------------|
| Graph | At least 1 node | ERROR | "Graph must have at least one node" |
| Graph | All edges reference valid nodes | ERROR | "Edge uses undefined node: {nodeId}" |
| Graph | No duplicate node IDs | ERROR | "Duplicate node ID: {id}" |
| Node | ID non-empty, alphanumeric | ERROR | "Invalid node ID format; use alphanumerics, underscores, hyphens" |
| Node | Label non-empty | ERROR | "Node must have a label" |
| Node | Type is valid enum | ERROR | "Node type must be 'definition', 'use', or 'regular'" |
| Edge | Source and target exist | ERROR | "Edge references non-existent node" |
| Edge | No self-loops | WARNING | "Self-loop detected at node {id}; ensure intentional" |
| Edge | No duplicate edges | ERROR | "Duplicate edge: {source}→{target}" |
| Test Path | All nodes exist | ERROR | "Test path references undefined node: {id}" |
| Test Path | Consecutive edges exist | ERROR | "No edge between {nodeA}→{nodeB}; path invalid" |
| Test Path | Non-empty sequence | ERROR | "Test path cannot be empty" |
| Coverage Result | coveragePercentage 0-100 | ERROR | "Coverage percentage out of range" |
| Coverage Result | coveredCount ≤ totalCount | ERROR | "Covered count exceeds total count" |

---

## State Diagrams

### Graph Lifecycle
```
┌─────────────┐
│   EMPTY     │ (initial state)
└──────┬──────┘
       │ import
       ▼
┌─────────────────┐
│   IMPORTING     │ (parsing file)
└───┬──────────┬──┘
    │ success   │ error
    ▼           ▼
┌─────────┐  ERROR
│IMPORTED │
└────┬────┘
     │ analyze (select metric + test paths)
     ▼
 ┌──────────────┐
 │   ANALYZED   │
 └────┬─────────┘
      │ calculate
      ▼
 ┌────────────────┐
 │RESULTS_READY   │
 └─────────────────┘
```

### Test Path Feasibility State
```
┌──────────────┐
│  SUBMITTED   │ (user enters path)
└──────┬───────┘
       │ validate
       ├─────────────────┐
       ▼                 ▼
  ┌─────────┐      ┌──────────┐
  │FEASIBLE │      │INFEASIBLE│
  └─────────┘      └──────────┘
       │                 │
       │                 └─→ (show error reason)
       │
       └─→ (available for coverage calculation)
```

---

## Summary: Entities Ready for Implementation

✅ **Graph** — Root aggregate, contains nodes/edges, computed properties for cycle/reachability analysis  
✅ **Node** — Vertices with semantic roles; entry/exit/definition/use types  
✅ **Edge** — Directed connections; marked as back edges if cyclic  
✅ **Coverage Metric** — Specification of what to measure with parameters  
✅ **Coverage Result** — Output of metric calculation; includes coverage %, details  
✅ **Test Path** — Validated sequences of nodes; feasibility determined automatically  

**Validation**: All entities have clear rules; implementation can use validators in services layer.

**Ready for**: Contract definition and UI component mapping.
