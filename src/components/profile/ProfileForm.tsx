
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

/**
 * Interface définissant la structure des données du formulaire de profil
 */
interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
  personalDescription: string;
  skills: string;
}

/**
 * Interface définissant les propriétés du composant ProfileForm
 */
interface ProfileFormProps {
  formData: ProfileFormData;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

/**
 * Formulaire d'édition du profil utilisateur
 * Permet de modifier les informations personnelles, la localisation et les compétences
 * @param props - Les propriétés du composant
 * @returns Le composant ProfileForm
 */
export const ProfileForm = ({
  formData,
  loading,
  handleChange,
  handleSubmit,
}: ProfileFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            Prénom
          </label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Nom
          </label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          value={formData.email}
          disabled={true}
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          L'email ne peut pas être modifié
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            Ville
          </label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium">
            Pays
          </label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="personalDescription" className="text-sm font-medium">
          Description personnelle
        </label>
        <Textarea
          id="personalDescription"
          name="personalDescription"
          value={formData.personalDescription}
          onChange={handleChange}
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="skills" className="text-sm font-medium">
          Compétences
        </label>
        <Input
          id="skills"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          disabled={loading}
          placeholder="Séparées par des virgules"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          "Enregistrement..."
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder les modifications
          </>
        )}
      </Button>
    </form>
  );
};
