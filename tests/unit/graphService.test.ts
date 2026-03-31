import { describe, it, expect } from 'vitest';
import { graphService } from '../../src/lib/services/graphService';
import type { Graph } from '../../src/lib/utils/types';

describe('Graph Service', () => {
  let testGraph: Graph;

  beforeEach(() => {
    testGraph = {
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
  });

  describe('validateGraph', () => {
    it('should validate a correct graph', () => {
      const result = graphService.validateGraph(testGraph);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a graph with no nodes', () => {
      const invalidGraph: Graph = {
        nodes: [],
        edges: []
      };

      const result = graphService.validateGraph(invalidGraph);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject edges with non-existent nodes', () => {
      const invalidGraph: Graph = {
        nodes: [{ id: '1', label: 'A' }],
        edges: [{ id: 'e1', source: '1', target: 'nonexistent' }]
      };

      const result = graphService.validateGraph(invalidGraph);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('non-existent'))).toBe(true);
    });
  });

  describe('parseCSV', () => {
    it('should parse a simple CSV graph', () => {
      const csv = `1,Start
2,Middle
3,End

[EDGES]
e1,1,2
e2,2,3`;

      const { graph, errors } = graphService.parseCSV(csv);

      expect(errors).toHaveLength(0);
      expect(graph.nodes).toHaveLength(3);
      expect(graph.edges).toHaveLength(2);
      expect(graph.nodes[0].id).toBe('1');
      expect(graph.edges[0].source).toBe('1');
      expect(graph.edges[0].target).toBe('2');
    });

    it('should handle CSV with node types', () => {
      const csv = `1,Start,start
2,Process,process
3,End,end

[EDGES]
e1,1,2
e2,2,3`;

      const { graph } = graphService.parseCSV(csv);

      expect(graph.nodes[0].type).toBe('start');
      expect(graph.nodes[1].type).toBe('process');
      expect(graph.nodes[2].type).toBe('end');
    });

    it('should skip comments and empty lines', () => {
      const csv = `# This is a comment
1,Start

# Another comment
2,Middle
3,End

[EDGES]
# Edge comment
e1,1,2
e2,2,3`;

      const { graph, errors } = graphService.parseCSV(csv);

      expect(errors).toHaveLength(0);
      expect(graph.nodes).toHaveLength(3);
      expect(graph.edges).toHaveLength(2);
    });

    it('should report parsing errors for malformed lines', () => {
      const csv = `1,Start
invalid_line_without_comma
3,End

[EDGES]
e1,1,2
bad_edge_data`;

      const { graph, errors } = graphService.parseCSV(csv);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('getReachableNodes', () => {
    it('should find all reachable nodes from a start node', () => {
      const reachable = graphService.getReachableNodes(testGraph, '1');

      expect(reachable).toContain('1');
      expect(reachable).toContain('2');
      expect(reachable).toContain('3');
    });

    it('should find reachable nodes from middle node', () => {
      const reachable = graphService.getReachableNodes(testGraph, '2');

      expect(reachable).toContain('2');
      expect(reachable).toContain('3');
      expect(reachable).not.toContain('1');
    });

    it('should handle unreachable nodes', () => {
      const graph: Graph = {
        nodes: [
          { id: '1', label: 'A' },
          { id: '2', label: 'B' },
          { id: '3', label: 'C' }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' }
        ]
      };

      const reachable = graphService.getReachableNodes(graph, '1');

      expect(reachable).toContain('1');
      expect(reachable).toContain('2');
      expect(reachable).not.toContain('3');
    });
  });

  describe('hasCycle', () => {
    it('should detect no cycle in a linear graph', () => {
      const hasCycle = graphService.hasCycle(testGraph);

      expect(hasCycle).toBe(false);
    });

    it('should detect a cycle', () => {
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

      const hasCycle = graphService.hasCycle(cyclicGraph);

      expect(hasCycle).toBe(true);
    });

    it('should detect self-loop as a cycle', () => {
      const selfLoopGraph: Graph = {
        nodes: [{ id: '1', label: 'A' }],
        edges: [{ id: 'e1', source: '1', target: '1' }]
      };

      const hasCycle = graphService.hasCycle(selfLoopGraph);

      expect(hasCycle).toBe(true);
    });
  });
});
