
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectFormProps {
  userId: string;
  isEditMode: boolean;
  currentProjectId: string | null;
  initialData: {
    title: string;
    description: string;
    status: string;
    deadline: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm = ({
  userId,
  isEditMode,
  currentProjectId,
  initialData,
  onSuccess,
  onCancel,
}: ProjectFormProps) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [deadline, setDeadline] = useState(initialData.deadline);
  const [status, setStatus] = useState(initialData.status);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du projet est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode && currentProjectId) {
        // Mise à jour d'un projet existant
        const { error } = await supabase
          .from("personal_projects")
          .update({
            title,
            description,
            status,
            deadline: deadline || null,
          })
          .eq("id", currentProjectId);

        if (error) throw error;

        toast({
          title: "Projet mis à jour",
          description: "Votre projet a été modifié avec succès.",
        });
      } else {
        // Création d'un nouveau projet
        const { error } = await supabase.from("personal_projects").insert({
          user_id: userId,
          title,
          description,
          status,
          deadline: deadline || null,
        });

        if (error) throw error;

        toast({
          title: "Projet créé",
          description: "Votre projet a été enregistré avec succès.",
        });
      }

      // Réinitialiser le formulaire et recharger les projets
      setTitle("");
      setDescription("");
      setDeadline("");
      setStatus("draft");
      onSuccess();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Modifier le projet" : "Créer un projet"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Modifiez les détails de votre projet"
            : "Ajoutez un nouveau projet à votre espace"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titre du projet
            </label>
            <Input
              id="title"
              placeholder="Titre du projet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Description du projet"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Statut
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">
                Date limite (optionnel)
              </label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {isEditMode && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            <Button type="submit">
              {isEditMode ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
