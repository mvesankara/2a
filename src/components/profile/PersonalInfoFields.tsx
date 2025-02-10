
import { Input } from "@/components/ui/input";
import type { ProfileFormData } from "@/hooks/useProfileForm";

interface PersonalInfoFieldsProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const PersonalInfoFields = ({
  formData,
  handleChange,
  loading,
}: PersonalInfoFieldsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="firstName" className="text-sm font-medium">
          Prénom
        </label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
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
          required
          disabled={loading}
        />
      </div>
    </div>
  );
};
