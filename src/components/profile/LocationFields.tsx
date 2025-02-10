
import { Input } from "@/components/ui/input";
import type { ProfileFormData } from "@/hooks/useProfileForm";

interface LocationFieldsProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const LocationFields = ({
  formData,
  handleChange,
  loading,
}: LocationFieldsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="city" className="text-sm font-medium">
          Ville
        </label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
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
          required
          disabled={loading}
        />
      </div>
    </div>
  );
};
