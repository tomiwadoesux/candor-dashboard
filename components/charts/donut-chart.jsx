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
  // 2px surface gap between adjacent slices (skipped when only one slice).
  const nonZero = data.filter((d) => d.value > 0).length;
  const gapLen = nonZero > 1 ? 2 : 0;

  let offset = 0;
  const slices = data.map((d) => {
    const frac = d.value / total;
    const len = frac * circumference;
    const slice = {
      ...d,
      len: Math.max(0, len - gapLen),
      dashoffset: -(offset + gapLen / 2),
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
            className="text-muted"
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
              className="motion-reduce:transition-none"
              style={{
                transition: `stroke-dasharray 700ms cubic-bezier(0.23,1,0.32,1) ${i * 60}ms, opacity 180ms`,
                opacity: hover === null || hover === i ? 1 : 0.4,
              }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-medium text-muted-foreground">
            {active ? active.label : "Total"}
          </div>
          <div
            data-slot="numeric"
            className="mt-1 text-[20px] font-medium leading-none tracking-[-0.01em] text-foreground"
          >
            {active ? formatValue(active.value) : formatValue(total)}
          </div>
          {active && (
            <div className="mt-1 font-mono text-[10.5px] text-muted-foreground">
              {Math.round(active.frac * 100)}%
            </div>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-2">
        {data.map((d, i) => (
          <li
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="flex items-center gap-2 text-[12.5px]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate text-muted-foreground">{d.label}</span>
            <span className="ml-auto pl-3 font-mono text-foreground" data-slot="numeric">
              {formatValue(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
