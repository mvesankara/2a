import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"


const MySpace = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true })
    } else {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) console.error("Erreur profil:", error)
        else setProfile(data)
      }

      const fetchProjects = async () => {
        const { data, error } = await supabase
          .from("personal_projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) console.error("Erreur projets:", error)
        else setProjects(data)
      }

      fetchProfile()
      fetchProjects()
    }
  }, [user, navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
    })
    navigate("/", { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Soumission du projet :", { title, description })

    const { error } = await supabase.from("personal_projects").insert({
      user_id: user.id,
      title,
      description,
      status: "draft",
    })

    if (error) {
      console.error("Erreur Supabase :", error)
    } else {
      console.log("Projet enregistré")
      setTitle("")
      setDescription("")
      const { data } = await supabase
        .from("personal_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setProjects(data || [])
    }
  }

  if (!user || !profile) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">Mon espace</h1>
        <p>Email : {profile.email}</p>
        <p>Nom : {profile.full_name}</p>
        <p>Rôle : {profile.role}</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Créer un projet</h2>
          <Input
            placeholder="Titre du projet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button type="submit">Enregistrer</Button>
        </form>

        <div className="mt-10 space-y-4 text-left">
          <h2 className="text-xl font-semibold">Mes projets</h2>
          {projects.length === 0 ? (
            <p className="text-muted-foreground">Aucun projet pour l’instant.</p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="border p-4 rounded-lg">
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p>{p.description}</p>
                <p className="text-sm text-muted-foreground">Statut : {p.status}</p>
              </div>
            ))
          )}
        </div>

        <Button onClick={handleLogout} className="mt-6">
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}

export default MySpace