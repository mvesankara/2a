"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/projets", label: "Nos projets" },
  { href: "/actualites", label: "Actualités" },
  { href: "/devenir-membre", label: "Devenir membre" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 xl:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-end leading-none">
              <span className="text-4xl font-black text-primary">2</span>
              <span className="text-4xl font-black text-accent">A</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                Acteurs de l&apos;Avenir
              </span>
              <span className="text-[10px] text-primary/60 italic">
                Lendemain meilleur, Lendemain fière
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative pb-1",
                  pathname === link.href
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent"
                    : "text-gray-600 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/my-space"
                  className="text-sm font-medium text-primary border border-primary rounded-full px-5 py-2 hover:bg-primary hover:text-white transition-colors"
                >
                  Mon espace
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-white bg-primary rounded-full px-5 py-2 hover:bg-primary/90 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary border border-primary rounded-full px-5 py-2 hover:bg-primary hover:text-white transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/don"
                  className="text-sm font-semibold text-white bg-accent rounded-full px-5 py-2 hover:bg-accent/90 transition-colors"
                >
                  Faire un don
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 pt-4">
            <nav className="flex flex-col gap-3 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "text-sm font-medium py-1",
                    pathname === link.href ? "text-primary font-semibold" : "text-gray-600"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/my-space" className="text-center text-sm font-medium text-primary border border-primary rounded-full px-5 py-2">Mon espace</Link>
                  <button onClick={handleSignOut} className="text-sm font-medium text-white bg-primary rounded-full px-5 py-2">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-center text-sm font-medium text-primary border border-primary rounded-full px-5 py-2">Se connecter</Link>
                  <Link href="/don" className="text-center text-sm font-semibold text-white bg-accent rounded-full px-5 py-2">Faire un don</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
