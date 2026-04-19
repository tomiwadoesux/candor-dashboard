"use client";

import { useEffect, useRef, useState } from "react";

function niceMax(v) {
  if (v <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / mag;
  const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
  return step * mag;
}

/**
 * BarChart — vertical bars, can be stacked or grouped.
 * data: [{ label, values: [...] }]
 * series: [{ key, label, color }]
 */
export function BarChart({
  data,
  series,
  height = 220,
  stacked = false,
  formatValue = (v) => v,
}) {
  const wrapRef = useRef(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(Math.max(320, e.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padL = 44;
  const padR = 16;
  const padT = 14;
  const padB = 28;
  const innerW = Math.max(1, w - padL - padR);
  const innerH = Math.max(1, height - padT - padB);

  const max = niceMax(
    stacked
      ? Math.max(...data.map((d) => d.values.reduce((a, b) => a + b, 0)))
      : Math.max(...data.flatMap((d) => d.values))
  );

  const bandW = innerW / data.length;
  const gap = bandW * 0.22;
  const groupW = bandW - gap;
  const barW = stacked ? groupW : groupW / series.length;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        width="100%"
        height={height}
        className="block overflow-visible"
      >
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={padL + innerW}
              y1={padT + innerH * (1 - g)}
              y2={padT + innerH * (1 - g)}
              stroke="currentColor"
              className="text-border/60"
              strokeWidth="1"
              strokeDasharray={g === 0 ? "0" : "2 4"}
            />
            <text
              x={padL - 8}
              y={padT + innerH * (1 - g) + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {formatValue(Math.round(max * g))}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const every = Math.max(1, Math.ceil(data.length / 12));
          if (i % every !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={padL + bandW * i + bandW / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9.5px] uppercase tracking-[0.1em]"
            >
              {d.label}
            </text>
          );
        })}

        {data.map((d, i) => {
          let stackY = padT + innerH;
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {series.map((s, si) => {
                const v = d.values[si] || 0;
                const h = (v / max) * innerH;
                if (stacked) {
                  const y = stackY - h;
                  stackY = y;
                  return (
                    <rect
                      key={s.key || si}
                      x={padL + bandW * i + gap / 2}
                      y={y}
                      width={barW}
                      height={h}
                      rx={2}
                      fill={s.color}
                      opacity={hover === null || hover === i ? 1 : 0.55}
                      style={{
                        transformOrigin: `${padL + bandW * i + groupW / 2}px ${padT + innerH}px`,
                        animation: `bar-grow 700ms ${50 * i}ms cubic-bezier(0.22,0.61,0.36,1) both`,
                      }}
                    />
                  );
                }
                return (
                  <rect
                    key={s.key || si}
                    x={padL + bandW * i + gap / 2 + barW * si}
                    y={padT + innerH - h}
                    width={barW - 1.5}
                    height={h}
                    rx={2}
                    fill={s.color}
                    opacity={hover === null || hover === i ? 1 : 0.55}
                    style={{
                      transformOrigin: `${padL + bandW * i + groupW / 2}px ${padT + innerH}px`,
                      animation: `bar-grow 700ms ${50 * i}ms cubic-bezier(0.22,0.61,0.36,1) both`,
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-lift)]"
          style={{
            left: Math.min(w - 160, Math.max(0, padL + bandW * hover + bandW / 2 - 70)),
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {data[hover].label}
          </div>
          {series.map((s, si) => (
            <div key={s.key || si} className="mt-0.5 flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="ml-auto font-mono text-foreground">
                {formatValue(data[hover].values[si])}
              </span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes bar-grow {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }
        rect {
          transform-box: fill-box;
        }
      `}</style>
    </div>
  );
}
