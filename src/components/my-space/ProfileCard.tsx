
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  profile: {
    email?: string;
    full_name?: string;
    role?: string;
  } | null;
  loading: boolean;
}

const ProfileCard = ({ profile, loading }: ProfileCardProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-6 w-32 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-gray-200 h-4 w-48 rounded"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Mon Profil</CardTitle>
        <CardDescription>Vos informations personnelles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="font-medium">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nom:</p>
            <p className="font-medium">{profile?.full_name || "Non renseigné"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rôle:</p>
            <p className="font-medium capitalize">{profile?.role || "Non défini"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => navigate("/profile")}>
          Modifier mon profil
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
