"use client";

import { useEffect, useRef, useState } from "react";

// Smooth path through points using a cardinal spline with tension 0.5.
function smoothPath(points) {
  if (points.length === 0) return "";
  if (points.length < 2) return `M ${points[0].x} ${points[0].y}`;
  const d = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );
  }
  return d.join(" ");
}

function niceMax(v) {
  if (v <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / mag;
  const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
  return step * mag;
}

/**
 * LineChart — crisp, editorial SVG line chart with an animated reveal and
 * a hover scrubber. Accepts one or more series against a shared x-axis.
 *
 * props.data: [{ label, values: [n, n, n...] }]  (one row per x tick)
 * props.series: [{ key, label, color, fill?: bool }]  — key is the index into values
 * props.height, props.formatValue
 */
export function LineChart({
  data,
  series,
  height = 220,
  formatValue = (v) => v,
  showGrid = true,
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

  const allValues = data.flatMap((d) =>
    series.map((s, si) => d.values[si])
  );
  const max = niceMax(Math.max(...allValues));
  const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;

  function xFor(i) {
    return padL + i * xStep;
  }
  function yFor(v) {
    return padT + innerH - (v / max) * innerH;
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        width="100%"
        height={height}
        className="block overflow-visible"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const localX = ((e.clientX - rect.left) / rect.width) * w;
          if (localX < padL || localX > padL + innerW) {
            setHover(null);
            return;
          }
          const idx = Math.round((localX - padL) / xStep);
          const clamped = Math.max(0, Math.min(data.length - 1, idx));
          setHover(clamped);
        }}
        onMouseLeave={() => setHover(null)}
      >
        {/* grid */}
        {showGrid &&
          gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={padL}
                x2={padL + innerW}
                y1={padT + innerH * (1 - g)}
                y2={padT + innerH * (1 - g)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/60"
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

        {/* x labels */}
        {data.map((d, i) => {
          const every = Math.max(1, Math.ceil(data.length / 10));
          if (i % every !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={xFor(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9.5px] uppercase tracking-[0.1em]"
            >
              {d.label}
            </text>
          );
        })}

        {/* series */}
        {series.map((s, si) => {
          const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d.values[si] || 0) }));
          const path = smoothPath(pts);
          const area =
            s.fill && pts.length > 1
              ? `${path} L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`
              : "";
          return (
            <g key={s.key || si}>
              {area && (
                <path
                  d={area}
                  fill={s.color}
                  fillOpacity="0.10"
                />
              )}
              <path
                d={path}
                fill="none"
                stroke={s.color}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{
                  animation: "chart-draw 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards",
                }}
              />
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hover === i ? 3.5 : 0}
                  fill="var(--background)"
                  stroke={s.color}
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              ))}
            </g>
          );
        })}

        {/* scrubber */}
        {hover !== null && (
          <g>
            <line
              x1={xFor(hover)}
              x2={xFor(hover)}
              y1={padT}
              y2={padT + innerH}
              stroke="currentColor"
              className="text-foreground/30"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-lift)]"
          style={{
            left: Math.min(w - 160, Math.max(0, xFor(hover) - 70)),
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
        @keyframes chart-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
