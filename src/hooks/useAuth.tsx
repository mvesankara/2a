
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  emailVerified?: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  emailVerified: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

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
        setAuthLoading(false);
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
      unsubscribePromise.then((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setEmailVerified(false);
        return;
      }
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("is_email_verified")
        .eq("id", user.id)
        .single();  
      if (error) {
        console.error("Error fetching profile:", error);
        setEmailVerified(false);
      } else {
        setEmailVerified(data?.is_email_verified ?? false);
      }
      setProfileLoading(false);
    }; 
    loadProfile();
  }, [user]);

  const signOut = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setEmailVerified(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading: authLoading || profileLoading, 
      emailVerified,
      signOut
      }}
      >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
