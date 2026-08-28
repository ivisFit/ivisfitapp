"use client";

import type { CSSProperties, ElementType } from "react";

type IconProps = {
  icon: ElementType<{ style?: CSSProperties }>;
};

export const Icon = ({ icon }: IconProps) => {
  const IconComponent = icon;

  return (
    <div
      style={{
        width: "4rem",
        height: "4rem",
        background: "linear-gradient(135deg, #FFD700, #FFA500)",
        borderRadius: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1.5rem auto",
        boxShadow: "0 0 10px rgba(255, 215, 0, 0.6)",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <IconComponent
        style={{
          width: "2rem",
          height: "2rem",
          color: "var(--primary-foreground)",
        }}
      />
    </div>
  );
};
