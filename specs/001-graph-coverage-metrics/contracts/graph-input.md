# Contract: Graph Input Format

**Date**: 2026-03-31 | **Version**: 1.0.0  
**Scope**: Defines accepted input formats for graph import. All parsers must validate against these specifications.

---

## CSV Format (Primary)

**File Extension**: `.csv`  
**MIME Type**: `text/csv`  
**Encoding**: UTF-8  
**Delimiter**: Comma  
**Line Endings**: LF or CRLF

### Header Row (Required)

```
source,target[,label][,type]
```

| Header | Type | Required | Constraints | Example |
|--------|------|----------|-------------|---------|
| `source` | string | YES | Node ID; alphanumeric, underscore, hyphen | A, node_1, entry |
| `target` | string | YES | Node ID; alphanumeric, underscore, hyphen | B, node_2, exit |
| `label` | string | NO | Edge description; max 100 chars | "true branch", "loop back" |
| `type` | string | NO | Semantic: "def", "use", "control", "data" | def, use |

### Data Rows

- One edge per row (unless node-only rows follow)
- Fields must be quoted if containing commas or quotes
- Escaped quotes: `""` inside quoted field
- Blank cells for optional columns are allowed

### Node Definition Rows (Optional)

Nodes can be implicitly defined by edges (source/target references) or explicitly:

```
node,{node_id},{label}[,{type}]
```

Example:
```
node,A,Entry Point,definition
node,B,Decision,
node,C,Exit,
source,target,label,type
A,B,true,
B,C,,
```

### Example: Valid CSV Graph

```csv
source,target,label,type
entry,process,start,
process,decision,compute,def
decision,success_exit,yes,use
decision,error_exit,no,use
success_exit,exit,complete,
error_exit,exit,error,
```

**Parsing Rules**:
1. Skip comment rows (starting with `#`)
2. Ignore empty rows
3. Trim whitespace from all fields
4. Convert empty optional fields to null
5. If node type not specified, default to "regular"
6. Infer nodes from source/target references
7. Validate node IDs are unique

**Error Handling**:
```
✗ Missing required column → ERROR: "CSV missing required column: 'source'"
✗ Duplicate edge → WARNING: "Duplicate edge {source}→{target}; ignored"
✗ Invalid node ID → ERROR: "Invalid node ID: '{node_id}'; use alphanumerics, underscore, hyphen"
✗ Self-loop → WARNING: "Self-loop detected: {node}→{node}"
✗ Encoding error → ERROR: "File encoding not UTF-8"
```

---

## JSON Format (Future)

**File Extension**: `.json`  
**MIME Type**: `application/json`  
**Schema**: 
```json
{
  "name": "Graph Name",
  "description": "Optional description",
  "nodes": [
    { "id": "A", "label": "Entry", "type": "regular" },
    { "id": "B", "label": "Process", "type": "definition" }
  ],
  "edges": [
    { "source": "A", "target": "B", "label": "start", "weight": 1 }
  ]
}
```

**Validation**:
- `nodes` array: each node must have `id`, `label`; `type` defaults to "regular"
- `edges` array: each edge must have `source`, `target`
- All `source` and `target` IDs must exist in `nodes`
- No duplicate node IDs
- No duplicate edges

---

## GraphML Format (Future)

**File Extension**: `.graphml`  
**MIME Type**: `application/xml`  
**Parser Library**: `graphml-parse` or similar  
**Mapping**:
- GraphML `<node>` → Graph Node
- GraphML `<edge>` → Graph Edge
- GraphML `<data>` attributes → Node/Edge properties (label, type, etc.)

---

## Validation Contract

All parsers must implement this validation function:

```typescript
interface ParseResult {
  success: boolean;
  graph?: Graph;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  line?: number;
  field?: string;
  message: string;
  suggestion?: string;
}

interface ValidationWarning {
  line?: number;
  message: string;
  canIgnore: boolean;
}
```

**Example**:
```typescript
const result: ParseResult = {
  success: false,
  errors: [
    {
      line: 3,
      field: "source",
      message: "Node 'X' referenced but not defined",
      suggestion: "Did you mean 'N' or 'M'?"
    }
  ],
  warnings: [
    {
      line: 5,
      message: "Duplicate edge A→B; using first definition",
      canIgnore: true
    }
  ]
};
```

---

## Import User Experience

1. User clicks "Import Graph"
2. User selects file (CSV, JSON, GraphML)
3. Parser validates
4. If errors: show error list with line numbers and suggestions; block import
5. If warnings: show warning list; ask "Continue?" (allows override)
6. If success: display parsed graph nodes + edges summary; ask "Confirm import?"
7. On confirm: create Graph entity, render visualization

---

## Testing Contract

Parsers tested against:
- ✅ Valid CSV with all columns
- ✅ Valid CSV with optional columns missing
- ✅ CSV with special characters (quoted fields)
- ✅ CSV with node definitions
- ✅ Cyclic graph CSV
- ✅ Disconnected components CSV
- ✅ Single-node graph
- ✅ Large graph (100 nodes, 150 edges)
- ❌ Missing required columns
- ❌ Invalid node IDs (special chars)
- ❌ Duplicate node IDs
- ❌ Undefined node references
- ❌ Wrong file encoding (non-UTF-8)

---

## Summary

✅ CSV as primary format (simple, accessible)  
✅ JSON for future structured import  
✅ GraphML support deferred to Phase 2  
✅ Comprehensive validation with actionable error messages  
✅ Warnings for non-blocking issues with override option  
