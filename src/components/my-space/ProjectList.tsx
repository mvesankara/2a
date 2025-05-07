
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Trash2, ProjectorIcon, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  user_id: string | null;
}

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onProjectsChange: () => void;
  statusFilter: string;
  onFilterChange: (value: string) => void;
}

const ProjectList = ({
  projects,
  onEdit,
  onProjectsChange,
  statusFilter,
  onFilterChange,
}: ProjectListProps) => {
  const { toast } = useToast();
  
  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personal_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès.",
      });
      
      onProjectsChange();
      
    } catch (error: any) {
      console.error("Erreur de suppression:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le projet",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const getStatusClass = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 px-2 py-1 rounded";
      case "in_progress":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
      case "cancelled":
        return "bg-red-100 text-red-800 px-2 py-1 rounded";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    }
  };

  const translateStatus = (status: string | null) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "in_progress": return "En cours";
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Mes Projets</CardTitle>
          <CardDescription>Liste de tous vos projets</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminés</SelectItem>
              <SelectItem value="cancelled">Annulés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <ProjectorIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground">
              {statusFilter === "all"
                ? "Aucun projet pour l'instant."
                : `Aucun projet avec le statut "${translateStatus(statusFilter)}".`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Date limite</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <span className={getStatusClass(project.status)}>
                        {translateStatus(project.status)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(project.created_at)}</TableCell>
                    <TableCell>
                      {project.deadline ? formatDate(project.deadline) : "Non définie"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmer la suppression</DialogTitle>
                              <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer le projet "{project.title}" ?
                                Cette action est irréversible.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                Supprimer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectList;
