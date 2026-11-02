"use client";

import { browserImageUrl } from "@/lib/browser-image-url";
import { getInitials } from "@/lib/display-name";
import "./UserAvatar.css";

interface UserAvatarProps {
  name: string;
  photoUrl?: string | null;
  className?: string;
}

export function UserAvatar({
  name,
  photoUrl = null,
  className = "user-avatar",
}: UserAvatarProps) {
  return (
    <span className={className} aria-hidden>
      {photoUrl ? (
        <img
          src={browserImageUrl(photoUrl)}
          alt=""
          className="user-avatar__img"
          loading="lazy"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
