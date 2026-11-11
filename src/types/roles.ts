export enum UserRole {
  ADHERENT = "adherent",
  MEMBRE_BUREAU = "membre_bureau",
  SYMPATHISANT = "sympathisant",
  ADMINISTRATEUR = "administrateur",
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMINISTRATEUR]: ["*"],
  [UserRole.MEMBRE_BUREAU]: [],
  [UserRole.ADHERENT]: [],
  [UserRole.SYMPATHISANT]: [],
};
