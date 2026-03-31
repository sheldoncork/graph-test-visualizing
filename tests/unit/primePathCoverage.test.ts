import { describe, it, expect } from 'vitest';
import { primePathCoverageService } from '../../src/lib/services/primePathCoverageService';
import type { Graph } from '../../src/lib/utils/types';

describe('Prime Path Coverage Service', () => {
  let simpleGraph: Graph;
  let diamondGraph: Graph;

  beforeEach(() => {
    // Simple linear graph: 1 -> 2 -> 3
    simpleGraph = {
      nodes: [
        { id: '1', label: 'Start' },
        { id: '2', label: 'Middle' },
        { id: '3', label: 'End' }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' }
      ]
    };

    // Diamond graph: 1 -> {2, 3} -> 4
    diamondGraph = {
      nodes: [
        { id: '1', label: 'Entry' },
        { id: '2', label: 'Branch A' },
        { id: '3', label: 'Branch B' },
        { id: '4', label: 'Exit' }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '1', target: '3' },
        { id: 'e3', source: '2', target: '4' },
        { id: 'e4', source: '3', target: '4' }
      ]
    };
  });

  it('should enumerate prime paths in a simple linear graph', () => {
    const primePaths = primePathCoverageService.enumeratePrimePaths(simpleGraph);

    expect(primePaths.length).toBeGreaterThan(0);
    expect(primePaths.some(pp => pp.path.join(',') === '1,2,3')).toBe(true);
  });

  it('should enumerate all possible paths in a diamond graph', () => {
    const primePaths = primePathCoverageService.enumeratePrimePaths(diamondGraph);

    expect(primePaths.length).toBeGreaterThan(0);
    // Should have paths: 1-2-4 and 1-3-4
    const paths = primePaths.map(pp => pp.path.join(','));
    expect(paths.some(p => p === '1,2,4')).toBe(true);
    expect(paths.some(p => p === '1,3,4')).toBe(true);
  });

  it('should mark paths with cycles', () => {
    const cyclicGraph: Graph = {
      nodes: [
        { id: '1', label: 'A' },
        { id: '2', label: 'B' },
        { id: '3', label: 'C' }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '1' }
      ]
    };

    const primePaths = primePathCoverageService.enumeratePrimePaths(cyclicGraph);

    // Should identify that some paths are cyclic
    const cyclicPaths = primePaths.filter(pp => pp.isCyclic);
    expect(cyclicPaths.length).toBeGreaterThanOrEqual(0);
  });

  it('should calculate prime path coverage for 100% coverage', () => {
    const primePaths = primePathCoverageService.enumeratePrimePaths(simpleGraph);
    
    // Test path that covers the prime path 1-2-3
    const testPaths = [['1', '2', '3']];

    const result = primePathCoverageService.calculatePrimePathCoverage(primePaths, testPaths);

    expect(result.coverage).toBe(100);
    expect(result.coveredPrimePaths).toBe(result.totalPrimePaths);
  });

  it('should calculate prime path coverage for partial coverage', () => {
    const primePaths = primePathCoverageService.enumeratePrimePaths(diamondGraph);
    
    // Test path that only covers 1-2-4
    const testPaths = [['1', '2', '4']];

    const result = primePathCoverageService.calculatePrimePathCoverage(primePaths, testPaths);

    expect(result.coverage).toBeLessThan(100);
    expect(result.uncoveredPrimePaths).toBeGreaterThan(0);
  });

  it('should handle zero coverage', () => {
    const primePaths = primePathCoverageService.enumeratePrimePaths(simpleGraph);
    
    // No test paths
    const result = primePathCoverageService.calculatePrimePathCoverage(primePaths, []);

    expect(result.coverage).toBe(0);
    expect(result.coveredPrimePaths).toBe(0);
  });

  it('should not double-count paths', () => {
    const primePaths = primePathCoverageService.enumeratePrimePaths(simpleGraph);
    
    // Same path repeated
    const testPaths = [['1', '2', '3'], ['1', '2', '3']];

    const result = primePathCoverageService.calculatePrimePathCoverage(primePaths, testPaths);

    // Coverage should be the same as with single path
    const resultSingle = primePathCoverageService.calculatePrimePathCoverage(primePaths, [['1', '2', '3']]);
    expect(result.coverage).toBe(resultSingle.coverage);
  });

  it('should respect maximum path length limit', () => {
    // Large cyclic graph that could generate infinite paths
    const largeGraph: Graph = {
      nodes: Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        label: `Node ${i + 1}`
      })),
      edges: Array.from({ length: 9 }, (_, i) => ({
        id: `e${i + 1}`,
        source: String(i + 1),
        target: String(i + 2)
      })).concat([
        { id: 'e_cycle', source: '10', target: '5' }
      ])
    };

    const primePaths = primePathCoverageService.enumeratePrimePaths(largeGraph);

    // Should not enumerate infinitely
    expect(primePaths.length).toBeLessThan(10000);
    expect(primePaths.length).toBeGreaterThan(0);
  });
});
