"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
};

export function Toast({ message, type = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle className="text-sage-600" size={20} weight="fill" />,
    error: <WarningCircle className="text-error" size={20} weight="fill" />,
    info: null,
  };

  return (
    <div
      className={cn(
        "fixed left-4 right-4 top-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-md bg-white p-4 shadow-raised sm:left-auto sm:right-6",
        type === "error" && "bg-error-bg"
      )}
      role="status"
    >
      {icons[type]}
      <p className="flex-1 text-body-md text-ink-900">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-ink-600 hover:text-ink-900"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
}
