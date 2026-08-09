"use client";

/** Inline SVG sparkline — no charting dependency. */
export default function Spark({
  data,
  color = "#4F46E5",
  w = 240,
  h = 80,
  fill,
  axis,
}: {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
  axis?: boolean;
}) {
  if (!data || !data.length) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const padX = 8, padY = 8;
  const innerW = w - padX * 2, innerH = h - padY * 2;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * innerW + padX;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const areaPath = path + ` L ${pts[pts.length - 1][0].toFixed(1)} ${h - padY} L ${pts[0][0].toFixed(1)} ${h - padY} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {axis && [0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={padX} x2={w - padX} y1={padY + innerH * p} y2={padY + innerH * p}
          stroke="var(--border-subtle)" strokeDasharray="2 3" />
      ))}
      {fill && <path d={areaPath} fill={color + "18"} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => i === pts.length - 1 ?
        <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" /> : null)}
    </svg>
  );
}
