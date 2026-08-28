"use client";

import { getInitials } from "@/lib/display-name";

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
          src={photoUrl}
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
