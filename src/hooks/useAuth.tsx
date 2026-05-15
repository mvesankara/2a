"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi, setToken, clearToken, type Profile } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  login: (token: string, user: AuthUser, profile: Profile) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then(({ id, email, profile }) => {
        setUser({ id, email });
        setProfile(profile);
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = (token: string, authUser: AuthUser, userProfile: Profile) => {
    setToken(token);
    setUser(authUser);
    setProfile(userProfile);
  };

  const signOut = () => {
    clearToken();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
