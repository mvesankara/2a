"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown, Menu, ArrowLeft } from "lucide-react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/espace-personnel": "Espace personnel",
  "/dashboard/profil":  "Profil",
  "/dashboard/projets":         "Projets",
  "/dashboard/projets/nouveau": "Nouveau projet",
  "/my-space": "Espace personnel",
  "/dashboard/taches": "Mes tâches",
  "/dashboard/notifications": "Notifications",
  "/dashboard/messages": "Messages",
  "/dashboard/paiements": "Paiements",
  "/dashboard/documents": "Documents",
  "/dashboard/parametres": "Paramètres",
};

interface BreadcrumbItem { label: string; href?: string }

interface DashboardHeaderProps {
  unreadCount: number;
  profile: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    role: string | null;
  };
  breadcrumb?: BreadcrumbItem[];
}

const ROLE_LABELS: Record<string, string> = {
  adherent: "Adhérent",
  membre_bureau: "Bureau",
  sympathisant: "Sympathisant",
  administrateur: "Admin",
};

export default function DashboardHeader({ unreadCount, profile, breadcrumb }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Tableau de bord";

  // Back arrow for dynamic sub-pages (e.g. /dashboard/projets/[id])
  const isProjectDetail = /^\/dashboard\/projets\/[^/]+$/.test(pathname) &&
    pathname !== "/dashboard/projets/nouveau";
  const backHref = isProjectDetail ? "/dashboard/projets" : null;

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Membre";
  const roleLabel = profile.role ? (ROLE_LABELS[profile.role] ?? profile.role) : "Membre";

  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "M";

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shadow-sm">
      {/* Page title */}
      <div className="flex items-center gap-3 mr-auto">
        <button className="lg:hidden p-1 text-gray-500 hover:text-primary">
          <Menu size={20} />
        </button>
        {backHref && !breadcrumb && (
          <Link href={backHref} className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors" aria-label="Retour">
            <ArrowLeft size={18} />
          </Link>
        )}
        {breadcrumb ? (
          <nav className="flex items-center gap-1.5 text-sm" aria-label="Fil d'Ariane">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-300">›</span>}
                {item.href ? (
                  <Link href={item.href} className="text-gray-500 hover:text-primary transition-colors font-medium">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-800 font-bold">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-lg font-bold text-gray-800">{isProjectDetail ? "Détail du projet" : title}</h1>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-56">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Notification bell */}
      <Link href="/dashboard/notifications" className="relative p-2 text-gray-500 hover:text-primary transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      {/* User info */}
      <button className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
        <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary text-sm font-bold">{initials}</span>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-gray-800">{displayName}</span>
          <span className="text-xs text-gray-400">{roleLabel}</span>
        </div>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
    </header>
  );
}
