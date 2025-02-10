
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfileForm } from "@/hooks/useProfileForm";

const ProfileCompletion = () => {
  const { formData, loading, handleChange, handleSubmit } = useProfileForm();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">
            Complétez votre profil
          </h2>
          <p className="mt-2 text-muted-foreground">
            Ces informations nous permettront de mieux vous connaître
          </p>
        </div>

        <ProfileForm
          formData={formData}
          loading={loading}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ProfileCompletion;
