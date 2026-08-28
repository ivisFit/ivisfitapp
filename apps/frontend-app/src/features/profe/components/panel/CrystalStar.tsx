import { memo } from "react";

type CrystalStarProps = {
  size?: number;
  className?: string;
};

export const CrystalStar = memo(function CrystalStar({ size = 22, className = "" }: CrystalStarProps) {
  return (
    <svg
      className={`profe-dashboard__crystal-star ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <defs>
        <linearGradient id="crystal-star-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="45%" stopColor="#f5c518" />
          <stop offset="100%" stopColor="#c47a1a" />
        </linearGradient>
        <linearGradient id="crystal-star-shine" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="rgb(255 255 255 / 90%)" />
          <stop offset="100%" stopColor="rgb(255 255 255 / 0%)" />
        </linearGradient>
        <filter id="crystal-star-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f5c518" floodOpacity="0.7" />
        </filter>
      </defs>
      <polygon
        points="12,2 15,9 22,9.5 16.5,14 18.5,21 12,17.5 5.5,21 7.5,14 2,9.5 9,9"
        fill="url(#crystal-star-face)"
        filter="url(#crystal-star-glow)"
      />
      <polygon
        points="12,2 15,9 12,10 9,9"
        fill="url(#crystal-star-shine)"
        opacity="0.55"
      />
      <path
        d="M12 10 L16.5 14 L12 17.5 L7.5 14 Z"
        fill="rgb(255 255 255 / 12%)"
      />
    </svg>
  );
});
