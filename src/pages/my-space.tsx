// src/pages/my-space.tsx
import { useAuth } from "@/hooks/useAuth"
// useEffect and useNavigate are no longer needed after removing redundant auth checks
// import { useEffect } from "react"
// import { useNavigate } from "react-router-dom"

const MySpace = () => {
  const { user } = useAuth()
  // const navigate = useNavigate() // No longer needed

  // The PrivateRoute component already handles redirection if the user is not authenticated.
  // The useEffect hook and the conditional 'if (!user) return null' were redundant
  // and have been removed.

  // Since PrivateRoute protects this component, 'user' should be available.
  // If there's a very brief moment user might be null (e.g. state update timing),
  // consider optional chaining for user properties (e.g., user?.email)
  // or a loading state if appropriate, though PrivateRoute aims to prevent rendering until auth is confirmed.
  // For now, assuming 'user' is populated as per PrivateRoute's design.

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-3xl font-bold">Mon espace</h1>
        {/* It's safer to use optional chaining in case user or user_metadata is briefly null,
            despite PrivateRoute. This prevents runtime errors during rendering. */}
        <p>Email : {user?.email}</p>
        <p>Nom complet : {user?.user_metadata?.full_name}</p>
        <p>Prénom : {user?.user_metadata?.first_name}</p>
        <p>Nom : {user?.user_metadata?.last_name}</p>
      </div>
    </div>
  )
}

export default MySpace
