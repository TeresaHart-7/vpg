"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  show: boolean;
  onDone: () => void;
  title?: string;
  body?: string;
};

function ConfettiBurst() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 120 + 40),
    rotate: Math.random() * 360,
    color: ["#8B7BA8", "#B8A9D9", "#B7CFA0", "#F2AE85", "#8FC9BE"][i % 5],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function ConnectionCelebration({
  show,
  onDone,
  title = "You're connected!",
  body = "A new thread in the web.",
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 3200);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="fixed bottom-24 right-4 z-50 max-w-xs rounded-lg border border-sage-300 bg-sage-100 p-4 shadow-modal md:bottom-8"
          role="status"
        >
          <ConfettiBurst />
          <p className="relative text-body-md font-semibold text-sage-600">{title}</p>
          <p className="relative mt-1 text-body-sm text-ink-600">{body}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
