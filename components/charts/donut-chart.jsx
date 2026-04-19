"use client";

import { useEffect, useState } from "react";

/**
 * DonutChart — split total into slices. data = [{ label, value, color }].
 */
export function DonutChart({ data, size = 200, thickness = 26, formatValue = (v) => v }) {
  const [hover, setHover] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - thickness / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map((d) => {
    const frac = d.value / total;
    const len = frac * circumference;
    const slice = {
      ...d,
      len,
      dashoffset: -offset,
      frac,
    };
    offset += len;
    return slice;
  });

  const active = hover !== null ? slices[hover] : null;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block -rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth={thickness}
          />
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={
                mounted ? `${s.len} ${circumference - s.len}` : `0 ${circumference}`
              }
              strokeDashoffset={s.dashoffset}
              strokeLinecap="butt"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                transition: `stroke-dasharray 900ms cubic-bezier(0.22,0.61,0.36,1) ${i * 80}ms, opacity 200ms`,
                opacity: hover === null || hover === i ? 1 : 0.4,
              }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            {active ? active.label : "Total"}
          </div>
          <div className="mt-1 font-serif text-[22px] font-light leading-none tracking-[-0.02em] text-foreground">
            {active ? formatValue(active.value) : formatValue(total)}
          </div>
          {active && (
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {Math.round(active.frac * 100)}%
            </div>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-1.5">
        {data.map((d, i) => (
          <li
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="group flex items-center gap-2 text-[12px]"
          >
            <span
              className="h-2 w-2 rounded-full transition-transform group-hover:scale-125"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-mono text-foreground">
              {formatValue(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
