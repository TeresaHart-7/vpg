"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (blob: Blob) => void;
};

export function ImageCropModal({ open, imageSrc, onClose, onConfirm }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [open, imageSrc]);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 240;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const baseScale = Math.max(size / img.width, size / img.height);
    const s = baseScale * scale;
    const w = img.width * s;
    const h = img.height * s;
    const x = (size - w) / 2 + offset.x;
    const y = (size - h) / 2 + offset.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }, [scale, offset]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview, open]);

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const out = document.createElement("canvas");
    const outSize = 400;
    out.width = outSize;
    out.height = outSize;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    const baseScale = Math.max(outSize / img.width, outSize / img.height);
    const s = baseScale * scale;
    const w = img.width * s;
    const h = img.height * s;
    const x = (outSize - w) / 2 + (offset.x * outSize) / 240;
    const y = (outSize - h) / 2 + (offset.y * outSize) / 240;

    ctx.beginPath();
    ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);

    out.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/webp",
      0.9
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust your photo">
      <p className="text-body-sm text-ink-600">
        Drag to reposition and use the slider to zoom. This is what others will see
        in your profile circle.
      </p>

      <div
        className="relative mx-auto mt-4 h-[240px] w-[240px] cursor-grab overflow-hidden rounded-full border-4 border-cream-50 bg-lavender-100 shadow-soft active:cursor-grabbing"
        onPointerDown={(e) => {
          setDragging(true);
          dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            ox: offset.x,
            oy: offset.y,
          };
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setOffset({
            x: dragStart.current.ox + (e.clientX - dragStart.current.x),
            y: dragStart.current.oy + (e.clientY - dragStart.current.y),
          });
        }}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      <label className="mt-4 block text-label text-ink-600">
        Zoom
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="mt-1 w-full accent-plum-500"
        />
      </label>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleConfirm}>
          Use this photo
        </Button>
      </div>
    </Modal>
  );
}
