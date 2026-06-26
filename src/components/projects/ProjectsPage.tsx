"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Search, FolderOpen, CheckCircle2, Timer, Flag,
  ChevronDown, Filter, MoreVertical, ImageOff, ChevronLeft, ChevronRight,
  Eye, UserPlus, Share2, Loader2, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  shortDescription: string | null;
  category: string | null;
  imageUrl: string | null;
  status: "en_cours" | "en_revue" | "cloture";
  progress: number;
  city: string | null;
  country: string | null;
  createdAt: string | null;
}

interface ApiResponse {
  projects: Project[];
  total: number;
  page: number;
  perPage: number;
  stats: { total: number; actif: number; en_cours: number; cloture: number };
  categories: string[];
  cities: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; cls: string }> = {
  en_cours: { label: "Actif",    cls: "bg-green-100 text-green-700" },
  en_revue: { label: "En cours", cls: "bg-amber-100 text-amber-700" },
  cloture:  { label: "Terminé",  cls: "bg-gray-100 text-gray-600"  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Éducation":     "bg-blue-100 text-blue-700",
  "Environnement": "bg-green-100 text-green-700",
  "Social":        "bg-purple-100 text-purple-700",
  "Inclusion sociale": "bg-purple-100 text-purple-700",
  "Santé":         "bg-cyan-100 text-cyan-700",
  "Innovation":    "bg-amber-100 text-amber-700",
  "Jeunesse":      "bg-pink-100 text-pink-700",
};

const SORT_OPTIONS = [
  { value: "recent",       label: "Plus récents" },
  { value: "oldest",       label: "Plus anciens" },
  { value: "progress_desc", label: "Avancement ↓" },
  { value: "progress_asc",  label: "Avancement ↑" },
  { value: "name",          label: "Nom A→Z" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "",        label: "Tous les statuts" },
  { value: "actif",   label: "Actif" },
  { value: "en_cours", label: "En cours" },
  { value: "termine",  label: "Terminé" },
];

const PER_PAGE_OPTIONS = [6, 12, 24];

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, iconCls, value, label, bg,
}: {
  icon: React.ElementType; iconCls: string; value: number | string; label: string; bg: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-[160px]", bg)}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconCls)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Dropdown select ──────────────────────────────────────────────────────────

function FilterDropdown({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected && selected.value !== "" ? selected.label : label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap",
          value
            ? "border-primary bg-primary/5 text-primary"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
        )}
      >
        {displayLabel}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-20 min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full text-left px-4 py-2 text-sm transition-colors",
                opt.value === value
                  ? "bg-primary/5 text-primary font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Actions menu ─────────────────────────────────────────────────────────────

function ActionsMenu({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const actions = [
    { icon: Eye,      label: "Voir les détails", href: `/dashboard/projets/${projectId}` },
    { icon: UserPlus, label: "Rejoindre",          href: null },
    { icon: Share2,   label: "Partager",            href: null },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Actions"
      >
        <MoreVertical size={15} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-20 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden">
          {actions.map(({ icon: Icon, label, href }) => (
            href ? (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon size={14} className="text-gray-400" />
                {label}
              </Link>
            ) : (
            <button
              key={label}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon size={14} className="text-gray-400" />
              {label}
            </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project row ─────────────────────────────────────────────────────────────

function ProjectRow({ project }: { project: Project }) {
  const statusMeta = STATUS_META[project.status] ?? STATUS_META.en_cours;
  const categoryCls = CATEGORY_COLORS[project.category ?? ""] ?? "bg-gray-100 text-gray-600";
  const date = project.createdAt ? format(new Date(project.createdAt), "d MMM yyyy", { locale: fr }) : "—";

  return (
    <tr className="hover:bg-gray-50/60 transition-colors border-b border-gray-100 last:border-0">
      {/* Projet */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-[70px] h-[52px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
            {project.imageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              : <ImageOff size={16} className="text-gray-300" />
            }
          </div>
          <div className="min-w-0">
            <Link href={`/dashboard/projets/${project.id}`} className="text-sm font-bold text-gray-800 leading-tight hover:text-primary transition-colors line-clamp-1">{project.name}</Link>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 max-w-xs">
              {project.shortDescription}
            </p>
          </div>
        </div>
      </td>

      {/* Catégorie */}
      <td className="px-4 py-3 whitespace-nowrap">
        {project.category && (
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", categoryCls)}>
            {project.category}
          </span>
        )}
      </td>

      {/* Localisation */}
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{project.city ?? "—"}</p>
        <p className="text-xs text-gray-400">{project.country ?? ""}</p>
      </td>

      {/* Statut */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", statusMeta.cls)}>
          {statusMeta.label}
        </span>
      </td>

      {/* Avancement */}
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-gray-700 mb-1">{project.progress}%</p>
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{date}</td>

      {/* Actions */}
      <td className="px-4 py-3">
        <ActionsMenu projectId={project.id} />
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, perPage, total, onPage, onPerPage,
}: {
  page: number; perPage: number; total: number;
  onPage: (p: number) => void;
  onPerPage: (pp: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500 whitespace-nowrap">
        Affichage de {from} à {to} sur {total} projet{total > 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                p === page
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Per page */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Par page</span>
        <select
          value={perPage}
          onChange={(e) => onPerPage(Number(e.target.value))}
          className="h-8 px-2 pr-6 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
        >
          {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) add(i);
  if (current < total - 2) pages.push("…");
  add(total);
  return pages;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [status,   setStatus]   = useState("");
  const [city,     setCity]     = useState("");
  const [sort,     setSort]     = useState("recent");
  const [page,     setPage]     = useState(1);
  const [perPage,  setPerPage]  = useState(6);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  const handleFilter = useCallback(<T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  }, []);

  const queryKey = ["projects", debouncedSearch, category, status, city, sort, page, perPage];

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category && { category }),
        ...(status   && { status }),
        ...(city     && { city }),
        sort,
        page:    String(page),
        perPage: String(perPage),
      });
      const res = await fetch(`/api/projects?${params}`);
      if (!res.ok) throw new Error("Erreur réseau");
      return res.json();
    },
    staleTime: 30_000,
  });

  const stats      = data?.stats;
  const projects   = data?.projects ?? [];
  const total      = data?.total ?? 0;
  const categories = data?.categories ?? [];
  const cities     = data?.cities ?? [];

  const categoryOptions = [
    { value: "", label: "Toutes les catégories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];
  const cityOptions = [
    { value: "", label: "Toutes les villes" },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Title + description + stats */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-black text-gray-800 leading-tight">
              Tous les projets
              <div className="w-8 h-1 bg-accent rounded-full mt-1.5" />
            </h1>
            <Link
              href="/dashboard/projets/nouveau"
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} /> Nouveau projet
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            Découvrez, suivez et participez aux projets de la communauté.
          </p>
        </div>

        {/* Stats cards */}
        <div className="flex flex-wrap gap-3 flex-1">
          <StatCard icon={FolderOpen}   iconCls="bg-primary/10 text-primary"   value={stats?.total    ?? "—"} label="Projets au total"      bg="bg-white" />
          <StatCard icon={CheckCircle2} iconCls="bg-primary/10 text-primary"   value={stats?.actif    ?? "—"} label="Projets actifs"         bg="bg-white" />
          <StatCard icon={Timer}        iconCls="bg-amber-100 text-amber-600"  value={stats?.en_cours ?? "—"} label="En cours de réalisation" bg="bg-white" />
          <StatCard icon={Flag}         iconCls="bg-primary/10 text-primary"   value={stats?.cloture  ?? "—"} label="Projets terminés"        bg="bg-white" />
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher un projet..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Dropdowns */}
          <FilterDropdown label="Catégorie"    value={category} options={categoryOptions}      onChange={handleFilter(setCategory)} />
          <FilterDropdown label="Statut"       value={status}   options={STATUS_FILTER_OPTIONS} onChange={handleFilter(setStatus)}   />
          <FilterDropdown label="Localisation" value={city}     options={cityOptions}           onChange={handleFilter(setCity)}     />

          {/* Plus de filtres */}
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors whitespace-nowrap">
            <Filter size={14} />
            Plus de filtres
          </button>

          {/* Sort — pushed right */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Trier par :</span>
            <FilterDropdown
              label="Trier par"
              value={sort}
              options={SORT_OPTIONS}
              onChange={(v) => { setSort(v); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["Projet", "Catégorie", "Localisation", "Statut", "Avancement", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 size={28} className="animate-spin text-primary mx-auto" />
                    <p className="text-sm text-gray-400 mt-3">Chargement des projets…</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-red-500">
                    Erreur lors du chargement. Réessayez.
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Aucun projet trouvé</p>
                    <p className="text-xs text-gray-300 mt-1">Essayez de modifier vos filtres</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => <ProjectRow key={project.id} project={project} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && projects.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              perPage={perPage}
              total={total}
              onPage={setPage}
              onPerPage={(pp) => { setPerPage(pp); setPage(1); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
