/**
 * Application Constants and Limits
 * Reference: specs/001-graph-coverage-metrics/research.md
 */

// Graph Size Limits
export const MAX_NODES = 1000;
export const MAX_EDGES = 5000;
export const MAX_PRIME_PATH_LENGTH = 20; // Prevent infinite enumeration in cyclic graphs

// Performance Targets
export const IMPORT_TARGET_MS = 10_000;      // Target: import 50-node graph in < 10 seconds
export const COVERAGE_CALC_TARGET_MS = 10_000; // Target: calculate coverage in < 10 seconds
export const PRIME_PATH_TARGET_MS = 5_000;   // Target: enumerate prime paths in < 5 seconds

// UI Defaults
export const DEFAULT_LAYOUT = 'cose' as const; // Cytoscape.js layout
export const DEFAULT_ZOOM = 1;
export const MAX_ZOOM = 3;
export const MIN_ZOOM = 0.1;

// Coverage Metric Types
export const COVERAGE_METRICS = {
  'du-pair': 'Definition-Use Pair Coverage',
  'prime-path': 'Prime Path Coverage',
  'node': 'Node Coverage',
  'edge': 'Edge Coverage',
  'all-paths': 'All-Paths Coverage',
  'mcc': 'McCabe Cyclomatic Paths'
} as const;

// Chart Colors
export const METRIC_COLORS = {
  'du-pair': '#3b82f6',      // Blue
  'prime-path': '#10b981',   // Green
  'node': '#f59e0b',         // Amber
  'edge': '#8b5cf6',         // Purple
  'all-paths': '#ef4444',    // Red
  'mcc': '#06b6d4'           // Cyan
} as const;

// Status Monitoring
export const STATUS_UPDATE_INTERVAL_MS = 500; // Update UI every 500ms during long operations

// Test Path Limits
export const MAX_TEST_PATHS = 1000;
export const DEFAULT_TEST_PATH_COLOR = '#3b82f6'; // Blue

// CSV Parser Defaults
export const CSV_DELIMITER = ',';
export const CSV_HEADERS = ['source', 'target', 'label'] as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  graphs: 'graph-testing:graphs',
  lastGraph: 'graph-testing:last-graph',
  userPreferences: 'graph-testing:preferences',
  coverage: 'graph-testing:coverage'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_GRAPH: 'Graph structure is invalid or malformed',
  DUPLICATE_NODES: 'Graph contains duplicate node IDs',
  INVALID_EDGES: 'Graph edges reference non-existent nodes',
  FILE_PARSE_ERROR: 'Could not parse file. Check format and try again.',
  EXCEEDS_SIZE_LIMIT: `Graph exceeds size limits (max ${MAX_NODES} nodes, ${MAX_EDGES} edges)`,
  EMPTY_GRAPH: 'Graph must contain at least 2 nodes and 1 edge'
} as const;
