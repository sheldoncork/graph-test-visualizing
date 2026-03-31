import { describe, it, expect } from 'vitest';
import { graphService } from '../../src/lib/services/graphService';
import { duPairCoverageService } from '../../src/lib/services/duPairCoverageService';
import type { Graph, DUPair, Definition, Use } from '../../src/lib/utils/types';

describe('DU-Pair Coverage Service', () => {
  let testGraph: Graph;

  beforeEach(() => {
    testGraph = {
      nodes: [
        { id: '1', label: 'Start' },
        { id: '2', label: 'Def x' },
        { id: '3', label: 'Use x' },
        { id: '4', label: 'End' }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '4' }
      ]
    };
  });

  it('should extract definitions from graph markings', () => {
    const markings = new Map([
      ['2', { defs: ['x'], uses: [] }]
    ]);

    const { definitions, uses } = duPairCoverageService.extractDefinitionsAndUses(testGraph, markings);

    expect(definitions).toHaveLength(1);
    expect(definitions[0].variable).toBe('x');
    expect(definitions[0].nodeId).toBe('2');
    expect(uses).toHaveLength(0);
  });

  it('should extract uses from graph markings', () => {
    const markings = new Map([
      ['3', { defs: [], uses: ['x'] }]
    ]);

    const { definitions, uses } = duPairCoverageService.extractDefinitionsAndUses(testGraph, markings);

    expect(uses).toHaveLength(1);
    expect(uses[0].variable).toBe('x');
    expect(uses[0].nodeId).toBe('3');
    expect(definitions).toHaveLength(0);
  });

  it('should extract multiple definitions and uses', () => {
    const markings = new Map([
      ['2', { defs: ['x', 'y'], uses: [] }],
      ['3', { defs: [], uses: ['x', 'z'] }]
    ]);

    const { definitions, uses } = duPairCoverageService.extractDefinitionsAndUses(testGraph, markings);

    expect(definitions).toHaveLength(2);
    expect(uses).toHaveLength(2);
  });

  it('should calculate DU-pair coverage correctly', () => {
    const definitions: Definition[] = [
      { id: 'd0', variable: 'x', nodeId: '2', line: 2 }
    ];

    const uses: Use[] = [
      { id: 'u0', variable: 'x', nodeId: '3', line: 3, isKilled: false }
    ];

    const duPairs: DUPair[] = [
      {
        id: 'dp0',
        definition: definitions[0],
        use: uses[0],
        isDefinitionClear: true
      }
    ];

    const testPath = ['1', '2', '3', '4'];
    const result = duPairCoverageService.calculateDUPairCoverage(testGraph, duPairs, [testPath]);

    expect(result.totalDUPairs).toBe(1);
    expect(result.coveredDUPairs).toBe(1);
    expect(result.coverage).toBe(100);
  });

  it('should calculate zero DU-pair coverage when no test paths provided', () => {
    const duPairs: DUPair[] = [
      {
        id: 'dp0',
        definition: { id: 'd0', variable: 'x', nodeId: '2', line: 2 },
        use: { id: 'u0', variable: 'x', nodeId: '3', line: 3, isKilled: false },
        isDefinitionClear: true
      }
    ];

    const result = duPairCoverageService.calculateDUPairCoverage(testGraph, duPairs, []);

    expect(result.totalDUPairs).toBe(1);
    expect(result.coveredDUPairs).toBe(0);
    expect(result.coverage).toBe(0);
  });

  it('should not count coverage for pairs not on test path', () => {
    const definitions: Definition[] = [
      { id: 'd0', variable: 'x', nodeId: '2', line: 2 }
    ];

    const uses: Use[] = [
      { id: 'u0', variable: 'x', nodeId: '3', line: 3, isKilled: false }
    ];

    const duPairs: DUPair[] = [
      {
        id: 'dp0',
        definition: definitions[0],
        use: uses[0],
        isDefinitionClear: true
      }
    ];

    // Path that doesn't include the pair
    const testPath = ['1', '2', '4'];
    const result = duPairCoverageService.calculateDUPairCoverage(testGraph, duPairs, [testPath]);

    expect(result.coveredDUPairs).toBe(0);
    expect(result.coverage).toBe(0);
  });
});
