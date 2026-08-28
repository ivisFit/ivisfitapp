import type { ReactNode } from "react";

type IconProps = {
  size?: number | undefined;
  className?: string | undefined;
};

function ActionIconSvg({
  size = 20,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function VideoPlayIcon({ size = 20, className }: IconProps) {
  return (
    <ActionIconSvg size={size} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="m10 8.5 5.5 3.5-5.5 3.5V8.5Z" fill="currentColor" stroke="none" />
    </ActionIconSvg>
  );
}

export function RestTimerIcon({ size = 20, className }: IconProps) {
  return (
    <ActionIconSvg size={size} className={className}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4.5l2.75 1.75" />
      <path d="M9 3h6" />
      <path d="M12 3v2" />
    </ActionIconSvg>
  );
}
