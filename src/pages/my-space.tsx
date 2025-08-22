import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MySpace = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    city: "",
    country: "",
    personal_description: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        personal_description: profile.personal_description ?? "",
      });
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (values: typeof formData) => {
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Profil mis a jour" });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });
    if (uploadError) {
      toast({
        title: "Erreur",
        description: uploadError.message,
        variant: "destructive",
      });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    setAvatarUrl(publicUrl);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      toast({
        title: "Erreur",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Avatar mis a jour" });
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Mon profil</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium">
              Avatar
            </label>
            <div className="flex items-center space-x-4 mt-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>
                  {(formData.first_name?.[0] || "") +
                    (formData.last_name?.[0] || "")}
                </AvatarFallback>
              </Avatar>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium">
              Prénom
            </label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium">
              Nom
            </label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium">
                Ville
              </label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium">
                Pays
              </label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="personal_description"
              className="block text-sm font-medium"
            >
              Description personnelle
            </label>
            <Textarea
              id="personal_description"
              name="personal_description"
              value={formData.personal_description}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" disabled={updateProfile.isLoading}>
            Enregistrer
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default MySpace;
