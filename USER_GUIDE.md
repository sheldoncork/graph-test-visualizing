# Graph Coverage Metrics Tool - User Guide

Welcome to the Graph Coverage Metrics Tool! This guide will help you get started with analyzing graph coverage metrics.

## Quick Start

### Step 1: Import Your Graph

1. Click the **Import Graph** section in the left sidebar
2. Click **Choose File** or drag-and-drop a CSV file
3. Ensure your CSV has two columns: `source,target`
   ```
   source,target
   A,B
   B,C
   C,D
   D,B
   ```
4. Click **Upload** - your graph will appear in the visualization

### Step 2: Add Test Paths

1. Click the **Paths** tab
2. Click **+ Add Path**
3. Enter node sequence (e.g., `A,B,C,D,B`)
4. Click **Add** to add the test path
5. Repeat to add multiple test paths

### Step 3: Mark Definitions & Uses (For DU-Pair Coverage)

1. Click the **DU-Pair Coverage** section
2. For each variable:
   - Select **Definition Node** where the variable is assigned
   - Select **Use Node** where the variable is referenced
   - Optionally mark as **Definition-Clear** path
3. Click **Add Definition-Use Pair**

### Step 4: Calculate Coverage

1. Click the **Coverage Control** button
2. Select which metrics to calculate:
   - ✅ DU-Pair Coverage
   - ✅ Prime Path Coverage
   - ✅ Node Coverage
   - ✅ Edge Coverage
   - ✅ McCabe Complexity
   - ✅ All Paths Coverage
3. Click **Calculate All Metrics**

### Step 5: View Results

1. Click the **Results** tab to see coverage percentages
2. Click the **Analysis** tab to see path-by-path contribution
3. Click the **Export** tab to download reports

## CSV Format

Your graph must be in CSV format with `source,target` columns:

```csv
source,target
Node1,Node2
Node1,Node3
Node2,Node4
Node3,Node2
Node3,Node4
Node4,Node1
```

- **source**: Starting node of the edge
- **target**: Ending node of the edge
- Nodes can be any alphanumeric identifier
- Graphs can be directed or undirected (tool treats as directed)

## Understanding Coverage Metrics

### DU-Pair Coverage
Measures the percentage of definition-use pairs covered by your test paths. A definition is where a variable is assigned; a use is where it's referenced.

- **Formula**: (DU-Pairs Covered) / (Total DU-Pairs) × 100%

### Prime Path Coverage
Enumerates all simple paths through the graph (paths that don't repeat nodes except at cycle returns). Limited to 20-edge maximum to prevent infinite cycles.

- **Formula**: (Prime Paths Covered) / (Total Prime Paths) × 100%

### Node Coverage
Measures which nodes have been visited by at least one test path.

- **Formula**: (Nodes Visited) / (Total Nodes) × 100%

### Edge Coverage
Measures which edges have been traversed by at least one test path.

- **Formula**: (Edges Covered) / (Total Edges) × 100%

### McCabe Cyclomatic Complexity
Counts the number of linearly independent paths through the graph (based on control flow).

- **Formula**: E - N + 2P (where E = edges, N = nodes, P = connected components)

### All-Paths Coverage
Enumerates all possible paths from entry to exit nodes.

- **Formula**: (Paths Covered) / (Total Paths) × 100%

## Path Analysis

The **Analysis** tab shows:

- **Path List**: Each test path with its coverage contribution
- **Status Indicators**:
  - 🟢 **Fully Covered**: Path covers 100% of some metric
  - 🟡 **Partially Covered**: Path covers 50-99%
  - 🔴 **Uncovered**: Path covers < 50%
- **Top Contributors**: Paths that cover the most items

## Exporting Reports

### CSV Format
Excel/Google Sheets compatible. Includes summary row and optional detailed test paths.

### JSON Format
Machine-readable data format. Good for programmatic analysis or CI/CD integration.

### Text Report
Human-readable report with formatted metrics and statistics.

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Pan graph | Click + drag |
| Zoom in | Scroll up |
| Zoom out | Scroll down |
| Fit graph | Double-click on canvas |
| Reset view | Right-click → Reset |

## Tips & Tricks

1. **Large Graphs**: Start with simpler graphs and gradually increase complexity
2. **Prime Paths**: For cyclic graphs, prime paths are limited to 20 edges to avoid infinite loops
3. **Test Path Order**: The order of nodes in test paths matters (order defines the path)
4. **Multiple Metrics**: Calculate multiple metrics simultaneously for comparison
5. **Export for Reports**: Use CSV export for inclusion in test reports

## Troubleshooting

### "Could not resolve entry module"
- Ensure your CSV has correct headers: `source,target`
- Check that node names don't have leading/trailing spaces

### Graph Not Displaying
- Click the **Reset** button in the visualization
- Ensure your CSV is properly formatted
- Try a simpler test graph first

### Coverage is 0%
- Add test paths - coverage needs both paths and metrics to calculate
- Ensure test paths actually traverse the graph
- Check that definition-use pairs are properly marked

### Performance Issues (Large Graphs)
- Reduce number of test paths
- Use a simpler layout option for visualization
- Close other browser tabs to free memory

## Example Workflows

### Example 1: Testing a Simple Control Flow

```
1. Create CSV with nodes: A → B → C → D
2. Add test path: A,B,C,D
3. Calculate all metrics
4. Note: Node coverage = 100%, but edge coverage = 75% if missing some edges
```

### Example 2: Testing with Loops

```
1. Create CSV with loop: A → B → C → B → D
2. Add path 1: A,B,C,B,D (covers loop)
3. Add path 2: A,B,D (skips loop)
4. Calculate prime path coverage
5. Analyze which path covers the most complex paths
```

## Support

For questions or issues, please refer to the README.md or contact your instructor.

---

**Version**: 1.0  
**Last Updated**: 2026-03-31
