"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, MapPin, Mail, Phone, Pencil, Loader2 } from "lucide-react";
import { profileApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ROLE_META: Record<string, { label: string; cls: string }> = {
  adherent:       { label: "Adhérent",     cls: "bg-green-500 text-white" },
  membre_bureau:  { label: "Bureau",       cls: "bg-primary text-white" },
  sympathisant:   { label: "Sympathisant", cls: "bg-blue-500 text-white" },
  administrateur: { label: "Admin",        cls: "bg-red-500 text-white" },
};

interface ProfileHeaderProps {
  profile: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    city: string | null;
    country: string | null;
    email: string | null;
    phone: string | null;
    role: string | null;
    personalDescription: string | null;
    createdAt: string;
  };
  onEditProfile?: () => void;
}

export default function ProfileHeader({ profile, onEditProfile }: ProfileHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Membre";
  const roleMeta = profile.role ? (ROLE_META[profile.role] ?? { label: profile.role, cls: "bg-green-500 text-white" }) : { label: "Membre", cls: "bg-green-500 text-white" };
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "M";
  const memberSince = format(new Date(profile.createdAt), "d MMMM yyyy", { locale: fr });
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { avatarUrl: url } = await profileApi.uploadAvatar(file);
      setAvatarUrl(url);
      toast({ title: "Avatar mis à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'uploader l'avatar", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center ring-4 ring-white shadow-lg">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-primary">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-70"
            aria-label="Changer l'avatar"
          >
            {uploading ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-primary">{displayName}</h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleMeta.cls}`}>
                  {roleMeta.label}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">Membre depuis le {memberSince}</p>
              {profile.personalDescription && (
                <p className="text-sm text-gray-600 italic mt-1.5">
                  &quot;{profile.personalDescription}&quot;
                </p>
              )}
            </div>
            <Link
              href="/dashboard/profil"
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <Pencil size={15} />
              Modifier mon profil
            </Link>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
            {location && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                {location}
              </span>
            )}
            {profile.email && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail size={14} className="text-primary flex-shrink-0" />
                {profile.email}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Phone size={14} className="text-primary flex-shrink-0" />
                {profile.phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
