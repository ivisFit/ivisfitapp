import { memo } from "react";

type MetricSparklineProps = {
  data: number[];
  className?: string;
};

const WIDTH = 120;
const HEIGHT = 40;
const PAD = 2;

export const MetricSparkline = memo(function MetricSparkline({
  data,
  className = "",
}: MetricSparklineProps) {
  const values = data.length > 1 ? data : [0, ...data];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * WIDTH;
    const y =
      HEIGHT - PAD - ((value - min) / range) * (HEIGHT - PAD * 2);
    return `${x},${y}`;
  });

  const line = `M${coords.join(" L")}`;
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <svg
      className={`profe-dashboard__metric-sparkline ${className}`.trim()}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(245 197 24 / 30%)" />
          <stop offset="100%" stopColor="rgb(245 197 24 / 0%)" />
        </linearGradient>
        <filter id="sparkline-glow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={area} fill="url(#sparkline-fill)" />
      <path
        d={line}
        fill="none"
        stroke="#f5c518"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sparkline-glow)"
      />
    </svg>
  );
});
