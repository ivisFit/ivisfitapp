import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type AlimentacionStepHeaderProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function AlimentacionStepHeader({
  icon,
  title,
  description,
  aside,
}: AlimentacionStepHeaderProps) {
  return (
    <header className="ap-step-header">
      <span className="ap-step-header__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="ap-step-header__text">
        <h2 className="ap-step-header__title">{title}</h2>
        {description ? (
          <p className="ap-step-header__description">{description}</p>
        ) : null}
      </div>
      {aside ? <div className="ap-step-header__aside">{aside}</div> : null}
    </header>
  );
}

type AlimentacionStepFooterProps = {
  backHref?: string;
  backLabel?: string;
  onBackClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  hint?: ReactNode;
  children: ReactNode;
};

export function AlimentacionStepFooter({
  backHref,
  backLabel = "Volver",
  onBackClick,
  hint,
  children,
}: AlimentacionStepFooterProps) {
  return (
    <footer className="ap-footer">
      <div className="ap-footer__back">
        {backHref ? (
          <Link
            className="btn btn--ghost ap-footer__back-link"
            href={backHref}
            onClick={onBackClick}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        ) : null}
      </div>
      {hint ? <p className="ap-footer__hint">{hint}</p> : null}
      <div className="ap-footer__next">{children}</div>
    </footer>
  );
}
