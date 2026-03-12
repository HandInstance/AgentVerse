'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Network, Terminal, GitMerge, AlertCircle } from 'lucide-react';

interface CommitDAGNode {
  hash: string;
  short_hash: string;
  agent_name: string;
  agent_model: string;
  message: string;
  experiment_tag: string | null;
  parent_hashes: string;
  files_changed: number;
  insertions: number;
  deletions: number;
  created_at: string;
}

export default function DAGClient({ data, error }: { data: CommitDAGNode[] | null, error: string | null }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasData = data && data.length > 0;

  useEffect(() => {
    if (hasData) {
      renderDAG(data);
    }
  }, [data, hasData]);

  const renderDAG = (data: CommitDAGNode[]) => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 800;
    const height = 600;

    // Clear previous
    svg.selectAll('*').remove();

    // Setup group for zoom
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create hierarchical data structure
    const nodeMap = new Map<string, any>(data.map(d => [d.hash, { ...d, children: [] as any[] }]));
    const rootNodes: any[] = [];

    data.forEach((d: any) => {
      const parents = JSON.parse(d.parent_hashes || '[]');
      if (parents.length === 0) {
        rootNodes.push(nodeMap.get(d.hash));
      } else {
        parents.forEach((parentHash: string) => {
          const parent = nodeMap.get(parentHash);
          if (parent) {
            parent.children.push(nodeMap.get(d.hash));
          }
        });
      }
    });

    // Create tree layout
    // Tree orientation: Horizontal (depth is x)
    // d3.tree size is [height, width] usually for horizontal
    const nodeCount = data.length;
    const dynamicHeight = Math.max(height, nodeCount * 100);
    const dynamicWidth = Math.max(width, 1000);

    const treeLayout = d3.tree<any>()
      .size([dynamicHeight - 100, dynamicWidth - 300])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

    const root = d3.hierarchy<any>({
      name: 'root',
      children: rootNodes.length > 0 ? rootNodes : data.map((d: any) => ({ ...d })),
    });

    treeLayout(root);

    // Initial transform to center/align
    svg.call(zoom.transform, d3.zoomIdentity.translate(50, 50).scale(0.8));

    // Draw links with neon glow
    const links = g.append('g')
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('d', d3.linkHorizontal<any, d3.HierarchyPointNode<any>>()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr('stroke-dasharray', (d, i) => '4,4')
      .style('filter', 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))');

    // Add animation to links
    links.append('animate')
      .attr('attributeName', 'stroke-dashoffset')
      .attr('from', '40')
      .attr('to', '0')
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinite');

    // Draw nodes
    const nodes = g.append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    // Node group with hover effect
    const nodeGroup = nodes.append('g')
      .attr('class', 'node-group');

    // Outer glow
    nodeGroup.append('circle')
      .attr('r', 12)
      .attr('fill', 'rgba(16, 185, 129, 0.1)')
      .attr('class', 'animate-pulse-slow');

    // Middle ring
    nodeGroup.append('circle')
      .attr('r', 8)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.8);
    
    // Core dot
    nodeGroup.append('circle')
      .attr('r', 4)
      .attr('fill', '#10b981')
      .style('filter', 'drop-shadow(0 0 8px #10b981)');

    // Node labels (Hash)
    nodes.append('text')
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#34d399')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono, ui-monospace')
      .text((d: any) => d.data.short_hash || d.data.hash?.slice(0, 8));

    // Agent handles
    nodes.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('fill-opacity', 0.9)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d: any) => d.data.agent_name || 'System');

    // Node messages (subtext)
    nodes.append('text')
      .attr('dy', 38)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.4)')
      .attr('font-size', '9px')
      .attr('font-family', 'Inter, system-ui')
      .text((d: any) => {
        const message = d.data.message ? d.data.message : 'No message';
        return message.length > 25 ? message.slice(0, 25) + '...' : message;
      });

    // Auto-fit logic
    const bounds = g.node()?.getBBox();
    if (bounds && bounds.width > 0 && bounds.height > 0) {
      const fullWidth = svgRef.current.clientWidth;
      const fullHeight = svgRef.current.clientHeight;
      const midX = bounds.x + bounds.width / 2;
      const midY = bounds.y + bounds.height / 2;
      
      const padding = 40;
      const scale = 0.9 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);
      
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
          .translate(fullWidth / 2, fullHeight / 2)
          .scale(Math.min(scale, 1))
          .translate(-midX, -midY)
      );
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
            <Network className="h-3 w-3" />
            Topological Map
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-sans">DAG Visualization</h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl">
            Live directed acyclic graph mapping commit hierarchy and code evolutionary forks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-4 py-2 rounded-lg border border-white/5 shadow-inner">
          <Terminal size={14} className="text-primary" />
          <span>Status: {error ? 'Sync Failed' : 'Synced Directly from Core'}</span>
        </div>
      </div>

      <div className="rounded-2xl glass-card h-full flex flex-col border border-white/10 relative overflow-hidden bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <GitMerge className="h-5 w-5 text-primary" />
            Commit Topology
          </h2>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase border border-white/10 px-2 py-1 rounded bg-black/40">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                Mouse: Scroll to Zoom, Drag to Pan
             </div>
          </div>
        </div>
        
        <div className="p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Internal Query Failed</h3>
              <p className="text-red-400 font-mono text-sm max-w-md">{error}</p>
            </div>
          ) : !hasData ? (
             <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <GitMerge className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Void State</h3>
              <p className="text-white/50 font-mono text-sm max-w-md">The DAG is completely empty. No commits or state changes have been dispatched by agents yet.</p>
            </div>
          ) : (
            <div className="w-full relative overflow-x-auto custom-scrollbar border border-white/5 rounded-xl bg-black/40">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0zOSAzOUgxdjFoMzh2LTF6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz48L3N2Zz4=')] mix-blend-overlay opacity-50 z-0"></div>
              
              <svg
                ref={svgRef}
                className="w-full relative z-10"
                style={{ minHeight: '600px' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
