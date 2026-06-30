"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ProfilePublic } from "@/lib/types/database";

type GraphNode = ProfilePublic & { x?: number; y?: number };
type GraphLink = { source: string; target: string; strength: number };

type ForceGraphProps = {
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  onNodeClick: (node: GraphNode) => void;
};

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default),
  { ssr: false }
) as React.ComponentType<
  ForceGraphProps & {
    width?: number;
    height?: number;
    nodeRelSize?: number;
    linkWidth?: (link: GraphLink) => number;
    linkColor?: (link: GraphLink) => string;
    nodeCanvasObject?: (
      node: GraphNode,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => void;
    nodePointerAreaPaint?: (
      node: GraphNode,
      color: string,
      ctx: CanvasRenderingContext2D
    ) => void;
    cooldownTicks?: number;
    onEngineStop?: () => void;
  }
>;

type Props = {
  profiles: ProfilePublic[];
  links: GraphLink[];
  onSelectProfile: (id: string) => void;
};

const STRENGTH_COLORS = ["", "#E6E1F2", "#B8A9D9", "#8B7BA8", "#5B4A7A"];

function drawNode(
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  const size = 14;
  const label = node.name?.split(" ")[0] || "?";

  ctx.beginPath();
  ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI);
  ctx.fillStyle = node.is_coming === "yes" ? "#B7CFA0" : "#E6E1F2";
  ctx.fill();
  ctx.strokeStyle = "#8B7BA8";
  ctx.lineWidth = 1.5 / globalScale;
  ctx.stroke();

  ctx.font = `${10 / globalScale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#3A3530";
  ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + size + 2 / globalScale);
}

export function NetworkMap({ profiles, links, onSelectProfile }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 480 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setDimensions({ width: Math.max(320, width), height: Math.min(520, width * 0.75) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({ nodes: profiles as GraphNode[], links }),
    [profiles, links]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onSelectProfile(node.id);
    },
    [onSelectProfile]
  );

  if (profiles.length === 0) {
    return (
      <p className="rounded-lg bg-lavender-50 p-8 text-center text-body-md text-ink-600">
        No participants to show on the map yet.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-lavender-100 bg-cream-50"
    >
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeRelSize={6}
        linkWidth={(link) => 0.5 + link.strength * 0.75}
        linkColor={(link) => STRENGTH_COLORS[link.strength] || "#E6E1F2"}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          const size = 14;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, size + 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={80}
      />
      <p className="border-t border-lavender-100 px-4 py-3 text-body-sm text-ink-600">
        Tap a person to view their profile. Line thickness reflects connection strength.
      </p>
    </div>
  );
}
