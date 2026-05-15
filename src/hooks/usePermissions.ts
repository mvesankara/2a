"use client";

import { useAuth } from "@/hooks/useAuth";
import { ROLE_PERMISSIONS, UserRole } from "@/types/roles";

export function usePermissions() {
  const { profile } = useAuth();

  const role = (profile?.role as UserRole) ?? null;

  const hasRole = (required: UserRole) => role === required;

  const hasPermission = (permission: string) => {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] ?? [];
    return permissions.includes("*") || permissions.includes(permission);
  };

  return { hasPermission, hasRole, loading: false };
}
