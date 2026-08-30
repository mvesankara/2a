"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, MoreHorizontal, Eye, ThumbsUp, FileText,
  CheckCircle, Clock, Filter, ChevronDown, ChevronLeft,
  ChevronRight, Pencil, Trash2, X, AlertCircle, BookOpen,
} from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthorProfile {
  id: string;
  firstName: string | null;
  lastName:  string | null;
  avatarUrl: string | null;
}

interface Article {
  id:              string;
  title:           string;
  summary:         string;
  content:         string;
  published:       boolean;
  category:        string | null;
  imageUrl:        string | null;
  views:           number;
  likes:           number;
  authorProfileId: string | null;
  authorProfile:   AuthorProfile | null;
  date:            string | null;
  createdAt:       string | null;
}

interface Stats {
  total:      number;
  published:  number;
  drafts:     number;
  totalViews: number;
  totalLikes: number;
}

interface ApiResponse {
  articles:   Article[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats:      Stats;
  categories: string[];
}

// ─── Category colors ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  "Éducation":    { text: "text-teal-700",   bg: "bg-teal-50"   },
  "Environnement":{ text: "text-green-700",  bg: "bg-green-50"  },
  "Société":      { text: "text-pink-700",   bg: "bg-pink-50"   },
  "Innovation":   { text: "text-blue-700",   bg: "bg-blue-50"   },
  "Engagement":   { text: "text-amber-700",  bg: "bg-amber-50"  },
  "Jeunesse":     { text: "text-rose-700",   bg: "bg-rose-50"   },
  "Santé":        { text: "text-purple-700", bg: "bg-purple-50" },
};
const DEFAULT_CAT = { text: "text-gray-600", bg: "bg-gray-100" };
function catColor(cat: string | null) { return cat ? (CATEGORY_COLORS[cat] ?? DEFAULT_CAT) : DEFAULT_CAT; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function authorName(p: AuthorProfile | null) {
  if (!p) return "Auteur inconnu";
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "Auteur";
}
function initials(p: AuthorProfile | null) {
  if (!p) return "?";
  return [p.firstName?.[0], p.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
}
function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
function fmtNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")} k` : String(n);
}

async function apiFetch(path: string, opts?: RequestInit) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers },
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: "Erreur" })); throw new Error(e.error ?? "Erreur"); }
  return res.json();
}

