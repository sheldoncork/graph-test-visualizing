# Contract: Coverage Output Format

**Date**: 2026-03-31 | **Version**: 1.0.0  
**Scope**: Defines structure of coverage calculation results. All metric algorithms produce output conforming to this contract.

---

## Coverage Result Object (TypeScript Interface)

```typescript
interface CoverageResult {
  id: string;                          // Unique result ID (UUID or timestamp)
  graphId: string;                     // Reference to analyzed graph
  metricType: MetricType;              // "du-pair" | "prime-path" | "node" | "edge" | "all-paths" | "mcc-paths"
  metricLabel: string;                 // Human readable: "DU-Pair Coverage"
  
  // Core metrics
  totalCount: number;                  // Total items (pairs, paths, nodes, edges)
  coveredCount: number;                // How many items covered by test paths
  coveragePercentage: number;          // (coveredCount / totalCount) * 100, 1 decimal place
  uncoveredCount: number;              // totalCount - coveredCount (computed)
  uncoveredPercentage: number;         // 100 - coveragePercentage (computed)
  
  // Detailed results (format varies by metric type)
  details: MetricDetails;
  
  // Metadata
  testPathsUsed: string[];             // IDs of test paths evaluated
  testPathCount: number;               // How many test paths analyzed
  parametersUsed: Record<string, any>; // Algorithm parameters (e.g., maxPathLength: 20)
  calculatedAt: string;                // ISO 8601 timestamp
  computeTimeMs: number;               // Milliseconds to calculate
  
  // Error handling
  errorOccurred: boolean;              // Did calculation fail?
  errorMessage?: string;               // Error details if errorOccurred = true
  warnings?: string[];                 // Non-fatal issues (e.g., "path limit reached")
}
```

---

## Metric-Specific Details

### DU-Pair Coverage Details

```typescript
interface DUPairDetails extends MetricDetails {
  type: "du-pair";
  pairs: {
    id: string;                        // e.g., "pair_1_2"
    defNode: string;                   // Definition node ID
    useNode: string;                   // Use node ID
    isCovered: boolean;                // Covered by any test path?
    coveringPath?: string;             // ID of test path(s) covering this pair
    isReachable: boolean;              // Can use reach def via CFG?
    isFeasible: boolean;               // Pair is feasible in practice?
  }[];
  
  feasibleCount: number;               // How many pairs are theoretically feasible?
  infeasibleCount: number;             // How many pairs are infeasible?
  reachableCount: number;              // How many uses reachable from defs?
}
```

**Example Output**:
```json
{
  "type": "du-pair",
  "pairs": [
    {
      "id": "pair_1",
      "defNode": "A",
      "useNode": "C",
      "isCovered": true,
      "coveringPath": "test-1",
      "isReachable": true,
      "isFeasible": true
    },
    {
      "id": "pair_2",
      "defNode": "B",
      "useNode": "D",
      "isCovered": false,
      "isReachable": false,
      "isFeasible": false
    }
  ],
  "feasibleCount": 4,
  "infeasibleCount": 1,
  "reachableCount": 5
}
```

---

### Prime Path Coverage Details

```typescript
interface PrimePathDetails extends MetricDetails {
  type: "prime-path";
  paths: {
    id: string;                        // e.g., "prime_path_1"
    sequence: string[];                // Node IDs in path [A, B, C, D]
    length: number;                    // Number of edges
    isCovered: boolean;                // Covered by any test path?
    coveringPath?: string;             // ID of test path(s) covering this path
    isSimple: boolean;                 // No repeated nodes?
    isFeasible: boolean;               // Path is executable?
  }[];
  
  primePaths: number;                  // Total prime paths enumerated
  limit: number;                       // Max path length used (e.g., 20)
  limitReached: boolean;               // Did search hit max path length limit?
  truncatedMessage?: string;           // "Search limited to paths ≤ 20 edges"
}
```

**Example Output**:
```json
{
  "type": "prime-path",
  "paths": [
    {
      "id": "prime_1",
      "sequence": ["entry", "A", "B", "exit"],
      "length": 3,
      "isCovered": true,
      "coveringPath": "test-2",
      "isSimple": true,
      "isFeasible": true
    }
  ],
  "primePaths": 8,
  "limit": 20,
  "limitReached": false
}
```

---

### Node Coverage Details

```typescript
interface NodeCoverageDetails extends MetricDetails {
  type: "node";
  nodesCovered: {
    id: string;                        // Node ID
    label: string;                     // Node label
    isCovered: boolean;
    coveringPath?: string;             // Which test path covers this node?
    isReachable: boolean;              // Is node reachable from entry?
    isRequired: boolean;               // Must pass (e.g., exit node)
  }[];
  
  reachableCount: number;              // How many nodes are reachable?
  requiredCount: number;               // How many are "must-cover"?
}
```

---

### Edge Coverage Details

