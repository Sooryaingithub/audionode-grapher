import { useEffect, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface Node {
  id: string;
  label: string;
  type: string;
  mentions: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
  confidence: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface KnowledgeGraphViewProps {
  data: GraphData;
}

export const KnowledgeGraphView = ({ data }: KnowledgeGraphViewProps) => {
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Color mapping for node types
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'person':
        return 'hsl(217, 92%, 60%)'; // primary
      case 'place':
        return 'hsl(192, 91%, 48%)'; // accent
      case 'organization':
        return 'hsl(271, 76%, 53%)'; // secondary
      case 'concept':
        return 'hsl(223, 39%, 40%)'; // muted
      default:
        return 'hsl(215, 16%, 65%)';
    }
  };

  // Memoize graph data to prevent unnecessary re-renders
  const graphData = useMemo(() => data, [data]);

  useEffect(() => {
    // Center graph when new nodes are added
    if (graphRef.current && data.nodes.length > 0) {
      graphRef.current.zoomToFit(400);
    }
  }, [data.nodes.length]);

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Knowledge Graph</h2>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor('person') }} />
            <span className="text-muted-foreground">People</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor('place') }} />
            <span className="text-muted-foreground">Places</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor('organization') }} />
            <span className="text-muted-foreground">Orgs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor('concept') }} />
            <span className="text-muted-foreground">Concepts</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-background/50 rounded-xl overflow-hidden">
        {data.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm italic">
              Entities and relationships will appear here...
            </p>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node: any) => `${node.label} (${node.mentions} mentions)`}
            nodeColor={(node: any) => getNodeColor(node.type)}
            nodeRelSize={6}
            nodeVal={(node: any) => Math.max(node.mentions * 2, 4)}
            linkColor={() => 'hsl(223, 39%, 24%)'}
            linkWidth={2}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.003}
            backgroundColor="transparent"
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const size = Math.max(node.mentions * 2, 4);
              const label = node.label;
              const fontSize = 12 / globalScale;

              // Draw node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
              ctx.fillStyle = getNodeColor(node.type);
              ctx.fill();

              // Draw glow effect
              ctx.shadowBlur = 10;
              ctx.shadowColor = getNodeColor(node.type);
              ctx.fill();
              ctx.shadowBlur = 0;

              // Draw label
              ctx.font = `${fontSize}px Inter, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'hsl(213, 31%, 91%)';
              ctx.fillText(label, node.x, node.y + size + fontSize);
            }}
            d3VelocityDecay={0.3}
            warmupTicks={100}
            cooldownTime={2000}
          />
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          {data.nodes.length} entities · {data.links.length} relationships
        </p>
      </div>
    </div>
  );
};
