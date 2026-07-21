"use client";

import { useEffect, useRef, useState } from "react";

function niceMax(v) {
  if (v <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / mag;
  const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
  return step * mag;
}

// Vertical bar with the data-end rounded and the baseline end square.
function barPath(x, y, w, h, up = true) {
  const r = Math.min(3, w / 2, h);
  if (h <= 0.5) return "";
  if (!up) return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  return [
    `M ${x} ${y + h}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `H ${x + w - r}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `V ${y + h}`,
    "Z",
  ].join(" ");
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
  const gap = bandW * 0.28;
  const groupW = bandW - gap;
  const barW = stacked ? groupW : (groupW - 2 * (series.length - 1)) / series.length;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        width="100%"
        height={height}
        className="block overflow-visible"
        role="img"
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
              className={g === 0 ? "text-border" : "text-border/50"}
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={padT + innerH * (1 - g) + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[10px]"
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
              className="fill-muted-foreground font-mono text-[10px]"
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
              {/* invisible hover target across the whole band */}
              <rect
                x={padL + bandW * i}
                y={padT}
                width={bandW}
                height={innerH}
                fill="transparent"
              />
              {series.map((s, si) => {
                const v = d.values[si] || 0;
                const h = (v / max) * innerH;
                if (stacked) {
                  const isTop = si === series.length - 1;
                  const segH = Math.max(0, h - (isTop ? 0 : 2));
                  const y = stackY - h;
                  stackY = y;
                  return (
                    <path
                      key={s.key || si}
                      d={
                        isTop
                          ? barPath(padL + bandW * i + gap / 2, y, barW, segH)
                          : `M ${padL + bandW * i + gap / 2} ${y + 2} H ${padL + bandW * i + gap / 2 + barW} V ${y + 2 + segH} H ${padL + bandW * i + gap / 2} Z`
                      }
                      fill={s.color}
                      opacity={hover === null || hover === i ? 1 : 0.45}
                      style={{
                        transformOrigin: `${padL + bandW * i + groupW / 2}px ${padT + innerH}px`,
                        animation: `bar-grow 500ms ${30 * i}ms cubic-bezier(0.23,1,0.32,1) both`,
                      }}
                    />
                  );
                }
                return (
                  <path
                    key={s.key || si}
                    d={barPath(
                      padL + bandW * i + gap / 2 + (barW + 2) * si,
                      padT + innerH - h,
                      barW,
                      h
                    )}
                    fill={s.color}
                    opacity={hover === null || hover === i ? 1 : 0.45}
                    style={{
                      transformOrigin: `${padL + bandW * i + groupW / 2}px ${padT + innerH}px`,
                      animation: `bar-grow 500ms ${30 * i}ms cubic-bezier(0.23,1,0.32,1) both`,
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
          className="pointer-events-none absolute top-2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-lift)]"
          style={{
            left: Math.min(w - 160, Math.max(0, padL + bandW * hover + bandW / 2 - 70)),
          }}
        >
          <div className="font-mono text-[10.5px] text-muted-foreground">
            {data[hover].label}
          </div>
          {series.map((s, si) => (
            <div key={s.key || si} className="mt-0.5 flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="ml-auto pl-3 font-mono text-foreground" data-slot="numeric">
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
        path {
          transform-box: fill-box;
        }
        @media (prefers-reduced-motion: reduce) {
          path {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
}
