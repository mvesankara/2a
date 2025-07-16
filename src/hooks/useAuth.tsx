
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndListen = async () => {
      try {
        // First, get the current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        console.log("Current session:", session);
        setUser(session?.user ?? null);
        setSession(session);
      } catch (error) {
        console.error("Error fetching initial session:", error);
        // Set user and session to null if there's an error
        setUser(null);
        setSession(null);
      } finally {
        // Set loading to false only after the initial check is complete
        setLoading(false);
      }

      // Then, set up the auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed:", _event, session);
        setUser(session?.user ?? null);
        setSession(session);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    const unsubscribePromise = fetchSessionAndListen();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
