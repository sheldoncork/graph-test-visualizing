# Feature Specification: Graph Coverage Metrics Tool

**Feature Branch**: `001-graph-coverage-metrics`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: Educational graph testing tool for visual analysis and coverage metric calculation (du-pair coverage, prime path coverage, and additional metrics)

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Import and Visualize Graph (Priority: P1)

Students and instructors need to see graph structures visually to understand their topology before analyzing coverage. This is the foundation—without visualization, coverage metrics are abstract and meaningless in an educational context.

**Why this priority**: Fundamental capability. All other features depend on users being able to see the graph. Educational value comes from visual representation of control flow.

**Independent Test**: Can demonstrate the tool by importing a simple graph file (CSV with node/edge pairs) and visually displaying nodes and edges on screen. Delivers standalone value: "I can see my graph."

**Acceptance Scenarios**:

1. **Given** a graph definition file (CSV with node/edge pairs), **When** user imports the file, **Then** the tool displays all nodes and edges visually with clear node labels and edge connections
2. **Given** an imported graph, **When** user interacts with the visualization, **Then** nodes and edges are clearly distinguishable (different colors, sizes, or styling)
3. **Given** a large graph (50+ nodes), **When** displayed, **Then** visualization remains readable and users can pan/zoom to explore

---

### User Story 2 - Calculate DU-Pair Coverage (Priority: P1)

Instructors need to compute def-use pair coverage as a key metric for teaching program dependence analysis. DU-pair coverage is a fundamental concept in graph-based testing.

**Why this priority**: Critical educational metric explicitly requested. Necessary for core teaching objective.

**Independent Test**: Can be tested independently by selecting "DU-pair coverage" from a metrics menu and receiving a coverage report. Delivers standalone value: "I know how many definition-use relationships are covered."

**Acceptance Scenarios**:

1. **Given** a graph with clearly marked definition and use nodes, **When** user selects "DU-pair coverage" metric, **Then** tool identifies all (def, use) pairs where the use is reachable from the def
2. **Given** DU-pair analysis, **When** coverage is calculated, **Then** result shows number of feasible DU-pairs and number covered by test paths
3. **Given** a DU-pair coverage report, **When** user reviews results, **Then** coverage percentage is clearly displayed (e.g., "28 of 35 DU-pairs covered = 80%")

---

### User Story 3 - Calculate Prime Path Coverage (Priority: P1)

Students need to understand prime path coverage, a comprehensive metric that requires identifying all prime paths and determining feasible test paths to cover them.

**Why this priority**: Critical educational metric explicitly requested. Teaches advanced control flow analysis.

**Independent Test**: Can be tested independently by selecting "Prime path coverage" metric and receiving prime path enumeration and coverage analysis. Delivers standalone value: "I know which prime paths exist and which are covered."

**Acceptance Scenarios**:

1. **Given** a graph, **When** user selects "Prime path coverage" metric, **Then** tool identifies and enumerates all prime paths (maximal subpaths that cannot be extended)
2. **Given** a list of test paths, **When** coverage is calculated, **Then** tool determines how many prime paths are covered
3. **Given** prime path results, **When** user reviews the report, **Then** tool shows detailed prime path list with coverage status (covered/uncovered)

---

### User Story 4 - Calculate Additional Coverage Metrics (Priority: P2)

Different educational contexts need different metrics (node coverage, edge coverage, loop coverage, etc.). Teachers should be able to select among additional standard coverage types.

**Why this priority**: Extends educational scope. Allows use in various curricula. Medium priority because core tool works with DU-pair and prime path alone.

**Independent Test**: Can select alternate metric (e.g., "Node coverage") and calculate independently. Each metric delivers its own value without depending on others.

**Acceptance Scenarios**:

