// src/pages/my-space.tsx
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const MySpace = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true })
    }
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-3xl font-bold">Mon espace</h1>
        <p>Email : {user.email}</p>
        <p>Nom complet : {user.user_metadata?.full_name}</p>
        <p>Prénom : {user.user_metadata?.first_name}</p>
        <p>Nom : {user.user_metadata?.last_name}</p>
      </div>
    </div>
  )
}

export default MySpace
