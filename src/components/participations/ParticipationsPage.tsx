"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Search, Layers, PlayCircle, CheckCircle2, ListChecks,
  ChevronDown, ImageOff, MoreVertical, Users2, CalendarClock,
  Mail, Check, X, Loader2, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Participation {
  id: string;
  role: string | null;
  status: string;
  project: {
    id: string;
    name: string;
    shortDescription: string | null;
    category: string | null;
    imageUrl: string | null;
    status: "en_cours" | "en_revue" | "cloture";
    progress: number;
    memberCount: number;
  };
  nextMilestone: { title: string; date: string | null } | null;
}

interface InvitationItem {
  id: string;
  role: string;
  specialty: string | null;
  createdAt: string;
  project: { id: string; name: string; category: string | null; imageUrl: string | null };
}

interface Suggestion {
  id: string;
  name: string;
  category: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
}

interface ApiResponse {
  participations: Participation[];
  stats: { total: number; enCours: number; termines: number; tachesAssignees: number };
  invitations: InvitationItem[];
  suggestions: Suggestion[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch(path: string, opts?: RequestInit) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(err.error ?? "Erreur");
  }
  return res.json();
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  en_cours: { label: "En cours", cls: "bg-primary/10 text-primary" },
  en_revue: { label: "En revue", cls: "bg-amber-100 text-amber-700" },
  cloture: { label: "Terminé", cls: "bg-gray-100 text-gray-500" },
};

const ROLE_META: Record<string, { label: string; cls: string; icon: string }> = {
  "Chef de projet": { label: "Responsable", cls: "text-amber-600", icon: "👑" },
  "Responsable": { label: "Responsable", cls: "text-amber-600", icon: "👑" },
  "Coordinateur": { label: "Organisateur", cls: "text-violet-600", icon: "★" },
  "Organisateur": { label: "Organisateur", cls: "text-violet-600", icon: "★" },
  "Contributeur": { label: "Contributeur", cls: "text-primary", icon: "👤" },
  "Membre": { label: "Membre", cls: "text-green-600", icon: "👥" },
};

function roleMeta(role: string | null) {
  return ROLE_META[role ?? "Membre"] ?? { label: role ?? "Membre", cls: "text-gray-600", icon: "👤" };
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return format(new Date(iso), "d MMM yyyy", { locale: fr });
}

const DONUT_COLORS = { en_cours: "#1A4D4F", cloture: "#E6B325", other: "#9CA3AF" };

const SORT_OPTIONS = [
  { value: "recent", label: "Dernière activité" },
  { value: "progress_desc", label: "Avancement ↓" },
  { value: "progress_asc", label: "Avancement ↑" },
  { value: "name", label: "Nom A→Z" },
];

type TabKey = "all" | "en_cours" | "termines" | "invitations";

// ─── Donut chart (CSS pur, cohérent avec MembersPage) ──────────────────────

function EngagementDonut({ enCours, termines, total }: { enCours: number; termines: number; total: number }) {
  if (total === 0) {
    return (
      <div className="w-28 h-28 rounded-full border-[10px] border-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-gray-400">Aucun</span>
      </div>
    );
  }
  const pctEnCours = (enCours / total) * 100;
  const pctTermines = (termines / total) * 100;
  const gradient = `${DONUT_COLORS.en_cours} 0% ${pctEnCours.toFixed(1)}%, ${DONUT_COLORS.cloture} ${pctEnCours.toFixed(1)}% ${(pctEnCours + pctTermines).toFixed(1)}%, ${DONUT_COLORS.other} ${(pctEnCours + pctTermines).toFixed(1)}% 100%`;
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <div className="w-28 h-28 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
        <span className="text-xl font-black text-gray-800 leading-none">{total}</span>
        <span className="text-[10px] text-gray-400 mt-0.5">Projets</span>
      </div>
    </div>
  );
}

