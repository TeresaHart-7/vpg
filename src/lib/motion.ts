"use client";

export function useReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const springTap = { stiffness: 400, damping: 17 };
export const springPop = { stiffness: 500, damping: 15 };

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: "easeOut" },
};

export const slideHorizontal = (direction: "forward" | "back") => ({
  initial: { opacity: 0, x: direction === "forward" ? 24 : -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: direction === "forward" ? -24 : 24 },
  transition: { duration: 0.3, ease: "easeOut" },
});
