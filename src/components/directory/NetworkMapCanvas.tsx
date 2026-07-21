"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { forceCollide } from "d3-force-3d";
import type { ProfilePublic } from "@/lib/types/database";
import { NETWORK_STRENGTH_STYLE } from "@/components/directory/networkMapStyles";

type GraphNode = ProfilePublic & {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number;
};

type Props = {
  profiles: ProfilePublic[];
  links: { source: string; target: string; strength: number }[];
  onSelectProfile: (id: string) => void;
  currentProfileId?: string;
  width: number;
  height: number;
};

const NODE_RADIUS = 18;
const NODE_HIT = 24;
const LABEL_GAP = 4;

const COLORS = {
  cream50: "#FBF8F3",
  lavender100: "#E6E1F2",
  plum500: "#8B7BA8",
  plum700: "#5B4A7A",
  sage300: "#B7CFA0",
  ink900: "#3A3530",
} as const;

function hashString(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function linkId(link: GraphLink) {
  const source =
    typeof link.source === "object" ? String(link.source.id) : String(link.source);
  const target =
    typeof link.target === "object" ? String(link.target.id) : String(link.target);
  return [source, target].sort().join(":");
}

function curvatureForLink(link: GraphLink) {
  const h = hashString(linkId(link));
  const sign = h % 2 === 0 ? 1 : -1;
  return sign * (0.16 + (h % 100) / 1000);
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useImageCache(urls: string[]) {
  const [images, setImages] = useState<Map<string, HTMLImageElement>>(() => new Map());
  const urlsKey = useMemo(() => [...new Set(urls.filter(Boolean))].sort().join("|"), [urls]);

  useEffect(() => {
    let cancelled = false;
    const unique = urlsKey ? urlsKey.split("|") : [];

    unique.forEach((url) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        setImages((prev) => {
          if (prev.has(url)) return prev;
          const next = new Map(prev);
          next.set(url, img);
          return next;
        });
      };
      img.src = url;
    });

    return () => {
      cancelled = true;
    };
  }, [urlsKey]);

  return images;
}

function drawCoverCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const side = Math.min(iw, ih);
  const sx = (iw - side) / 2;
  const sy = (ih - side) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, sx, sy, side, side, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

