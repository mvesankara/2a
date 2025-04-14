
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { User, ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

const UserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    } catch (error: any) {
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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Mon Profil</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {profileLoading ? (
          <div className="flex justify-center">
            <div className="animate-pulse w-full max-w-3xl">
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      Prénom
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
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
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      Ville
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
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
                    rows={4}
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
                    disabled={loading}
                    placeholder="Séparées par des virgules"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    "Enregistrement..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les modifications
                    </>
                  )}
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statut d'adhésion</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Adhésion non active
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/payment")}
                >
                  Devenir adhérent(e)
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
