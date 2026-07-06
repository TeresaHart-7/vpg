"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ProfilePublic } from "@/lib/types/database";

type GraphNode = ProfilePublic & { x?: number; y?: number };
type GraphLink = { source: string | GraphNode; target: string | GraphNode; strength: number };

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
    linkWidth?: number;
    linkCanvasObject?: (
      link: GraphLink,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => void;
    linkCanvasObjectMode?: "replace" | "after";
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
  }
>;

type Props = {
  profiles: ProfilePublic[];
  links: GraphLink[];
  onSelectProfile: (id: string) => void;
};

const VINE_COLORS = ["", "#C5D9BC", "#9BB88E", "#6E9460", "#4A7340"];

function getNodePos(node: string | GraphNode) {
  if (typeof node === "string") return { x: 0, y: 0 };
  return { x: node.x ?? 0, y: node.y ?? 0 };
}

function vinePoint(
  sx: number,
  sy: number,
  cx: number,
  cy: number,
  ex: number,
  ey: number,
  t: number
) {
  const u = 1 - t;
  return {
    x: u * u * sx + 2 * u * t * cx + t * t * ex,
    y: u * u * sy + 2 * u * t * cy + t * t * ey,
  };
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "#7A9B6E";
  ctx.beginPath();
  ctx.ellipse(0, 0, 4 * scale, 2.2 * scale, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

function drawVineLink(
  link: GraphLink,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  const start = getNodePos(link.source);
  const end = getNodePos(link.target);
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const curvature = 0.35;
  const cx = mx - dy * curvature;
  const cy = my + dx * curvature;

  const strength = typeof link.strength === "number" ? link.strength : 1;
  ctx.strokeStyle = VINE_COLORS[strength] || "#C5D9BC";
  ctx.lineWidth = (1.2 + strength * 0.6) / globalScale;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(cx, cy, end.x, end.y);
  ctx.stroke();

  const leafScale = 1 / globalScale;
  for (const t of [0.25, 0.5, 0.75]) {
    const p = vinePoint(start.x, start.y, cx, cy, end.x, end.y, t);
    const tangent = vinePoint(start.x, start.y, cx, cy, end.x, end.y, t + 0.05);
    const angle = Math.atan2(tangent.y - p.y, tangent.x - p.x) + Math.PI / 2;
    drawLeaf(ctx, p.x, p.y, angle, leafScale);
    drawLeaf(ctx, p.x, p.y, angle + Math.PI, leafScale * 0.85);
  }
}

function drawNodeWithPhoto(
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  photos: Map<string, HTMLImageElement>
) {
  const size = 20;
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const label = node.name?.split(" ")[0] || "?";
  const img = photos.get(node.id);

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  if (img?.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x - size, y - size, size * 2, size * 2);
  } else {
    ctx.fillStyle = node.is_coming === "yes" ? "#B7CFA0" : "#E6E1F2";
    ctx.fillRect(x - size, y - size, size * 2, size * 2);
    ctx.fillStyle = "#5B4A7A";
    ctx.font = `bold ${11 / globalScale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label.slice(0, 2).toUpperCase(), x, y);
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  ctx.strokeStyle = node.is_coming === "yes" ? "#6E9460" : "#8B7BA8";
  ctx.lineWidth = 2.5 / globalScale;
  ctx.stroke();

  ctx.font = `${10 / globalScale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#3A3530";
  ctx.fillText(label, x, y + size + 2 / globalScale);
}

export function NetworkMap({ profiles, links, onSelectProfile }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 480 });
  const [photos, setPhotos] = useState<Map<string, HTMLImageElement>>(new Map());
  const photosRef = useRef(photos);
  photosRef.current = photos;

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

  useEffect(() => {
    let cancelled = false;
    const next = new Map<string, HTMLImageElement>();

    const loadPhoto = (profile: ProfilePublic) => {
      if (!profile.photo_url) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        setPhotos((prev) => {
          const updated = new Map(prev);
          updated.set(profile.id, img);
          return updated;
        });
      };
      img.src = profile.photo_url;
      next.set(profile.id, img);
    };

    profiles.forEach(loadPhoto);
    if (!cancelled) setPhotos(next);

    return () => {
      cancelled = true;
    };
  }, [profiles]);

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

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      drawNodeWithPhoto(node, ctx, globalScale, photosRef.current);
    },
    []
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
        linkWidth={0}
        linkCanvasObject={drawVineLink}
        linkCanvasObjectMode="replace"
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node, color, ctx) => {
          const size = 20;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, size + 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={80}
      />
      <p className="border-t border-lavender-100 px-4 py-3 text-body-sm text-ink-600">
        Tap a person to view their profile. Vine thickness reflects connection strength.
      </p>
    </div>
  );
}
