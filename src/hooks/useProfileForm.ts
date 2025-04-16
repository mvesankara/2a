
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Type définissant la structure des données du formulaire de profil
 */
export type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
  personalDescription: string;
  associationContribution: string;
  skills: string;
};

/**
 * Hook personnalisé gérant la logique du formulaire de profil
 * Responsable du chargement des données, des modifications et de la soumission du profil
 * @returns Un objet contenant les données du formulaire, l'état de chargement et les fonctions de gestion
 */
export const useProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
    personalDescription: "",
    associationContribution: "",
    skills: "",
  });

  /**
   * Effect qui charge les données du profil utilisateur depuis Supabase
   * S'exécute une fois au chargement du composant
   */
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
            email: user.email || "",
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

  /**
   * Gère les changements dans les champs du formulaire
   * @param e - L'événement de changement du champ
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Gère la soumission du formulaire
   * Envoie les données mises à jour à Supabase
   * @param e - L'événement de soumission du formulaire
   */
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
          email: formData.email,
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

  return {
    formData,
    loading,
    handleChange,
    handleSubmit,
  };
};
