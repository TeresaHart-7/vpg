"use client";

import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/30"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-[480px] rounded-lg bg-cream-50 p-6 shadow-modal",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && (
            <h2 id="modal-title" className="text-display-sm">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-sm p-1 text-ink-600 hover:bg-lavender-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
