
import { User } from "lucide-react";

/**
 * Interface définissant les propriétés du composant ProfileHeader
 */
interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Composant affichant l'en-tête du profil utilisateur
 * Montre le nom, prénom et email de l'utilisateur
 * @param props - Les propriétés du composant
 * @returns Le composant ProfileHeader
 */
export const ProfileHeader = ({ firstName, lastName, email }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-primary/10 p-4 rounded-full">
        <User className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">
          {firstName} {lastName}
        </h2>
        <p className="text-muted-foreground">{email}</p>
      </div>
    </div>
  );
};
