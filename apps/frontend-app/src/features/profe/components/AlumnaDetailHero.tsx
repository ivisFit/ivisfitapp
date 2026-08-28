"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { getInitials } from "@/lib/display-name";
import { profeRoutes } from "@/routes/paths";
import type { AlumnaDetail } from "@/types/usuario";

function BackIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

type HeroBackdropProps = {
  initials: string | null;
  photoUrl?: string;
  loading: boolean;
};

export function AlumnaDetailHeroBackdrop({ initials, photoUrl, loading }: HeroBackdropProps) {
  return (
    <div className="alumna-detail-hero__backdrop" aria-hidden>
      {loading ? (
        <span className="alumna-detail-hero__initials alumna-detail-hero__initials--placeholder" />
      ) : photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          className="alumna-detail-hero__photo"
          loading="lazy"
        />
      ) : initials ? (
        <span className="alumna-detail-hero__initials">{initials}</span>
      ) : (
        <span className="alumna-detail-hero__initials alumna-detail-hero__initials--placeholder">
          ?
        </span>
      )}
    </div>
  );
}

export function AlumnaDetailHeroNav() {
  return (
    <nav className="alumna-detail-hero__nav" aria-label="Navegación del perfil">
      <Link
        href={profeRoutes.alumnas}
        className="alumna-detail-hero__back"
        aria-label="Volver a alumnas"
      >
        <BackIcon />
      </Link>
      <span className="alumna-detail-hero__title">Perfil de alumna</span>
      <span className="alumna-detail-hero__nav-spacer" aria-hidden />
    </nav>
  );
}

export function AlumnaDetailHeroMobile({
  alumna,
  loading,
}: {
  alumna: AlumnaDetail | null;
  loading: boolean;
}) {
  const heroInitials = alumna ? getInitials(alumna.nombre) : null;
  const heroPhotoUrl = alumna?.fotoPerfil?.url;

  return (
    <>
      <div className="alumna-detail-hero-fixed" aria-hidden>
        <AlumnaDetailHeroBackdrop
          initials={heroInitials}
          photoUrl={heroPhotoUrl}
          loading={loading}
        />
      </div>
      <AlumnaDetailHeroNav />
      <div className="alumna-detail-hero-spacer" aria-hidden />
    </>
  );
}

export function AlumnaDetailHeroDesktop({
  alumna,
}: {
  alumna: AlumnaDetail;
}) {
  const estadoLabel =
    alumna.estadoAdmision === "admitida"
      ? "Admitida"
      : alumna.estadoAdmision === "rechazada"
        ? "Rechazada"
        : "Pendiente";

  return (
    <header className="alumna-detail__header">
      <div className="alumna-detail__header-main">
        <UserAvatar
          name={alumna.nombre}
          photoUrl={alumna.fotoPerfil?.url ?? null}
          className="alumna-detail__avatar"
        />
        <div className="alumna-detail__header-copy">
          <span className="alumna-detail__eyebrow">Perfil de alumna</span>
          <h1>{alumna.nombre}</h1>
          <p className="alumna-detail__header-email">{alumna.email}</p>
          <div className="alumna-detail-body__meta">
            <span
              className={`alumna-detail-badge alumna-detail-badge--${alumna.estadoAdmision}`}
            >
              {estadoLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
