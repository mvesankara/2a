
import { Card } from "@/components/ui/card";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { MembershipStatus } from "@/components/profile/MembershipStatus";
import { useProfileData } from "@/hooks/useProfileData";

/**
 * Page du profil utilisateur
 * Affiche et permet de modifier les informations de l'utilisateur
 * Indique également le statut d'adhésion
 * @returns Le composant UserProfile
 */
const UserProfile = () => {
  const { formData, loading, profileLoading, handleChange, handleSubmit } = useProfileData();

  return (
    <ProfileLayout loading={profileLoading}>
      <Card className="p-6 mb-6">
        <ProfileHeader 
          firstName={formData.firstName} 
          lastName={formData.lastName} 
          email={formData.email} 
        />
        
        <ProfileForm 
          formData={formData}
          loading={loading}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statut d'adhésion</h3>
        <MembershipStatus />
      </Card>
    </ProfileLayout>
  );
};

export default UserProfile;