1. **Given** visualization of a graph, **When** user selects an available coverage metric from a menu, **Then** tool displays list of supported metrics with descriptions
2. **Given** a selected metric, **When** coverage is calculated, **Then** results are presented in consistent format with percentage and detailed breakdown
3. **Given** multiple different metrics, **When** calculated on same graph, **Then** results are independently valid (changing one metric doesn't affect another)

---

### User Story 5 - Analyze and Compare Test Paths (Priority: P2)

Students learn best when they can see specific paths and understand which contribute to coverage. Path visualization helps tie abstract metrics to concrete graph elements.

**Why this priority**: Enhances educational value by connecting metrics to visual representation. Medium priority because metrics can be understood without this visualization.

**Independent Test**: Can upload test paths and see which graph edges/nodes they traverse and how they contribute to coverage.

**Acceptance Scenarios**:

1. **Given** test paths defined by user (as sequences of nodes), **When** paths are loaded, **Then** tool highlights the corresponding path sequences in graph visualization
2. **Given** a coverage metric calculated, **When** user selects a test path, **Then** tool shows which coverage elements (DU-pairs, prime paths, nodes, edges) this path contributes to
3. **Given** multiple test paths, **When** displayed together, **Then** tool shows cumulative coverage and individual path contributions

---

### User Story 6 - Export Coverage Reports (Priority: P3)

Teachers need to document and share coverage analysis results with students. Exportable reports support assessment and learning.

**Why this priority**: Nice-to-have for distribution and documentation. Tool remains functional without this feature.

**Independent Test**: Can generate and export report in standard format (PDF, CSV, JSON, HTML).

**Acceptance Scenarios**:

1. **Given** completed coverage analysis, **When** user requests export, **Then** tool generates report with graph description, metrics calculated, and results
2. **Given** generated report, **When** exported, **Then** file is available in selected format and contains all relevant data

### Edge Cases

- What happens when a graph has unreachable nodes (dead code)? Should the tool flag them or exclude them from certain metrics?
- How does the tool handle cycles in the graph? Should prime path calculation have limits to prevent infinite enumeration?
- What if a test path references a node or edge that doesn't exist in the graph? Should the tool validate and report errors?
- How should the tool handle disconnected components (multiple separate subgraphs)?
- What if no test paths are provided? Should the tool show 0% coverage or indicate that test paths are required for analysis?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept graph definitions in at least one standard format (CSV, text matrix, or GraphML) with clear specification of nodes and edges
- **FR-002**: System MUST render the graph visually with clearly labeled nodes and visible edges
- **FR-003**: System MUST calculate DU-pair coverage given a set of definition nodes, use nodes, and test paths through the graph
- **FR-004**: System MUST calculate prime path coverage by enumerating all prime paths and determining which are covered by test paths
- **FR-005**: System MUST support at least node coverage, edge coverage, all-paths coverage, and linearly independent paths (McCabe cyclomatic complexity-based paths) as additional metrics beyond DU-pair and prime path coverage
- **FR-006**: System MUST validate test paths against graph structure and report invalid paths
- **FR-007**: System MUST display coverage results as percentages and detailed breakdowns (number covered vs. total)
- **FR-008**: System MUST handle cycles in graphs by limiting prime path search to paths with maximum length of 20 edges to prevent infinite enumeration while maintaining comprehensive coverage analysis
- **FR-009**: System MUST identify and distinguish unreachable nodes/edges in the graph
- **FR-010**: System MUST provide clear error messages when input data is incomplete or malformed
- **FR-011**: System MUST support test paths provided in clear format (node sequences or edge sequences)
- **FR-012**: System MUST export coverage analysis results in at least one format (CSV, JSON, or text report)

### Key Entities

- **Graph**: Collection of nodes and edges; represents control flow structure for analysis
  - Attributes: nodes (list), edges (list), graph identifier
  - Relationships: contains many nodes and edges

- **Node**: Individual vertex in the graph; can be marked as definition, use, or regular node
  - Attributes: node ID, label, type (definition/use/regular), reachability status
  - Relationships: connected to other nodes via edges

- **Edge**: Directed connection between two nodes
  - Attributes: source node, target node, edge weight (optional)
  - Relationships: connects two nodes

- **Coverage Metric**: Specification of what to measure (DU-pair, prime path, etc.)
  - Attributes: metric name, metric type, calculation parameters
  - Relationships: applies to a graph, produces coverage results

- **Coverage Result**: Outcome of applying a metric to a graph with test paths
  - Attributes: metric applied, nodes/paths covered, coverage percentage, timestamp
  - Relationships: associated with a specific graph and metric

- **Test Path**: Sequence of nodes representing a path through the graph
  - Attributes: path ID, node sequence, feasibility status (feasible/infeasible)
  - Relationships: traverses through a graph, contributes to coverage metrics

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can import a 50-node graph and see visual representation within 10 seconds
- **SC-002**: DU-pair coverage calculation completes within 5 seconds for graphs with up to 100 nodes
- **SC-003**: Prime path coverage calculation completes within 10 seconds for acyclic graphs with up to 50 nodes
- **SC-004**: Coverage reports display with precision to at least 1 decimal place (e.g., "87.5% coverage")
- **SC-005**: 95% of students report that visual graph representation helps them understand coverage metrics better than text-only output
- **SC-006**: Tool accurately calculates coverage metrics matching manual verification on educational test cases
- **SC-007**: Teachers can use the tool to demonstrate 3+ different coverage criteria in a single class session

## Assumptions

- **Target Users**: Computer Science students (undergrad level) studying testing and graph-based program analysis; instructors teaching these topics; assumes users have basic graph theory knowledge
- **Input Format**: Graph data will be provided in structured format (CSV, text, or GraphML); non-specialized educational graphs (typically 20-100 nodes)
- **Test Paths**: Tests will be provided as sequences of node IDs; tool does not generate test paths (out of scope)
- **Browser/Platform**: Tool runs as a standalone application or web-based tool; assumes standard modern display capabilities
- **Accuracy Requirements**: Coverage calculations must match academic definitions of DU-pair and prime path coverage; precision sufficient for educational use (1 decimal place)
- **Out of Scope**: Automatic test path generation; compiler integration; production-grade performance optimization
- **Cycles**: Tool will handle cycles by limiting prime path enumeration to paths with maximum 20 edges; this prevents infinite enumeration while preserving comprehensive coverage analysis for realistic educational graphs
- **Performance Context**: Tool is for educational use with small-to-medium graphs; does not need to handle production-scale graphs (1000+ nodes)
