"use client";

import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser, UserRole } from "@/types/auth";
import { getFirstName } from "@/lib/display-name";

interface UserGreetingProps {
  className?: string;
  frozenUser?: AuthUser | undefined;
}

function getRoleLabel(role: UserRole): string {
  return role === "profe" ? "Profesora" : "Alumna";
}

export function UserGreeting({ className = "", frozenUser }: UserGreetingProps) {
  const { user: authUser } = useAuth();
  const user = frozenUser ?? authUser;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;
  if (!frozenUser && !mounted) return null;

  const firstName = getFirstName(user.name);

  return (
    <div className={`app-user-greeting ${className}`.trim()}>
      <div className="app-user-greeting__avatar-wrap">
        <UserAvatar
          name={user.name}
          photoUrl={user.photoUrl ?? null}
          className="app-user-greeting__avatar"
        />
        <span className="app-user-greeting__status" aria-hidden />
      </div>
      <div className="app-user-greeting__content">
        <p className="app-user-greeting__text">
          <span className="app-user-greeting__hi">Hola </span>
          <span className="app-user-greeting__name">{firstName}</span>
          <span className="app-user-greeting__wave"> 👋</span>
        </p>
        {user.email ? (
          <span className="app-user-greeting__email">{user.email}</span>
        ) : null}
        <span className="app-user-greeting__role">{getRoleLabel(user.role)}</span>
      </div>
    </div>
  );
}
