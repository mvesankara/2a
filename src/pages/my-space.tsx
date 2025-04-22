import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"

const MySpace = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const navigate = useNavigate()

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

      fetchProfile()
    }
  }, [user, navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/", { replace: true })
  }

  if (!user || !profile) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-3xl font-bold">Mon espace</h1>
        <p>Email : {profile.email}</p>
        <p>Nom : {profile.full_name}</p>
        <p>Rôle : {profile.role}</p>

        <Button onClick={handleLogout} className="mt-6">
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}

export default MySpace
