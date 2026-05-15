"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api";

export default function MySpacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    personalDescription: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    enabled: !!user,
    queryFn: () => profileApi.get(),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        personalDescription: profile.personalDescription ?? "",
      });
      setAvatarUrl(profile.avatarUrl ?? null);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: () => profileApi.update(formData),
    onSuccess: () => {
      toast({ title: "Profil mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: unknown) => {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { avatarUrl: url } = await profileApi.uploadAvatar(file);
      setAvatarUrl(url);
      toast({ title: "Avatar mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Échec de l'upload",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate();
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Mon profil</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium">Avatar</label>
            <div className="flex items-center space-x-4 mt-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>
                  {(formData.firstName?.[0] ?? "") + (formData.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
              <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">Prénom</label>
            <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">Nom</label>
            <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium">Ville</label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium">Pays</label>
              <Input id="country" name="country" value={formData.country} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label htmlFor="personalDescription" className="block text-sm font-medium">
              Description personnelle
            </label>
            <Textarea
              id="personalDescription"
              name="personalDescription"
              value={formData.personalDescription}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" disabled={updateProfile.isPending}>
            Enregistrer
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
