export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ["*"],
  [UserRole.MEMBER]: [],
};
