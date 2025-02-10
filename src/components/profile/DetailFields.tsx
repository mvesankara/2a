
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileFormData } from "@/hooks/useProfileForm";

interface DetailFieldsProps {
  formData: ProfileFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  loading: boolean;
}

export const DetailFields = ({
  formData,
  handleChange,
  loading,
}: DetailFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="personalDescription" className="text-sm font-medium">
          Description personnelle
        </label>
        <Textarea
          id="personalDescription"
          name="personalDescription"
          value={formData.personalDescription}
          onChange={handleChange}
          placeholder="Parlez-nous un peu de vous..."
          className="min-h-[100px]"
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
          placeholder="Ex: communication, gestion de projet, design (séparées par des virgules)"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="associationContribution"
          className="text-sm font-medium"
        >
          Comment souhaitez-vous contribuer à l'association ?
        </label>
        <Textarea
          id="associationContribution"
          name="associationContribution"
          value={formData.associationContribution}
          onChange={handleChange}
          placeholder="Décrivez comment vous aimeriez participer..."
          className="min-h-[100px]"
          disabled={loading}
        />
      </div>
    </>
  );
};
