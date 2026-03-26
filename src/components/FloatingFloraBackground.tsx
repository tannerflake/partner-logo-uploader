"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { FLORA_FILES, floraImageSrc } from "@/lib/flora-assets";

const COUNT_MIN = 8;
const COUNT_MAX = 12;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

type FloraItem = {
  id: number;
  src: string;
  top: string;
  left: string;
  width: number;
  floraR: string;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  x3: string;
  y3: string;
  duration: number;
  delay: number;
};

function generateItems(): FloraItem[] {
  const n = Math.round(rand(COUNT_MIN, COUNT_MAX));
  return Array.from({ length: n }, (_, i) => {
    const file = FLORA_FILES[Math.floor(Math.random() * FLORA_FILES.length)]!;
    const rotate = rand(-38, 38);
    return {
      id: i,
      src: floraImageSrc(file),
      top: `${rand(-8, 92)}%`,
      left: `${rand(-8, 92)}%`,
      width: Math.round(rand(44, 168)),
      floraR: `${rotate}deg`,
      x1: `${Math.round(rand(-36, 36))}px`,
      y1: `${Math.round(rand(-44, 44))}px`,
      x2: `${Math.round(rand(-40, 44))}px`,
      y2: `${Math.round(rand(-48, 40))}px`,
      x3: `${Math.round(rand(-32, 36))}px`,
      y3: `${Math.round(rand(-40, 36))}px`,
      duration: Math.round(rand(52, 118)),
      delay: rand(0, 14),
    };
  });
}

export function FloatingFloraBackground() {
  const [items, setItems] = useState<FloraItem[] | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setItems(generateItems());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!items) return null;

  return (
    <div
      className="flora-bg pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {items.map((item) => (
        // eslint-disable-next-line @next/next/no-img-element -- decorative background sprites
        <img
          key={item.id}
          src={item.src}
          alt=""
          className="flora-bg__img absolute opacity-20 will-change-transform select-none"
          style={
            {
              top: item.top,
              left: item.left,
              width: item.width,
              height: "auto",
              "--flora-r": item.floraR,
              "--flora-x1": item.x1,
              "--flora-y1": item.y1,
              "--flora-x2": item.x2,
              "--flora-y2": item.y2,
              "--flora-x3": item.x3,
              "--flora-y3": item.y3,
              animation: `flora-drift ${item.duration}s ease-in-out ${item.delay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
