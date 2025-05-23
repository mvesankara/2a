
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface définissant les propriétés du composant SignUpForm
 */
interface SignUpFormProps {
  onToggleMode: () => void;
}

/**
 * Formulaire d'inscription
 * Permet à un nouvel utilisateur de créer un compte
 * @param props - Les propriétés du composant
 * @returns Le composant SignUpForm
 */
const SignUpForm = ({ onToggleMode }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Gère la soumission du formulaire d'inscription
   * @param e - L'événement de soumission du formulaire
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Attempting to sign up...");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      console.log("Sign up response:", { data, error: signUpError });

      if (signUpError) throw signUpError;
      
      if (data?.user) {
        await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: `${firstName} ${lastName}`,
        role: "adherent" // Changé de "membre" à "adherent" pour correspondre à l'enum
      });
    }   


      toast({
        title: "Inscription réussie",
        description: "Bienvenue ! Vous pouvez maintenant vous connecter.",
      });
      onToggleMode();
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = "Une erreur est survenue";
      if (error.message.includes("User already registered")) {
        errorMessage = "Cet email est déjà utilisé. Veuillez vous connecter.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            Prénom
          </label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="mt-1"
            placeholder="John"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Nom
          </label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="mt-1"
            placeholder="Doe"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            placeholder="vous@exemple.com"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        <UserPlus className="mr-2" />
        {loading ? "Inscription..." : "S'inscrire"}
      </Button>

      <div className="flex flex-col space-y-2 text-center text-sm">
        <Button
          variant="link"
          type="button"
          onClick={onToggleMode}
          className="p-0 h-auto font-semibold"
          disabled={loading}
        >
          Déjà un compte ? Se connecter
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