```typescript
interface EdgeCoverageDetails extends MetricDetails {
  type: "edge";
  edgesCovered: {
    id: string;                        // Edge ID (source→target)
    source: string;
    target: string;
    label?: string;
    isCovered: boolean;
    coveringPath?: string;
    isBackEdge: boolean;               // Part of cycle?
    isRequired: boolean;               // Must traverse
  }[];
  
  reachableCount: number;              // How many edges are reachable?
  requiredCount: number;
}
```

---

### All-Paths Coverage Details

```typescript
interface AllPathsDetails extends MetricDetails {
  type: "all-paths";
  totalPaths: number;                  // Total feasible paths (may be infinite)
  enumeratedPaths: number;             // How many actually enumerated
  limitApplied: number;                // Search limited to N paths
  samplePaths: Array<{
    id: string;
    sequence: string[];
    isCovered: boolean;
    coveringPath?: string;
  }>;
  
  infiniteLoopsDetected: boolean;      // Cycles detected?
  message: string;                     // "Showing 100 path samples (limited to prevent infinite enumeration)"
}
```

---

### McCabe Cyclomatic Complexity Paths Details

```typescript
interface MCCPathsDetails extends MetricDetails {
  type: "mcc-paths";
  cyclomaticComplexity: number;        // M = e - n + 2p
  independentPathCount: number;        // Number of linearly independent paths
  independentPaths: Array<{
    id: string;
    sequence: string[];
    isCovered: boolean;
    coveringPath?: string;
    basis: boolean;                    // Is this a basis path?
  }>;
  
  pathCombinations: number;            // Total combinations of independent paths
}
```

---

## Export Formats

### JSON Export

```
graph-coverage-{timestamp}.json
```

Direct serialization of CoverageResult objects. Example:
```json
{
  "id": "result-20260331-1",
  "graphId": "graph-001",
  "metricType": "du-pair",
  "metricLabel": "DU-Pair Coverage",
  "totalCount": 6,
  "coveredCount": 5,
  "coveragePercentage": 83.3,
  "uncoveredCount": 1,
  "uncoveredPercentage": 16.7,
  "details": { ... },
  "testPathsUsed": ["test-1", "test-2"],
  "testPathCount": 2,
  "calculatedAt": "2026-03-31T14:30:00Z",
  "computeTimeMs": 42,
  "errorOccurred": false
}
```

### CSV Export

```
graph-coverage-{timestamp}.csv
```

Tabular format; one row per covered/uncovered item:
```
Metric,Item,Label,Status,CoveredBy
DU-Pair,pair_1,A→C def-use,Covered,test-1
DU-Pair,pair_2,B→D def-use,Uncovered,
Prime-Path,prime_1,entry→A→B→exit,Covered,test-2
Prime-Path,prime_2,A→C→exit,Uncovered,
```

### Text Report Export

```
graph-coverage-{timestamp}.txt
```

Human-readable summary:
```
═══════════════════════════════════════════════════════════
Graph Coverage Analysis Report
═══════════════════════════════════════════════════════════

Graph: control-flow-graph-001
Nodes: 6 | Edges: 8
Acyclic: No | Unreachable nodes: 0

Metric: DU-Pair Coverage
─────────────────────────
Total Pairs: 6
Covered: 5 (83.3%)
Uncovered: 1 (16.7%)

[Details of each pair...]

Test Paths Analyzed: 2
  - test-1: 4-node path
  - test-2: 3-node path

Calculation Time: 42 ms
Generated: 2026-03-31 14:30:00 UTC
```

---

## Validation Contract for Results

All metric calculators must ensure:

```typescript
interface ResultValidation {
  // Invariants
  coveredCount <= totalCount: boolean;
  coveragePercentage >= 0 && <= 100: boolean;
  uncoveredCount === (totalCount - coveredCount): boolean;
  
  // Consistency
  computeTimeMs >= 0: boolean;
  calculatedAt is valid ISO 8601: boolean;
  testPathsUsed all exist in graph: boolean;
  
  // Completeness
  details is not empty: boolean;
  parametersUsed matches algorithm: boolean;
}
```

If any invariant fails → `errorOccurred = true` and provide error message.

---

## Error Handling

```typescript
interface ErrorResult extends CoverageResult {
  errorOccurred: true;
  errorMessage: string;           // e.g., "Prime path enumeration exceeded 10-second timeout"
  details: { error: string };     // Minimal details
}
```

**Common Errors**:
- "Graph is cyclic; cannot enumerate all paths" (all-paths metric)
- "Prime path enumeration exceeded maximum path length limit (20 edges)"
- "Timeout: coverage calculation exceeded 10 seconds"
- "Duplicate test path ID; ambiguous coverage attribution"
- "Test path contains invalid node sequence"

---

## Summary

✅ Unified CoverageResult interface for all metrics  
✅ Metric-specific details for drill-down analysis  
✅ Multiple export formats (JSON, CSV, text report)  
✅ Validation invariants ensure data consistency  
✅ Error handling with actionable messages  
