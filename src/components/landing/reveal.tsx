"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Scroll-reveal wrapper. Fades + slides its children into view once when they
// enter the viewport. Pure CSS transition (see .cg-reveal in globals.css).
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("cg-reveal", visible && "is-visible", className)}
    >
      {children}
    </div>
  );
}
