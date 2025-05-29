
import { useState, useEffect } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
  personalDescription: string;
  skills: string;
}

export const useProfileData = () => {
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
    skills: "",
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // TODO: The current skills handling (join with ", " for display, split by "," on submit)
  // means individual skills cannot contain commas. This could be improved with a tag-based input UI
  // or by using a different, less common delimiter if plain text input is maintained.
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user?.email || "",
        city: profile.city || "",
        country: profile.country || "",
        personalDescription: profile.personal_description || "",
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills || "",
      });
    }
  }, [profile, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier votre profil",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          city: formData.city,
          country: formData.country,
          personal_description: formData.personalDescription,
          skills: formData.skills.split(",").map((skill) => skill.trim()),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été modifié avec succès",
      });
    } catch (error: PostgrestError) {
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
    profileLoading,
    handleChange,
    handleSubmit,
  };
};
