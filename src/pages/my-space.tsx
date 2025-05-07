import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Pencil, Trash2, Calendar, Users, ProjectorIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ProfileLayout } from "@/components/profile/ProfileLayout"

/**
 * Interface pour le type Projet
 */
interface Project {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  user_id: string | null;
}

/**
 * Composant Mon Espace
 * Permet à l'utilisateur de gérer son profil et ses projets personnels
 */
const MySpace = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [status, setStatus] = useState("draft")
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  /**
   * Effet pour vérifier l'authentification et charger les données
   * si l'utilisateur est connecté
   */
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true })
    } else {
      fetchProfile()
      fetchProjects()
    }
  }, [user, navigate])

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  const fetchProfile = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single()

    if (error) console.error("Erreur profil:", error)
    else setProfile(data)
    setLoading(false)
  }

  /**
   * Récupère les projets de l'utilisateur connecté
   * avec application du filtre de statut si actif
   */
  const fetchProjects = async () => {
    let query = supabase
      .from("personal_projects")
      .select("*")
      .eq("user_id", user?.id)
      
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur projets:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos projets",
        variant: "destructive",
      })
    } else {
      setProjects(data || [])
    }
  }

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
    })
    navigate("/", { replace: true })
  }

  /**
   * Gère la soumission du formulaire de projet
   * Crée un nouveau projet ou met à jour un projet existant
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du projet est requis",
        variant: "destructive",
      })
      return
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
            deadline: deadline || null
          })
          .eq("id", currentProjectId)

        if (error) throw error

        toast({
          title: "Projet mis à jour",
          description: "Votre projet a été modifié avec succès.",
        })
      } else {
        // Création d'un nouveau projet
        const { error } = await supabase.from("personal_projects").insert({
          user_id: user?.id,
          title,
          description,
          status,
          deadline: deadline || null
        })

        if (error) throw error

        toast({
          title: "Projet créé",
          description: "Votre projet a été enregistré avec succès.",
        })
      }

      // Réinitialisation du formulaire et rechargement des projets
      resetForm()
      fetchProjects()
      
    } catch (error: any) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  /**
   * Réinitialise le formulaire de projet
   */
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDeadline("")
    setStatus("draft")
    setIsEditMode(false)
    setCurrentProjectId(null)
  }

  /**
   * Charge les données d'un projet dans le formulaire pour édition
   */
  const handleEditProject = (project: Project) => {
    setTitle(project.title || "")
    setDescription(project.description || "")
    setStatus(project.status || "draft")
    setDeadline(project.deadline || "")
    setIsEditMode(true)
    setCurrentProjectId(project.id)
    
    // Scroll jusqu'au formulaire
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /**
   * Supprime un projet
   */
  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personal_projects")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès.",
      })
      
      fetchProjects()
      
    } catch (error: any) {
      console.error("Erreur de suppression:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le projet",
        variant: "destructive",
      })
    }
  }

  /**
   * Applique le filtre de statut et recharge les projets
   */
  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setTimeout(() => fetchProjects(), 100)
  }

  /**
   * Converti la date au format local
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  }

  /**
   * Retourne une classe CSS pour le statut du projet
   */
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
  }

  /**
   * Traduit le statut en français
   */
  const translateStatus = (status: string | null) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "in_progress": return "En cours";
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return status;
    }
  }

  if (!user) return null;

  return (
    <ProfileLayout loading={loading}>
      <div className="grid grid-cols-1 gap-8">
        {/* Section Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Mon Profil</CardTitle>
            <CardDescription>Vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom:</p>
                <p className="font-medium">{profile?.full_name || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rôle:</p>
                <p className="font-medium capitalize">{profile?.role || "Non défini"}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate("/profile")}>Modifier mon profil</Button>
          </CardFooter>
        </Card>

        {/* Formulaire de projet */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Modifier le projet" : "Créer un projet"}</CardTitle>
            <CardDescription>
              {isEditMode ? "Modifiez les détails de votre projet" : "Ajoutez un nouveau projet à votre espace"}
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
                  <Button type="button" variant="outline" onClick={resetForm}>
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

        {/* Liste des projets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Mes Projets</CardTitle>
              <CardDescription>Liste de tous vos projets</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleFilterChange}>
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
                        <TableCell>{project.deadline ? formatDate(project.deadline) : "Non définie"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProject(project)}
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

        {/* Bouton de déconnexion */}
        <div className="flex justify-end">
          <Button onClick={handleLogout} variant="outline">
            Se déconnecter
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default MySpace;
