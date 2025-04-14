
import { User } from "lucide-react";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
}

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
