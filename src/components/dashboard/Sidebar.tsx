"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, User, FolderOpen, CheckSquare, Newspaper,
  Bell, MessageSquare, CreditCard, CalendarDays, FileText,
  Settings, Users, Headphones, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/dashboard/espace-personnel", icon: User, label: "Espace personnel" },
  { href: "/dashboard/projets", icon: FolderOpen, label: "Projets" },
  { href: "/dashboard/taches", icon: CheckSquare, label: "Mes tâches" },
  { href: "/actualites", icon: Newspaper, label: "Articles" },
  { href: "/dashboard/participations", icon: Star, label: "Mes participations" },
  { href: "/evenements", icon: CalendarDays, label: "Événements" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications", badge: true },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/paiements", icon: CreditCard, label: "Paiements" },
  { href: "/dashboard/documents", icon: FileText, label: "Documents" },
  { href: "/dashboard/parametres", icon: Settings, label: "Paramètres" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const { data: unread = 0 } = useQuery<number>({
    queryKey: ["sidebar-unread"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return 0;
      const r = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return 0;
      const data: Array<{ isRead: boolean }> = await r.json();
      return data.filter((n) => !n.isRead).length;
    },
    staleTime: 30_000,
  });

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-primary flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-end leading-none">
            <span className="text-3xl font-black text-white">2</span>
            <span className="text-3xl font-black text-accent">A</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
              Acteurs de l&apos;Avenir
            </span>
            <span className="text-[9px] text-white/50 italic">
              Lendemain meilleur, Lendemain fi&egrave;re
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const aliases: Record<string, string[]> = {
            "/dashboard/espace-personnel": ["/dashboard/profil"],
          };
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href)) ||
            (aliases[href] ?? []).some((a) => pathname.startsWith(a));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && unread > 0 && (
                <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Invite card */}
      <div className="mx-3 mb-3 bg-primary-light/30 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-accent" />
          <p className="text-white text-sm font-bold">Invitez un membre</p>
        </div>
        <p className="text-white/60 text-xs mb-3 leading-relaxed">
          D&eacute;veloppons ensemble notre communaut&eacute;.
        </p>
        <button className="w-full border border-accent text-accent text-xs font-semibold py-1.5 rounded-lg hover:bg-accent hover:text-white transition-colors">
          Inviter
        </button>
      </div>

      {/* Support */}
      <div className="px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <Headphones size={15} className="text-white/70" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Besoin d&apos;aide ?</p>
          <button
            onClick={handleSignOut}
            className="text-white/50 text-[10px] hover:text-accent transition-colors"
          >
            Contacter notre support
          </button>
        </div>
      </div>

      {/* Decorative pattern */}
      <div className="flex-shrink-0 h-16 relative overflow-hidden opacity-20">
        <svg viewBox="0 0 240 64" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="0,64 80,0 160,64" fill="#E6B325" />
          <polygon points="60,64 140,0 220,64" fill="#ffffff" />
          <polygon points="120,64 200,0 280,64" fill="#E6B325" />
        </svg>
      </div>
    </aside>
  );
}
