
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserCheck } from "lucide-react";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    personalDescription: "",
    associationContribution: "",
    skills: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        console.log("Fetching profile data for user:", user.id);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("Profile data received:", profile);
        if (profile) {
          setFormData({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            city: profile.city || "",
            country: profile.country || "",
            personalDescription: profile.personal_description || "",
            associationContribution: profile.association_contribution || "",
            skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
          });
        }
      } catch (error) {
        console.error("Error in loadProfile:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [user, navigate, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.log("No user found during submission");
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour compléter votre profil",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Updating profile for user:", user.id);
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          city: formData.city,
          country: formData.country,
          personal_description: formData.personalDescription,
          association_contribution: formData.associationContribution,
          skills: formData.skills.split(",").map((skill) => skill.trim()),
          status: "pending",
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Profile updated successfully");
      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été complété avec succès",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            <UserCheck className="mr-2" />
            {loading ? "Enregistrement..." : "Compléter mon profil"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;
