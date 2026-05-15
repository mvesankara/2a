"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-xl font-bold">
        Project
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/my-space">
              <Button variant="ghost">Mon espace</Button>
            </Link>
            <Button onClick={handleSignOut}>Déconnexion</Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Connexion</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
