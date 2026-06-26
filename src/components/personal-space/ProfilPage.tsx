"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Camera, MapPin, Mail, Phone, Pencil, Loader2, Save, ExternalLink,
  User, Tag, CalendarDays, Users, Home, Briefcase, Building2,
  BookOpen, Leaf, Cpu, Lightbulb, Building, Globe, Award, BarChart3,
  ChevronRight, X, Plus, Lock, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { profileApi, authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_META: Record<string, { label: string; cls: string }> = {
  adherent:       { label: "Membre actif",  cls: "bg-green-500 text-white" },
  membre_bureau:  { label: "Bureau",        cls: "bg-primary text-white" },
  sympathisant:   { label: "Sympathisant",  cls: "bg-blue-500 text-white" },
  administrateur: { label: "Admin",         cls: "bg-red-500 text-white" },
};

const MEMBERSHIP_STATUS_META: Record<string, { label: string; cls: string }> = {
  approved: { label: "Adhésion validée", cls: "bg-green-100 text-green-700" },
  pending:  { label: "En attente",       cls: "bg-amber-100 text-amber-700" },
  rejected: { label: "Refusée",          cls: "bg-red-100 text-red-700" },
};

const GENDER_OPTIONS = ["Masculin", "Féminin", "Autre", "Non précisé"];

const INTEREST_ICONS: Record<string, React.ElementType> = {
  "Éducation":          BookOpen,
  "Environnement":      Leaf,
  "Technologie":        Cpu,
  "Entrepreneuriat":    Lightbulb,
  "Développement local": Building,
  "Santé":              Users,
  "Culture":            Globe,
  "Sport":              Award,
  "Agriculture":        Leaf,
  "Numérique":          Cpu,
};

const PREDEFINED_INTERESTS = [
  "Éducation", "Environnement", "Technologie", "Entrepreneuriat",
  "Développement local", "Santé", "Culture", "Sport", "Agriculture", "Numérique",
];

const TABS = [
  { id: "informations", label: "Informations personnelles" },
  { id: "competences",  label: "Compétences" },
  { id: "interets",     label: "Centres d'intérêt" },
  { id: "securite",     label: "Sécurité" },
  { id: "preferences",  label: "Préférences" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputBase = "w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";
const selectBase = "w-full h-11 pl-10 pr-8 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white appearance-none";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";
const reqStar = <span className="text-red-500 ml-0.5">*</span>;

function IconInput({
  icon: Icon, type = "text", value, onChange, placeholder, required, disabled,
}: {
  icon: React.ElementType; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputBase}
      />
    </div>
  );
}

function IconSelect({
  icon: Icon, value, onChange, options, required, disabled,
}: {
  icon: React.ElementType; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled} className={selectBase}>
        <option value="">— Sélectionner —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
    </div>
  );
}

// ─── Sidebar cards ────────────────────────────────────────────────────────────

function AvatarCard({ profile, onUploaded }: {
  profile: { avatarUrl: string | null; firstName: string | null; lastName: string | null };
  onUploaded: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState(profile.avatarUrl);
  const { toast } = useToast();

  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "M";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "Max 2 Mo", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { avatarUrl } = await profileApi.uploadAvatar(file);
      setLocalUrl(avatarUrl);
      onUploaded(avatarUrl);
      toast({ title: "Photo mise à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'uploader la photo", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-1">Photo de profil</h3>
      <p className="text-xs text-gray-400 mb-4">Votre photo de profil représente votre identité.</p>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-36 h-36 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center ring-4 ring-gray-50 shadow-md">
            {localUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={localUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-4xl font-black text-primary">{initials}</span>
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {uploading ? <Loader2 size={15} className="text-white animate-spin" /> : <Camera size={15} className="text-white" />}
          </button>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Changer la photo
        </button>
        <p className="text-[11px] text-gray-400 text-center">JPG, PNG ou GIF. Max 2Mo.</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function MembershipCard({ profile }: {
  profile: { status: string; createdAt: string; membershipType: string | null; membershipExpiresAt: string | null };
}) {
  const statusMeta = MEMBERSHIP_STATUS_META[profile.status] ?? MEMBERSHIP_STATUS_META.pending;
  const since = format(new Date(profile.createdAt), "d MMMM yyyy", { locale: fr });
  const expires = profile.membershipExpiresAt
    ? format(new Date(profile.membershipExpiresAt), "d MMMM yyyy", { locale: fr })
    : "—";

  const rows = [
    { label: "Statut",          value: "Membre actif" },
    { label: "Depuis le",       value: since },
    { label: "Type d'adhésion", value: profile.membershipType ?? "Membre individuel" },
    { label: "Expire le",       value: expires },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={18} className="text-primary" />
        <h3 className="text-sm font-bold text-gray-800">Mon adhésion</h3>
      </div>
      <span className={cn("text-xs font-bold px-3 py-1 rounded-full inline-block mb-4", statusMeta.cls)}>
        {statusMeta.label}
      </span>
      <div className="space-y-2.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800 text-right">{value}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
        Voir mon adhésion
        <ChevronRight size={15} className="text-gray-400" />
      </button>
    </div>
  );
}

function StatsCard({ stats }: { stats: { projectsCount: number; tasksCompleted: number; articlesPublished: number; eventsParticipated: number } }) {
  const rows = [
    { label: "Projets rejoints",    value: stats.projectsCount },
    { label: "Tâches complétées",   value: stats.tasksCompleted },
    { label: "Articles publiés",    value: stats.articlesPublished },
    { label: "Événements participés", value: stats.eventsParticipated },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-primary" />
        <h3 className="text-sm font-bold text-gray-800">Mes statistiques</h3>
      </div>
      <div className="space-y-2.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-black text-primary text-base">{value}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
        Voir mes statistiques
        <ChevronRight size={15} className="text-gray-400" />
      </button>
    </div>
  );
}

function SkillsCard({ skills, onManage }: { skills: string[]; onManage: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">Compétences clés</h3>
        <button onClick={onManage} className="text-xs text-primary font-semibold hover:underline">Gérer</button>
      </div>
      {skills.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Aucune compétence renseignée.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function InterestsCard({ interests, onManage }: { interests: string[]; onManage: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">Centres d&apos;intérêt</h3>
        <button onClick={onManage} className="text-xs text-primary font-semibold hover:underline">Gérer</button>
      </div>
      {interests.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Aucun centre d&apos;intérêt renseigné.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const Icon = INTEREST_ICONS[interest] ?? Globe;
            return (
              <span key={interest} className="flex items-center gap-1.5 text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/10">
                <Icon size={11} />
                {interest}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Informations personnelles ──────────────────────────────────────────

function InfoTab({ profile, onSaved }: { profile: any; onSaved: (p: any) => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [form, setForm] = useState({
    firstName:           profile.firstName ?? "",
    lastName:            profile.lastName ?? "",
    dateOfBirth:         profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    gender:              profile.gender ?? "",
    country:             profile.country ?? "",
    city:                profile.city ?? "",
    address:             profile.address ?? "",
    phone:               profile.phone ?? "",
    email:               profile.email ?? "",
    profession:          profile.profession ?? "",
    organization:        profile.organization ?? "",
    personalDescription: profile.personalDescription ?? "",
  });

  const set = (field: string) => (val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setDirty(true);
  };
  const setRaw = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setDirty(true);
  };

  const handleReset = () => {
    setForm({
      firstName:           profile.firstName ?? "",
      lastName:            profile.lastName ?? "",
      dateOfBirth:         profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
      gender:              profile.gender ?? "",
      country:             profile.country ?? "",
      city:                profile.city ?? "",
      address:             profile.address ?? "",
      phone:               profile.phone ?? "",
      email:               profile.email ?? "",
      profession:          profile.profession ?? "",
      organization:        profile.organization ?? "",
      personalDescription: profile.personalDescription ?? "",
    });
    setDirty(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast({ title: "Champs requis", description: "Prénom et nom sont obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const updated = await profileApi.update({
        firstName:           form.firstName,
        lastName:            form.lastName,
        dateOfBirth:         form.dateOfBirth || null,
        gender:              form.gender,
        country:             form.country,
        city:                form.city,
        address:             form.address,
        phone:               form.phone,
        personalDescription: form.personalDescription,
        profession:          form.profession,
        organization:        form.organization,
      });
      onSaved(updated);
      setDirty(false);
      toast({ title: "Profil mis à jour" });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Échec", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const descLen = form.personalDescription.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-primary mb-1">Informations personnelles</h3>
        <p className="text-xs text-gray-400">Mettez à jour vos informations personnelles et de contact.</p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Prénom {reqStar}</label>
          <IconInput icon={User} value={form.firstName} onChange={set("firstName")} placeholder="Kevin" required />
        </div>
        <div>
          <label className={labelCls}>Nom {reqStar}</label>
          <IconInput icon={Tag} value={form.lastName} onChange={set("lastName")} placeholder="Mouandza" required />
        </div>
      </div>

      {/* Date + Genre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date de naissance {reqStar}</label>
          <IconInput icon={CalendarDays} type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
        </div>
        <div>
          <label className={labelCls}>Genre {reqStar}</label>
          <IconSelect icon={Users} value={form.gender} onChange={set("gender")} options={GENDER_OPTIONS} />
        </div>
      </div>

      {/* Pays + Ville */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Pays de résidence {reqStar}</label>
          <IconInput icon={Globe} value={form.country} onChange={set("country")} placeholder="Gabon" required />
        </div>
        <div>
          <label className={labelCls}>Ville {reqStar}</label>
          <IconInput icon={MapPin} value={form.city} onChange={set("city")} placeholder="Libreville" required />
        </div>
      </div>

      {/* Adresse (full width) */}
      <div>
        <label className={labelCls}>Adresse</label>
        <IconInput icon={Home} value={form.address} onChange={set("address")} placeholder="Quartier, ville, pays" />
      </div>

      {/* Téléphone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Téléphone {reqStar}</label>
          <IconInput icon={Phone} type="tel" value={form.phone} onChange={set("phone")} placeholder="+241 XX XX XX XX" required />
        </div>
        <div>
          <label className={labelCls}>Adresse e-mail {reqStar}</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email"
              value={form.email}
              readOnly
              className={cn(inputBase, "bg-gray-50 text-gray-500 cursor-not-allowed")}
              title="L'adresse e-mail ne peut pas être modifiée ici"
            />
          </div>
        </div>
      </div>

      {/* Profession + Organisation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Profession / Occupation</label>
          <IconInput icon={Briefcase} value={form.profession} onChange={set("profession")} placeholder="Développeur informatique" />
        </div>
        <div>
          <label className={labelCls}>Organisation / Entreprise</label>
          <IconInput icon={Building2} value={form.organization} onChange={set("organization")} placeholder="Freelance" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleReset}
          disabled={!dirty || saving}
          className="border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>

      {/* À propos de moi */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center gap-2 mb-1">
          <Pencil size={15} className="text-primary" />
          <h4 className="text-sm font-bold text-primary">À propos de moi</h4>
        </div>
        <p className="text-xs text-gray-400 mb-3">Parlez-nous de vous, de votre parcours et de ce qui vous anime.</p>
        <div className="relative">
          <textarea
            value={form.personalDescription}
            onChange={setRaw("personalDescription")}
            rows={5}
            maxLength={500}
            placeholder="Passionné par le développement durable et l'entrepreneuriat social…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
          <span className={cn(
            "absolute bottom-3 right-3 text-[10px] font-medium",
            descLen > 450 ? "text-amber-500" : "text-gray-400"
          )}>
            {descLen}/500
          </span>
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Tab: Compétences ─────────────────────────────────────────────────────────

function SkillsTab({ skills: initialSkills, onSaved }: { skills: string[]; onSaved: (s: string[]) => void }) {
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const trimmed = input.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setInput("");
  };

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update({ skills });
      onSaved(skills);
      toast({ title: "Compétences mises à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-primary mb-1">Compétences clés</h3>
        <p className="text-xs text-gray-400">Ajoutez vos compétences pour les mettre en valeur.</p>
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          placeholder="Ajouter une compétence…"
          className="flex-1 h-10 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          type="button"
          onClick={addSkill}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[48px] bg-gray-50 rounded-xl p-3">
        {skills.length === 0 && <p className="text-xs text-gray-400 italic self-center">Aucune compétence pour l&apos;instant.</p>}
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-medium shadow-sm">
            {s}
            <button onClick={() => removeSkill(s)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Enregistrer
      </button>
    </div>
  );
}

// ─── Tab: Centres d'intérêt ───────────────────────────────────────────────────

function InterestsTab({ interests: initial, onSaved }: { interests: string[]; onSaved: (i: string[]) => void }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false);

  const toggle = (i: string) =>
    setSelected((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update({ interests: selected });
      onSaved(selected);
      toast({ title: "Centres d'intérêt mis à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-primary mb-1">Centres d&apos;intérêt</h3>
        <p className="text-xs text-gray-400">Sélectionnez les domaines qui vous passionnent.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PREDEFINED_INTERESTS.map((interest) => {
          const Icon = INTEREST_ICONS[interest] ?? Globe;
          const isActive = selected.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all",
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary/30 hover:bg-gray-50"
              )}
            >
              <Icon size={16} className={isActive ? "text-primary" : "text-gray-400"} />
              {interest}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Enregistrer
      </button>
    </div>
  );
}

// ─── Tab: Sécurité ────────────────────────────────────────────────────────────

function SecurityTab() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggle = (f: keyof typeof show) => setShow((s) => ({ ...s, [f]: !s[f] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (form.next.length < 8) {
      toast({ title: "Erreur", description: "Au moins 8 caractères requis", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(form.current, form.next);
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      toast({ title: "Mot de passe mis à jour" });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Échec", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "current" as const, label: "Mot de passe actuel" },
    { key: "next"    as const, label: "Nouveau mot de passe" },
    { key: "confirm" as const, label: "Confirmer le nouveau mot de passe" },
  ];

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <h3 className="text-base font-bold text-primary mb-1">Changer le mot de passe</h3>
        <p className="text-xs text-gray-400">Choisissez un mot de passe fort d&apos;au moins 8 caractères.</p>
      </div>
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={15} className="flex-shrink-0" />
          Mot de passe mis à jour avec succès.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className={labelCls}>{label}</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={show[key] ? "text" : "password"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required
                disabled={loading}
                className={cn(inputBase)}
              />
              <button type="button" tabIndex={-1} onClick={() => toggle(key)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show[key] ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70">
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProfilPageData {
  profile: any;
  stats: { projectsCount: number; tasksCompleted: number; articlesPublished: number; eventsParticipated: number };
}

function ProfilPageInner({ data }: { data: ProfilPageData }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") ?? "informations";

  const [profile, setProfile] = useState(data.profile);
  const [avatarUrl, setAvatarUrl] = useState(data.profile.avatarUrl);

  const setTab = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Membre";
  const roleMeta = profile.role
    ? (ROLE_META[profile.role] ?? { label: "Membre actif", cls: "bg-green-500 text-white" })
    : { label: "Membre actif", cls: "bg-green-500 text-white" };
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "M";
  const memberSince = format(new Date(profile.createdAt), "d MMMM yyyy", { locale: fr });
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Profile strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center ring-4 ring-white shadow-lg">
              {avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : <span className="text-2xl font-black text-primary">{initials}</span>
              }
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border-2 border-white">
              <Camera size={13} className="text-primary" />
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black text-primary">{displayName}</h2>
                  <span className={cn("text-xs font-bold px-3 py-1 rounded-full", roleMeta.cls)}>
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
              <a
                href="#"
                className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
              >
                Voir mon profil public
                <ExternalLink size={13} className="text-gray-400" />
              </a>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
              {location && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={14} className="text-primary flex-shrink-0" /> {location}
                </span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={14} className="text-primary flex-shrink-0" /> {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={14} className="text-primary flex-shrink-0" /> {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content: 2 columns */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Left: tabs + form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto scrollbar-none border-b border-gray-100">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap",
                  activeTab === id
                    ? "text-primary border-primary"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "informations" && (
              <InfoTab
                profile={profile}
                onSaved={(updated) => setProfile((prev: any) => ({ ...prev, ...updated }))}
              />
            )}
            {activeTab === "competences" && (
              <SkillsTab
                skills={profile.skills ?? []}
                onSaved={(skills) => setProfile((prev: any) => ({ ...prev, skills }))}
              />
            )}
            {activeTab === "interets" && (
              <InterestsTab
                interests={profile.interests ?? []}
                onSaved={(interests) => setProfile((prev: any) => ({ ...prev, interests }))}
              />
            )}
            {activeTab === "securite" && <SecurityTab />}
            {activeTab === "preferences" && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Pencil size={22} className="text-primary" />
                </div>
                <h3 className="text-base font-bold text-primary mb-2">Bientôt disponible</h3>
                <p className="text-sm text-gray-400">Les préférences arrivent prochainement.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: sidebar cards */}
        <div className="flex flex-col gap-4">
          <AvatarCard
            profile={{ avatarUrl, firstName: profile.firstName, lastName: profile.lastName }}
            onUploaded={(url) => setAvatarUrl(url)}
          />
          <MembershipCard profile={profile} />
          <StatsCard stats={data.stats} />
          <SkillsCard skills={profile.skills ?? []} onManage={() => setTab("competences")} />
          <InterestsCard interests={profile.interests ?? []} onManage={() => setTab("interets")} />
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage(props: { data: ProfilPageData }) {
  return (
    <Suspense fallback={null}>
      <ProfilPageInner {...props} />
    </Suspense>
  );
}