function drawFallbackNode(
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  radius: number,
  globalScale: number
) {
  const cx = node.x ?? 0;
  const cy = node.y ?? 0;
  const fill = node.is_coming === "yes" ? COLORS.sage300 : COLORS.lavender100;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.fillStyle = COLORS.plum700;
  ctx.font = `600 ${Math.max(9, 11 / globalScale)}px Quicksand, Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initialsFor(node.name || "?"), cx, cy + 0.5);
}

export default function NetworkMapCanvas({
  profiles,
  links,
  onSelectProfile,
  currentProfileId,
  width,
  height,
}: Props) {
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined);
  const forcesConfigured = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [linkReveal, setLinkReveal] = useState(1);
  const reducedMotion = useRef(false);

  const photoUrls = useMemo(
    () => profiles.map((p) => p.photo_url).filter((url): url is string => Boolean(url)),
    [profiles]
  );
  const images = useImageCache(photoUrls);

  useEffect(() => {
    reducedMotion.current = prefersReducedMotion();
    if (reducedMotion.current) {
      setLinkReveal(1);
      return;
    }
    setLinkReveal(0);
    const start = performance.now();
    const duration = 700;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setLinkReveal(1 - Math.pow(1 - t, 2.2));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [profiles.length, links.length]);

  const graphData = useMemo(() => {
    const n = profiles.length;
    const radius = 90 + Math.min(n, 48) * 5.5;
    const nodes: GraphNode[] = profiles.map((profile, i) => {
      const angle = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2;
      const jitter = ((hashString(profile.id) % 20) - 10) * 1.2;
      return {
        ...profile,
        x: Math.cos(angle) * (radius + jitter),
        y: Math.sin(angle) * (radius + jitter),
      };
    });
    return { nodes, links: links as GraphLink[] };
  }, [profiles, links]);

  useEffect(() => {
    forcesConfigured.current = false;
  }, [profiles.length, links.length]);

  useEffect(() => {
    // Photos arriving after cool-down need a paint pass.
    fgRef.current?.resumeAnimation();
  }, [images]);

  const configureForces = useCallback(() => {
    const fg = fgRef.current;
    if (!fg || forcesConfigured.current) return;

    const charge = fg.d3Force("charge") as
      | { strength?: (n: number) => unknown; distanceMax?: (n: number) => unknown }
      | undefined;
    charge?.strength?.(-240);
    charge?.distanceMax?.(420);

    const linkForce = fg.d3Force("link") as
      | {
          distance?: (fn: (link: GraphLink) => number) => unknown;
          strength?: (n: number) => unknown;
        }
      | undefined;
    linkForce?.distance?.((link) => {
      const strength = Math.min(4, Math.max(1, link.strength || 1));
      return 78 + (5 - strength) * 26;
    });
    linkForce?.strength?.(0.38);

    fg.d3Force(
      "collide",
      forceCollide(NODE_RADIUS + 10).strength(0.92).iterations(2) as never
    );
    forcesConfigured.current = true;
  }, []);

  const drawNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const cx = node.x ?? 0;
      const cy = node.y ?? 0;
      const isHovered = hoveredId === node.id;
      const isSelf = currentProfileId === node.id;
      const scale = isHovered ? 1.08 : 1;
      const radius = NODE_RADIUS * scale;
      const photo = node.photo_url ? images.get(node.photo_url) : undefined;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx + 1.2 / globalScale, cy + 2 / globalScale, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(91, 74, 122, 0.12)";
      ctx.fill();
      ctx.restore();

      if (photo?.complete) {
        drawCoverCircle(ctx, photo, cx, cy, radius);
      } else {
        drawFallbackNode(ctx, node, radius, globalScale);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.cream50;
      ctx.lineWidth = 3 / globalScale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius + 1.2 / globalScale, 0, Math.PI * 2);
      ctx.strokeStyle = isSelf ? COLORS.plum700 : COLORS.plum500;
      ctx.lineWidth = (isSelf ? 2.4 : 1.5) / globalScale;
      ctx.stroke();

      if (globalScale >= 0.55) {
        const label = node.name?.split(" ")[0] || "?";
        const fontSize = Math.max(9, (isHovered ? 11.5 : 10.5) / globalScale);
        ctx.font = `600 ${fontSize}px Quicksand, Nunito, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const labelY = cy + radius + LABEL_GAP / globalScale;
        const metrics = ctx.measureText(label);
        const padX = 4 / globalScale;
        const padY = 2 / globalScale;
        const boxH = fontSize + padY * 2;
        const boxX = cx - metrics.width / 2 - padX;
        const boxY = labelY - padY;
        const boxW = metrics.width + padX * 2;
        const r = 4 / globalScale;

        ctx.fillStyle = "rgba(251, 248, 243, 0.82)";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(boxX, boxY, boxW, boxH, r);
        } else {
          ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.fill();

        ctx.fillStyle = COLORS.ink900;
        ctx.fillText(label, cx, labelY);
      }
    },
    [currentProfileId, hoveredId, images]
  );

  const drawLink = useCallback(
    (link: GraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const source = link.source as GraphNode;
      const target = link.target as GraphNode;
      if (
        source?.x == null ||
        source?.y == null ||
        target?.x == null ||
        target?.y == null
      ) {
        return;
      }

      const style = NETWORK_STRENGTH_STYLE[link.strength] || NETWORK_STRENGTH_STYLE[1];
      const curve = curvatureForLink(link);
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const cx = (source.x + target.x) / 2 - dy * curve;
      const cy = (source.y + target.y) / 2 + dx * curve;

      ctx.save();
      ctx.globalAlpha = linkReveal;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.quadraticCurveTo(cx, cy, target.x, target.y);
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.width / Math.sqrt(globalScale);
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    },
    [linkReveal]
  );

  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(reducedMotion.current ? 0 : 420, 48);
  }, []);

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      ref={fgRef}
      width={width}
      height={height}
      graphData={graphData}
      backgroundColor="rgba(0,0,0,0)"
      nodeRelSize={NODE_RADIUS}
      nodeId="id"
      linkCanvasObjectMode={() => "replace"}
      linkCanvasObject={drawLink}
      nodeCanvasObject={drawNode}
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, NODE_HIT, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }}
      onNodeClick={(node) => {
        if (node.id) onSelectProfile(String(node.id));
      }}
      onNodeHover={(node) => {
        setHoveredId(node?.id != null ? String(node.id) : null);
        fgRef.current?.resumeAnimation();
      }}
      onEngineTick={configureForces}
      cooldownTicks={180}
      d3AlphaDecay={0.022}
      d3VelocityDecay={0.35}
      onEngineStop={handleEngineStop}
      enableNodeDrag
      showPointerCursor
    />
  );
}
