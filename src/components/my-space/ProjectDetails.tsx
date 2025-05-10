
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, ClockIcon, CheckCircleIcon, PenLineIcon } from "lucide-react";

interface Project {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  user_id: string | null;
}

interface ProjectDetailsProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const ProjectDetails = ({ project, isOpen, onClose, onEdit }: ProjectDetailsProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const translateStatus = (status: string | null) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "in_progress": return "En cours";
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return status || "Inconnu";
    }
  };

  const getStatusColorClass = (status: string | null) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in_progress": return "text-blue-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{project.title}</DialogTitle>
        </DialogHeader>
        
        {/* Statut */}
        <div className={`flex items-center gap-2 ${getStatusColorClass(project.status)}`}>
          <CheckCircleIcon className="h-4 w-4" />
          <span className="font-medium">{translateStatus(project.status)}</span>
        </div>
        
        {/* Description */}
        {project.description && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{project.description}</p>
          </div>
        )}
        
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Date de création</p>
              <p className="text-sm font-medium">{formatDate(project.created_at)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Date limite</p>
              <p className="text-sm font-medium">
                {project.deadline ? formatDate(project.deadline) : "Non définie"}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start gap-2 pt-4">
          <Button 
            variant="default" 
            onClick={onEdit}
            className="flex items-center gap-1"
          >
            <PenLineIcon className="h-4 w-4" />
            <span>Modifier</span>
          </Button>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetails;
