
import { useState } from "react";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";

interface Project {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  user_id: string | null;
}

interface ProjectsSectionProps {
  projects: Project[];
  userId: string;
  onProjectsChange: () => void;
}

const ProjectsSection = ({
  projects,
  userId,
  onProjectsChange,
}: ProjectsSectionProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("draft");

  const handleEditProject = (project: Project) => {
    setTitle(project.title || "");
    setDescription(project.description || "");
    setStatus(project.status || "draft");
    setDeadline(project.deadline || "");
    setIsEditMode(true);
    setCurrentProjectId(project.id);
    
    // Scroll jusqu'au formulaire
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSuccess = () => {
    // Reset form state
    resetForm();
    // Fetch updated projects
    onProjectsChange();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setStatus("draft");
    setIsEditMode(false);
    setCurrentProjectId(null);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setTimeout(() => onProjectsChange(), 100);
  };

  return (
    <div className="space-y-8">
      <ProjectForm
        userId={userId}
        isEditMode={isEditMode}
        currentProjectId={currentProjectId}
        initialData={{
          title,
          description,
          status,
          deadline,
        }}
        onSuccess={handleFormSuccess}
        onCancel={resetForm}
      />
      
      <ProjectList
        projects={projects}
        onEdit={handleEditProject}
        onProjectsChange={onProjectsChange}
        statusFilter={statusFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default ProjectsSection;
