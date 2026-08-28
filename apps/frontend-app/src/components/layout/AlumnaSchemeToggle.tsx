"use client";

import { Moon, Sun } from "lucide-react";
import { useColorScheme } from "@/context/ColorSchemeContext";

type AlumnaSchemeToggleProps = {
  className?: string;
};

export function AlumnaSchemeToggle({ className }: AlumnaSchemeToggleProps) {
  const { scheme, toggleScheme } = useColorScheme();
  const isLight = scheme === "light";

  return (
    <button
      type="button"
      className={["alumna-scheme-toggle", className].filter(Boolean).join(" ")}
      onClick={toggleScheme}
      aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
    >
      <span className="alumna-scheme-toggle__stack" aria-hidden>
        <Sun
          size={18}
          className={
            isLight
              ? "alumna-scheme-toggle__glyph"
              : "alumna-scheme-toggle__glyph is-active"
          }
        />
        <Moon
          size={18}
          className={
            isLight
              ? "alumna-scheme-toggle__glyph is-active"
              : "alumna-scheme-toggle__glyph"
          }
        />
      </span>
    </button>
  );
}

export function AlumnaSchemeToolbar() {
  return (
    <div className="alumna-scheme-toolbar">
      <AlumnaSchemeToggle />
    </div>
  );
}