// ─── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, iconBg, iconCls, value, label,
}: {
  icon: React.ElementType; iconBg: string; iconCls: string; value: number | string; label: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-[160px]">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon size={20} className={iconCls} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── Filter dropdown (natif, accessible) ───────────────────────────────────

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ─── Participation card ─────────────────────────────────────────────────────

function ParticipationCard({ p }: { p: Participation }) {
  const status = STATUS_META[p.project.status] ?? STATUS_META.en_cours;
  const role = roleMeta(p.role);
  const nextDate = formatDate(p.nextMilestone?.date ?? null);

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
        {p.project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.project.imageUrl} alt={p.project.name} className="w-full h-full object-cover" />
        ) : (
          <ImageOff size={18} className="text-gray-300" />
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <Link href={`/dashboard/projets/${p.project.id}`} className="font-semibold text-gray-800 hover:text-primary transition-colors truncate block">
          {p.project.name}
        </Link>
        {p.project.shortDescription && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{p.project.shortDescription}</p>
        )}
      </div>

      {/* Role */}
      <div className="hidden sm:flex items-center gap-1.5 w-32 flex-shrink-0">
        <span className={cn("text-xs font-semibold", role.cls)}>{role.icon} {role.label}</span>
      </div>

      {/* Members count */}
      <div className="hidden md:flex items-center gap-1.5 w-24 flex-shrink-0 text-xs text-gray-400">
        <Users2 size={13} />
        {p.project.memberCount} membres
      </div>

      {/* Progress */}
      <div className="hidden lg:block w-36 flex-shrink-0">
        <p className="text-[10px] text-gray-400 mb-1">Progression</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", p.project.progress >= 80 ? "bg-green-500" : "bg-primary")}
              style={{ width: `${p.project.progress}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-500 font-medium flex-shrink-0">{p.project.progress}%</span>
        </div>
      </div>

      {/* Status + deadline */}
      <div className="w-32 flex-shrink-0 text-right">
        <span className={cn("inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full", status.cls)}>
          {status.label}
        </span>
        {nextDate && (
          <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1">
            <CalendarClock size={10} /> {nextDate}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label="Actions"
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
      >
        <MoreVertical size={16} />
      </button>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function ParticipationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("recent");

  const { data, isLoading, isError, error } = useQuery<ApiResponse>({
    queryKey: ["participations"],
    queryFn: () => apiFetch("/participations"),
  });

  const respondMutation = useMutation({
    mutationFn: ({ invId, action }: { invId: string; action: "accept" | "reject" }) =>
      apiFetch(`/participations/invitations/${invId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["participations"] }),
  });

  const participations = useMemo(() => data?.participations ?? [], [data]);
  const stats = data?.stats ?? { total: 0, enCours: 0, termines: 0, tachesAssignees: 0 };
  const invitations = data?.invitations ?? [];
  const suggestions = data?.suggestions ?? [];

  const categories = useMemo(
    () => Array.from(new Set(participations.map((p) => p.project.category).filter(Boolean))) as string[],
    [participations]
  );

  const filtered = useMemo(() => {
    let list = participations;

    if (tab === "en_cours") list = list.filter((p) => p.project.status === "en_cours");
    else if (tab === "termines") list = list.filter((p) => p.project.status === "cloture");

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.project.name.toLowerCase().includes(q));
    }
    if (roleFilter) list = list.filter((p) => roleMeta(p.role).label === roleFilter);
    if (categoryFilter) list = list.filter((p) => p.project.category === categoryFilter);

    const sorted = [...list];
    switch (sort) {
      case "progress_desc":
        sorted.sort((a, b) => b.project.progress - a.project.progress);
        break;
      case "progress_asc":
        sorted.sort((a, b) => a.project.progress - b.project.progress);
        break;
      case "name":
        sorted.sort((a, b) => a.project.name.localeCompare(b.project.name));
        break;
      default:
        break; // "recent" = ordre déjà renvoyé par l'API
    }
    return sorted;
  }, [participations, tab, search, roleFilter, categoryFilter, sort]);

  const upcomingDeadlines = useMemo(
    () =>
      participations
        .filter((p) => p.nextMilestone?.date)
        .sort((a, b) => new Date(a.nextMilestone!.date!).getTime() - new Date(b.nextMilestone!.date!).getTime())
        .slice(0, 3),
    [participations]
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-semibold text-red-600 mb-1">Impossible de charger vos participations</p>
        <p className="text-xs text-gray-400">{error instanceof Error ? error.message : "Erreur inconnue"}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-0">
      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Mes participations</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {stats.total} projet{stats.total > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Suivez vos projets, votre rôle, vos contributions et votre progression.
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex flex-wrap gap-4">
          <StatCard icon={Layers} iconBg="bg-primary/10" iconCls="text-primary" value={stats.total} label="Projets rejoints" />
          <StatCard icon={PlayCircle} iconBg="bg-primary/10" iconCls="text-primary" value={stats.enCours} label="En cours" />
          <StatCard icon={CheckCircle2} iconBg="bg-green-50" iconCls="text-green-600" value={stats.termines} label="Terminés" />
          <StatCard icon={ListChecks} iconBg="bg-amber-50" iconCls="text-amber-600" value={stats.tachesAssignees} label="Tâches assignées" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-100">
          {[
            { key: "all" as const, label: `Tous (${stats.total})` },
            { key: "en_cours" as const, label: `En cours (${stats.enCours})` },
            { key: "termines" as const, label: `Terminés (${stats.termines})` },
            { key: "invitations" as const, label: `Invitations (${invitations.length})` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.key ? "border-primary text-primary font-semibold" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "invitations" ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une participation..."
                  aria-label="Rechercher une participation"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <FilterSelect
                label="Filtrer par rôle"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[{ value: "", label: "Rôle" }, ...Array.from(new Set(Object.values(ROLE_META).map((r) => r.label))).map((l) => ({ value: l, label: l }))]}
              />
              <FilterSelect
                label="Filtrer par catégorie"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[{ value: "", label: "Catégorie" }, ...categories.map((c) => ({ value: c, label: c }))]}
              />
              <FilterSelect label="Trier par" value={sort} onChange={setSort} options={SORT_OPTIONS} />
            </div>

            {/* List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <Layers size={32} className="text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">Aucune participation ne correspond à ces filtres.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((p) => <ParticipationCard key={p.id} p={p} />)}
              </div>
            )}
          </>
        ) : (
          // Invitations tab
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Mail size={32} className="mb-3 text-gray-200" />
                <p className="font-medium text-gray-500">Aucune invitation en attente</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {invitations.map((inv) => (
                  <li key={inv.id} className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{inv.project.name}</p>
                      <p className="text-xs text-gray-400">
                        Invitation en tant que {roleMeta(inv.role).label}
                        {inv.specialty ? ` · ${inv.specialty}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={respondMutation.isPending}
                      onClick={() => respondMutation.mutate({ invId: inv.id, action: "accept" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Check size={13} /> Accepter
                    </button>
                    <button
                      type="button"
                      disabled={respondMutation.isPending}
                      onClick={() => respondMutation.mutate({ invId: inv.id, action: "reject" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <X size={13} /> Refuser
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside className="w-80 flex-shrink-0 space-y-4 hidden xl:flex xl:flex-col">
        {/* Mon engagement */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Mon engagement</h3>
          <div className="flex items-center gap-4">
            <EngagementDonut enCours={stats.enCours} termines={stats.termines} total={stats.total} />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS.en_cours }} />
                  <span className="text-xs text-gray-600">En cours</span>
                </div>
                <span className="text-xs text-gray-400">
                  {stats.enCours} ({stats.total > 0 ? Math.round((stats.enCours / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS.cloture }} />
                  <span className="text-xs text-gray-600">Terminés</span>
                </div>
                <span className="text-xs text-gray-400">
                  {stats.termines} ({stats.total > 0 ? Math.round((stats.termines / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prochaines échéances */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">Prochaines échéances</h3>
            {upcomingDeadlines.length > 0 && (
              <Link href="/dashboard/taches" className="text-xs text-primary font-semibold hover:underline">
                Voir tout
              </Link>
            )}
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Aucune échéance à venir.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingDeadlines.map((p) => (
                <li key={p.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-primary/5 text-primary flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase leading-none">
                      {format(new Date(p.nextMilestone!.date!), "MMM", { locale: fr })}
                    </span>
                    <span className="text-sm font-black leading-none mt-0.5">
                      {format(new Date(p.nextMilestone!.date!), "d")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{p.project.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">Livrable : {p.nextMilestone!.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Invitations en attente */}
        {invitations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">Invitations en attente</h3>
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold">
                {invitations.length}
              </span>
            </div>
            <div className="space-y-3">
              {invitations.slice(0, 2).map((inv) => (
                <div key={inv.id} className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users2 size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-700 truncate">{inv.project.name}</p>
                    <p className="text-[11px] text-gray-400 mb-2">Invitation à rejoindre le projet</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={respondMutation.isPending}
                        onClick={() => respondMutation.mutate({ invId: inv.id, action: "accept" })}
                        className="flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Check size={11} /> Accepter
                      </button>
                      <button
                        type="button"
                        disabled={respondMutation.isPending}
                        onClick={() => respondMutation.mutate({ invId: inv.id, action: "reject" })}
                        className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 text-gray-500 text-[11px] font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <X size={11} /> Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions de projets */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">Suggestions de projets</h3>
              <Link href="/dashboard/projets" className="text-xs text-primary font-semibold hover:underline">
                Voir plus
              </Link>
            </div>
            <div className="space-y-3">
              {suggestions.slice(0, 2).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {s.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff size={14} className="text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-700 truncate">{s.name}</p>
                    <p className="text-[11px] text-gray-400 truncate mb-1.5">{s.shortDescription ?? s.category}</p>
                    <Link
                      href={`/dashboard/projets/${s.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary border border-primary/30 rounded-lg px-2.5 py-1 hover:bg-primary/5 transition-colors"
                    >
                      Rejoindre <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
