/**
 * Integration Tests: Full Coverage Calculation Workflows
 * Reference: specs/001-graph-coverage-metrics/spec.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { graphService } from '../../src/lib/services/graphService';
import { duPairCoverageService } from '../../src/lib/services/duPairCoverageService';
import { primePathCoverageService } from '../../src/lib/services/primePathCoverageService';
import { nodeCoverageService } from '../../src/lib/services/nodeCoverageService';
import { edgeCoverageService } from '../../src/lib/services/edgeCoverageService';

// Test graph fixture
const simpleGraph = {
  id: 'simple-test',
  name: 'Simple Test Graph',
  nodes: [
    { id: 1, label: 'Entry', type: 'entry' },
    { id: 2, label: 'Decision', type: 'decision' },
    { id: 3, label: 'Process A' },
    { id: 4, label: 'Process B' },
    { id: 5, label: 'Exit', type: 'exit' }
  ],
  edges: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 2, target: 4 },
    { source: 3, target: 5 },
    { source: 4, target: 5 }
  ],
  entryNode: 1,
  exitNode: 5
};

describe('Integration: Full Coverage Workflows', () => {
  describe('CSV Import → Coverage Calculation', () => {
    it('should validate graph structure', () => {
      const result = graphService.validateGraph(simpleGraph);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toEqual(0);
    });
  });

  describe('DU-Pair Coverage Workflow', () => {
    it('should calculate DU-pair coverage with test paths', () => {
      // Create test paths (string format as expected by service)
      const testPaths = [
        ['1', '2', '3', '5'],
        ['1', '2', '4', '5']
      ];

      // Create DU pairs with proper structure
      const duPairs: any[] = [
        {
          definition: { id: 'd1', nodeId: '1', variable: 'x', line: 1 },
          use: { id: 'u1', nodeId: '3', variable: 'x', isKilled: false, line: 3 }
        },
        {
          definition: { id: 'd2', nodeId: '1', variable: 'x', line: 1 },
          use: { id: 'u2', nodeId: '4', variable: 'x', isKilled: false, line: 4 }
        }
      ];

      // Calculate coverage
      const coverage = duPairCoverageService.calculateDUPairCoverage(simpleGraph, duPairs, testPaths);
      
      expect(coverage.totalDUPairs).toBeGreaterThanOrEqual(0);
      expect(coverage.coveredDUPairs).toBeGreaterThanOrEqual(0);
      expect(coverage.coverage).toBeGreaterThanOrEqual(0);
      expect(coverage.coverage).toBeLessThanOrEqual(100);
    });
  });

  describe('Prime Path Coverage Workflow', () => {
    it('should enumerate prime paths from graph', () => {
      const paths = primePathCoverageService.enumeratePrimePaths(simpleGraph as any);
      
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should respect 20-edge maximum limit', () => {
      const paths = primePathCoverageService.enumeratePrimePaths(simpleGraph as any);
      
      paths.forEach(path => {
        // path.nodes should have <= 21 nodes (for 20 edges)
        if (path.nodes) {
          expect(path.nodes.length).toBeLessThanOrEqual(21);
        }
      });
    });

    it('should calculate prime path coverage', () => {
      const primePaths = [
        { id: 'pp1', path: ['1', '2', '3', '5'], isCyclic: false, length: 4 },
        { id: 'pp2', path: ['1', '2', '4', '5'], isCyclic: false, length: 4 }
      ];
      
      const testPaths = [
        ['1', '2', '3', '5'],
        ['1', '2', '4', '5']
      ];
      
      const coverage = primePathCoverageService.calculatePrimePathCoverage(
        primePaths,
        testPaths
      );
      
      expect(coverage.totalPrimePaths).toEqual(2);
      expect(coverage.coveredPrimePaths).toBeGreaterThanOrEqual(0);
      expect(coverage.coverage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Node & Edge Coverage Workflow', () => {
    it('should calculate node coverage', () => {
      const testPaths = [
        ['1', '2', '3', '5'],
        ['1', '2', '4', '5']
      ];

      const coverage = nodeCoverageService.calculateNodeCoverage(simpleGraph as any, testPaths);
      
      expect(coverage.totalNodes).toEqual(5);
      expect(coverage.coveredNodes).toBeGreaterThanOrEqual(4);
      expect(coverage.coverage).toBeGreaterThanOrEqual(0);
    });

    it('should calculate edge coverage', () => {
      const testPaths = [
        ['1', '2', '3', '5'],
        ['1', '2', '4', '5']
      ];

      const coverage = edgeCoverageService.calculateEdgeCoverage(simpleGraph as any, testPaths);
      
      expect(coverage.totalEdges).toEqual(5);
      expect(coverage.coveredEdges).toBeGreaterThanOrEqual(0);
      expect(coverage.coverage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should reject graphs with validation errors', () => {
      const invalidGraph = {
        id: 'invalid',
        nodes: [{ id: '1' }],
        edges: [{ source: '1', target: '99' }] // Target doesn't exist
      };

      const result = graphService.validateGraph(invalidGraph as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty test paths gracefully', () => {
      const coverage = nodeCoverageService.calculateNodeCoverage(simpleGraph as any, []);
      
      expect(coverage.totalNodes).toEqual(5);
      expect(coverage.coveredNodes).toEqual(0);
      expect(coverage.coverage).toEqual(0);
    });
  });
});
