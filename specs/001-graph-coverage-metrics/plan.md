# Implementation Plan: Graph Coverage Metrics Tool

**Branch**: `001-graph-coverage-metrics` | **Date**: 2026-03-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-graph-coverage-metrics/spec.md` | **Technology**: Svelte + TypeScript + Cytoscape.js, deployed to GitHub Pages

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

An **interactive web-based educational tool** that allows students and instructors to import graph structures, visualize them, and calculate multiple coverage metrics (DU-pair, prime path, node, edge, all-paths, and linearly independent paths). The tool runs entirely in the browser and is deployed as a static site on GitHub Pages.

**Technical Approach**: Build a single-page application (SPA) using Svelte + TypeScript with Cytoscape.js for graph visualization and D3.js or custom algorithms for coverage calculations. State management handles graph import, metric selection, and results display. No backend required—all computation is client-side.

## Technical Context

**Language/Version**: TypeScript 5.x, targeting ES2020  
**Primary Dependencies**: Svelte 4.x, Cytoscape.js 3.x, Vite (build tool), Vitest (testing)  
**Storage**: Local browser storage (localStorage) for session graphs and results; import/export via file downloads  
**Testing**: Vitest + Svelte Testing Library (unit + integration); manual testing for UI/UX  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge); responsive design for desktop and tablet  
**Project Type**: Web-based single-page application (SPA) with client-side computation  
**Performance Goals**: Import and render 50-node graph < 10 seconds; coverage calculations complete < 10 seconds for graphs up to 100 nodes  
**Constraints**: No server-side processing; all algorithms run in browser; must work offline after initial load; GitHub Pages hosting (static files only)  
**Scale/Scope**: Initial support for educational graphs (20-100 nodes typical); support 6+ simultaneous students using independent instances

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Verification |
|-----------|-----------|--------------|
| **I. Test-Driven Development** | ✅ PASS | Vitest + Svelte Testing Library configured; all unit tests written first before coverage algorithm implementation; integration tests for graph import/export flows |
| **II. Performance Excellence** | ✅ PASS | Performance targets documented (< 10s for 50-node import, < 10s for coverage calculation); Cytoscape.js rendering optimized; algorithms profiled before optimization |
| **III. Clean Code Practices** | ✅ PASS | TypeScript enforces type safety; ESLint + Prettier configured; `cyclomatic-complexity` linter rule enforced; algorithms documented with complexity analysis |
| **IV. Comprehensive Code Review** | ✅ PASS | All PRs require peer review; reviewers verify test coverage and performance implications before merge |
| **V. Clear Documentation** | ✅ PASS | JSDoc comments on all public functions; algorithm explanations for coverage calculations (DU-pair, prime path); README with quickstart guide |

**Gate Status**: ✅ **APPROVED** — No violations. All principles supported by technical architecture and build configuration.

## Project Structure

### Documentation (this feature)

```text
specs/001-graph-coverage-metrics/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── graph-input.md   # Graph import format specification
│   ├── coverage-output.md  # Coverage result format
│   └── ui-components.md # Component API contract
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
# Web application structure (SvelteKit + TypeScript)
src/
├── lib/
│   ├── components/      # Svelte UI components
│   │   ├── GraphViewer.svelte
│   │   ├── MetricsPanel.svelte
│   │   ├── ImportForm.svelte
│   │   └── ResultsDisplay.svelte
│   ├── services/        # Graph and coverage algorithms
│   │   ├── graphParser.ts      # Parse CSV/text/GraphML formats
│   │   ├── duPairCoverage.ts   # DU-pair calculation
│   │   ├── primePath.ts        # Prime path enumeration
│   │   ├── nodeCoverage.ts     # Node coverage calculation
│   │   ├── edgeCoverage.ts     # Edge coverage calculation
│   │   ├── allPathsCoverage.ts # All-paths coverage
│   │   ├── mccCoverage.ts      # McCabe cyclomatic complexity paths
│   │   ├── testPathValidator.ts # Validate test paths
│   │   └── reportGenerator.ts  # Export results (CSV, JSON)
│   ├── stores/          # Svelte stores for state management
│   │   ├── graphStore.ts       # Graph state
│   │   ├── metricsStore.ts     # Metrics selection and results
│   │   └── uiStore.ts          # UI state (view mode, zoom, etc.)
│   └── utils/
│       ├── constants.ts        # Limits, defaults
│       ├── types.ts            # TypeScript types and interfaces
│       └── helpers.ts          # Utility functions

src/routes/
├── +page.svelte         # Main app page
├── +page.ts             # Server load (if needed)
└── +layout.svelte       # Layout wrapper

static/
├── examples/            # Sample graph files for demo
│   ├── simple-graph.csv
│   ├── complex-graph.csv
│   └── README.md

tests/
├── unit/
│   ├── duPairCoverage.test.ts
│   ├── primePath.test.ts
│   ├── nodeCoverage.test.ts
│   ├── graphParser.test.ts
│   └── testPathValidator.test.ts
├── integration/
│   ├── workflow.test.ts  # End-to-end: import -> calculate -> export
│   └── components.test.ts # Component integration tests
└── fixtures/            # Test data (sample graphs)
    ├── simple-graph.json
    ├── acyclic-graph.json
    ├── cyclic-graph.json
    └── large-graph.json

public/
├── index.html           # Entry point
├── favicon.svg
└── robots.txt

# Configuration files (repo root)
vite.config.ts
tsconfig.json
svelte.config.js
vitest.config.ts
.eslintrc.cjs
.prettierrc.json
package.json
README.md
```

**Structure Decision**: Single web application structure using SvelteKit + Vite. All graph processing and coverage calculations run client-side. No backend required. Deployed as static files to GitHub Pages. Structure separates concerns: UI components, domain logic (services), state management (stores), and utilities. Test coverage mirrors source structure.

---

---

## Constitution Check (Post-Design)

*GATE: Verification after Phase 1 design completion.*

| Principle | Compliance | Verification |
|-----------|-----------|--------------|
| **I. Test-Driven Development** | ✅ PASS | Test contracts defined; data-model.md specifies test scenarios; quickstart.md documents TDD pattern |
| **II. Performance Excellence** | ✅ PASS | Performance targets in plan and quickstart; algorithms profiled before optimization |
| **III. Clean Code Practices** | ✅ PASS | Component API contracts enforce single responsibility; TypeScript ensures type safety |
| **IV. Comprehensive Code Review** | ✅ PASS | UI components, services, and stores have clear interfaces for peer review |
| **V. Clear Documentation** | ✅ PASS | Contracts document all public APIs; quickstart provides implementation guide |

**Gate Status**: ✅ **APPROVED** — Post-design verification confirms no violations introduced by Phase 1 design.

---

# PHASE 0: Research & Clarification
