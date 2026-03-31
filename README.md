# Graph Coverage Metrics Tool

An interactive, web-based educational tool for analyzing graph coverage metrics.

## Overview

This tool helps students and instructors:
- **Visualize** graph structures interactively
- **Calculate** multiple coverage metrics (DU-pair, prime path, node, edge, all-paths, McCabe)
- **Analyze** test path effectiveness
- **Export** coverage reports in multiple formats (CSV, JSON, text)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Development

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm preview
```

## Features

### Phase 1-6: Core Implementation ✅ COMPLETE

- ✅ Graph Import (CSV format)
- ✅ Interactive Visualization (Cytoscape.js with pan/zoom)
- ✅ DU-Pair Coverage Calculation with marking interface
- ✅ Prime Path Coverage Calculation with 20-edge limit
- ✅ Test Path Management and editing
- ✅ Results display with coverage percentages
- ✅ Node Coverage
- ✅ Edge Coverage
- ✅ All-Paths Coverage
- ✅ McCabe Cyclomatic Complexity
- ✅ Components for all coverage metrics
- ✅ 36+ passing unit and integration tests

### Phase 7: Path Analysis ✅ COMPLETE

- ✅ Path highlighting on graph
- ✅ Coverage contribution analysis
- ✅ Path-by-path coverage metrics
- ✅ Interactive path selection and visualization

### Phase 8: Export Reports ✅ COMPLETE

- ✅ CSV export (spreadsheet-ready)
- ✅ JSON export (data format)
- ✅ Text report export (human-readable)
- ✅ Export customization options

### Phase 9: Polish & Deploy 🚀 FINAL

## Project Structure

```
src/
├── lib/
│   ├── components/       # Svelte UI components
│   ├── services/         # Coverage calculation algorithms
│   ├── stores/           # State management (Svelte stores)
│   └── utils/            # Helper functions and types
├── routes/               # SvelteKit routes
└── styles/               # Global styles

tests/
├── unit/                 # Unit tests for algorithms
├── integration/          # Integration tests for workflows
├── fixtures/             # Test graph data
└── setup.ts              # Test configuration
```

## Deployment

### GitHub Pages Deployment

The application is configured for static deployment on GitHub Pages:

```bash
# Build for production
npm run build

# Output is in the 'build' directory
# You can manually push to gh-pages branch or use a deployment script
```

### Local Preview

```bash
# After building, preview the production version locally
npm run preview
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

This project uses **Test-Driven Development (TDD)**:

1. Tests are written FIRST, before implementation
2. Tests guide the implementation
3. Target: 80%+ code coverage

```bash
npm run test              # Run all tests once
npm run test:ui           # Run tests with interactive UI
npm run test:coverage     # Generate coverage report
```

## Code Quality

- **ESLint**: Static code analysis with complexity limits
- **Prettier**: Code formatting (2-space indent, semicolons)
- **TypeScript**: Strict type checking
- **Test Coverage**: Minimum 80% required

```bash
npm run lint              # Check for linting errors
npm run lint:fix          # Fix linting errors
npm run format            # Format code with Prettier
npm run check             # Run lint + tests
```

## Graph Input Format

### CSV Format

Simple format: `source,target`

```csv
1,2
1,3
2,4
3,4
```

With labels: `source,target,label`

```csv
A,B,assign x
B,C,read y
C,D,test result
```

## Performance Targets

- Import & render 50-node graph: < 10 seconds
- Coverage calculation (50-100 nodes): < 10 seconds
- Prime path enumeration (20-edge limit): < 5 seconds

## Deployment

Deployed on GitHub Pages at: `https://sheld.github.io/graph-testing/`

Build process:
1. Run tests (`npm run test`)
2. Build for production (`npm run build`)
3. Output to `build/` directory
4. Automatically deployed to GitHub Pages on push to `main`

## Constitution

This project follows 5 core principles:

1. **Test-Driven Development (TDD)** — Red-Green-Refactor cycle
2. **Performance Excellence** — Algorithmic efficiency and optimization
3. **Clean Code** — SOLID principles, focused functions
4. **Comprehensive Code Review** — Peer review with compliance verification
5. **Clear Documentation** — Self-documenting code with JSDoc comments

See `.specify/constitution.md` for details.

## Resources

- [Graph Testing Specification](specs/001-graph-coverage-metrics/spec.md)
- [Implementation Plan](specs/001-graph-coverage-metrics/plan.md)
- [Quick Start Guide](specs/001-graph-coverage-metrics/quickstart.md)
- [Data Model](specs/001-graph-coverage-metrics/data-model.md)

## License

Educational tool for SE 4170 (Iowa State University)
