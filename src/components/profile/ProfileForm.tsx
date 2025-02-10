
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { LocationFields } from "./LocationFields";
import { DetailFields } from "./DetailFields";
import type { ProfileFormData } from "@/hooks/useProfileForm";

interface ProfileFormProps {
  formData: ProfileFormData;
  loading: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const ProfileForm = ({
  formData,
  loading,
  handleChange,
  handleSubmit,
}: ProfileFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoFields
        formData={formData}
        handleChange={handleChange}
        loading={loading}
      />
      <LocationFields
        formData={formData}
        handleChange={handleChange}
        loading={loading}
      />
      <DetailFields
        formData={formData}
        handleChange={handleChange}
        loading={loading}
      />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        <UserCheck className="mr-2" />
        {loading ? "Enregistrement..." : "Compléter mon profil"}
      </Button>
    </form>
  );
};