// ─── Article Modal (create / edit) ───────────────────────────────────────────
function ArticleModal({
  open, onClose, article, categories, onSave,
}: {
  open: boolean; onClose: () => void;
  article?: Article | null;
  categories: string[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [title,     setTitle]     = useState(article?.title     ?? "");
  const [summary,   setSummary]   = useState(article?.summary   ?? "");
  const [content,   setContent]   = useState(article?.content   ?? "");
  const [category,  setCategory]  = useState(article?.category  ?? "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await onSave({ title, summary, content, category: category || null, published });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">{article ? "Modifier l'article" : "Nouvel article"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm text-red-600">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Titre de l'article" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Résumé *</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} required rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Courte description de l'article (max 500 caractères)" maxLength={500} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Contenu *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={6}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Contenu complet de l'article..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Catégorie</label>
              <input list="cats-list" value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="ex: Éducation, Innovation…" />
              <datalist id="cats-list">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setPublished(p => !p)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${published ? "bg-primary" : "bg-gray-200"}`}
                  style={{ height: "22px" }}
                >
                  <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${published ? "left-[22px]" : "left-0.5"}`}
                    style={{ width: "18px", height: "18px" }} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {published ? "Publié" : "Brouillon"}
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Annuler</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {article ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ profile }: { profile: AuthorProfile | null }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {profile?.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={profile.avatarUrl} alt={authorName(profile)} className="w-full h-full object-cover" />
        : <span className="text-primary text-xs font-bold">{initials(profile)}</span>
      }
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ArticlesPage({ currentProfileId }: { currentProfileId: string }) {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [status,   setStatus]   = useState("");
  const [sortBy,   setSortBy]   = useState("recent");
  const [page,     setPage]     = useState(1);
  const [limit,    setLimit]    = useState(6);
  const [modal,    setModal]    = useState(false);
  const [editArt,  setEditArt]  = useState<Article | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const invalidate  = () => queryClient.invalidateQueries({ queryKey: ["articles"] });

  const qk = useMemo(() => ["articles", search, category, status, sortBy, page, limit], [search, category, status, sortBy, page, limit]);

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: qk,
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), limit: String(limit), sortBy });
      if (search)   p.set("search",   search);
      if (category) p.set("category", category);
      if (status)   p.set("status",   status);
      return apiFetch(`/articles?${p}`);
    },
    placeholderData: prev => prev,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiFetch("/articles", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: Record<string, unknown>) =>
      apiFetch(`/articles/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => { invalidate(); setEditArt(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/articles/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); setOpenMenu(null); },
  });

  const articles   = data?.articles   ?? [];
  const stats      = data?.stats;
  const pagination = data?.pagination;
  const categories = data?.categories ?? [];

  // Pagination pages to display
  function pageNumbers(total: number, cur: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (cur > 3) pages.push("…");
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push("…");
    pages.push(total);
    return pages;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tous les articles</h1>
          <p className="text-sm text-gray-500 mt-1">Informez, inspirez et partagez des connaissances utiles avec la communauté.</p>
        </div>
        <Link
          href="/dashboard/articles/nouveau"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus size={16} /> Nouvel article
        </Link>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Total articles",  value: stats.total,                   Icon: FileText,    color: "text-gray-700",   bg: "bg-gray-50"    },
            { label: "Publiés",         value: stats.published,               Icon: CheckCircle, color: "text-green-700",  bg: "bg-green-50"   },
            { label: "Brouillons",      value: stats.drafts,                  Icon: Clock,       color: "text-amber-700",  bg: "bg-amber-50"   },
            { label: "Vues totales",    value: fmtNum(stats.totalViews),      Icon: Eye,         color: "text-blue-700",   bg: "bg-blue-50"    },
            { label: "Appréciations",   value: fmtNum(stats.totalLikes),      Icon: ThumbsUp,    color: "text-purple-700", bg: "bg-purple-50"  },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-xl p-4 flex items-center gap-3`}>
              <c.Icon size={22} className={c.color} />
              <div>
                <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                <div className="text-[11px] text-gray-500 leading-tight">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[220px]">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text" placeholder="Rechercher un article..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
          />
        </div>

        {/* Filters */}
        {[
          { label: "Catégorie", value: category, onChange: setCategory, options: [
            { v: "", l: "Catégorie" },
            ...categories.map(c => ({ v: c, l: c })),
          ]},
          { label: "Statut", value: status, onChange: setStatus, options: [
            { v: "",          l: "Statut"     },
            { v: "published", l: "Publié"     },
            { v: "draft",     l: "Brouillon"  },
          ]},
        ].map(f => (
          <div key={f.label} className="relative">
            <select value={f.value} onChange={e => { f.onChange(e.target.value); setPage(1); }}
              className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        ))}

        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors">
          <Filter size={13} /> Plus de filtres
        </button>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Trier par :</span>
          <div className="relative">
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium">
              <option value="recent">Plus récents</option>
              <option value="views">Plus vus</option>
              <option value="likes">Plus appréciés</option>
              <option value="title">Titre A→Z</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookOpen size={40} className="mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">Aucun article trouvé</p>
            <p className="text-sm mt-1">Modifiez les filtres ou créez un premier article</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Article</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Catégorie</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Auteur</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Vues</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Appréciations</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.map(art => {
                  const cc = catColor(art.category);
                  const isAuthor = art.authorProfileId === currentProfileId;

                  return (
                    <tr key={art.id} className="hover:bg-gray-50/40 transition-colors group">
                      {/* Article */}
                      <td className="py-3.5 px-4 max-w-[340px]">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="w-16 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {art.imageUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <FileText size={18} className="text-gray-300" />
                                </div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{art.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-snug">{art.summary}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        {art.category
                          ? <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cc.bg} ${cc.text}`}>{art.category}</span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>
                      {/* Author */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar profile={art.authorProfile} />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{authorName(art.authorProfile)}</p>
                            <p className="text-[11px] text-gray-400">Auteur</p>
                          </div>
                        </div>
                      </td>
                      {/* Statut */}
                      <td className="py-3.5 px-4">
                        {art.published
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Publié
                            </span>
                          : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Brouillon
                            </span>
                        }
                      </td>
                      {/* Vues */}
                      <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                        {art.published
                          ? <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                              <Eye size={13} className="text-gray-400" />{fmtNum(art.views)}
                            </div>
                          : <span className="text-gray-300 text-sm">—</span>
                        }
                      </td>
                      {/* Likes */}
                      <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                        {art.published
                          ? <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                              <ThumbsUp size={12} className="text-gray-400" />{fmtNum(art.likes)}
                            </div>
                          : <span className="text-gray-300 text-sm">—</span>
                        }
                      </td>
                      {/* Date */}
                      <td className="py-3.5 px-4 text-sm text-gray-500 hidden lg:table-cell">
                        {formatDate(art.date ?? art.createdAt)}
                      </td>
                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === art.id ? null : art.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {openMenu === art.id && (
                            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
                              <button
                                onClick={() => { setEditArt(art); setOpenMenu(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil size={13} /> Modifier
                              </button>
                              {(isAuthor) && (
                                <>
                                  <button
                                    onClick={() => {
                                      const body = { published: !art.published };
                                      updateMutation.mutate({ id: art.id, ...body });
                                      setOpenMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    {art.published ? <Clock size={13} /> : <CheckCircle size={13} />}
                                    {art.published ? "Mettre en brouillon" : "Publier"}
                                  </button>
                                  <button
                                    onClick={() => { if (confirm("Supprimer cet article ?")) deleteMutation.mutate(art.id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={13} /> Supprimer
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Affichage de {((page - 1) * pagination.limit) + 1} à{" "}
            {Math.min(page * pagination.limit, pagination.total)} sur {pagination.total} articles
          </p>

          {pagination.pages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={15} />
              </button>
              {pageNumbers(pagination.pages, page).map((p, i) =>
                p === "…"
                  ? <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">...</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}>{p}</button>
              )}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Par page</span>
            <div className="relative">
              <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                className="appearance-none border border-gray-200 rounded-xl pl-3 pr-7 py-1.5 text-sm text-gray-600 bg-white focus:outline-none cursor-pointer">
                {[6, 10, 20].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ArticleModal
        open={modal || editArt !== null}
        onClose={() => { setModal(false); setEditArt(null); }}
        article={editArt}
        categories={categories}
        onSave={async body => {
          if (editArt) await updateMutation.mutateAsync({ id: editArt.id, ...body });
          else await createMutation.mutateAsync(body);
        }}
      />

      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
