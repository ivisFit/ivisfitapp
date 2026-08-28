import { forwardRef, type ReactNode } from "react";
import { AuthBrandLogo } from "@/components/layout/AuthBrandLogo";

interface AuthCardProps {
  title?: ReactNode;
  showBrand?: boolean;
  eyebrow?: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: "default" | "login";
}

export const AuthCard = forwardRef<HTMLDivElement, AuthCardProps>(
  function AuthCard(
    {
      title,
      showBrand = false,
      eyebrow,
      subtitle,
      children,
      footer,
      className = "",
      variant = "default",
    },
    ref,
  ) {
    const cardClass = [
      "auth-card",
      variant === "login" ? "auth-card--login" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={cardClass}>
        {showBrand ? (
          <h1 className="auth-card__brand">
            <AuthBrandLogo />
          </h1>
        ) : null}
        {eyebrow ? <p className="auth-card__eyebrow">{eyebrow}</p> : null}
        {title ? (
          showBrand ? (
            <h2 className="auth-card__title">{title}</h2>
          ) : (
            <h1 className="auth-card__title">{title}</h1>
          )
        ) : null}
        <p className="auth-card__subtitle">{subtitle}</p>
        {children}
        {footer ? <div className="auth-card__footer">{footer}</div> : null}
      </div>
    );
  },
);
