"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, AlertCircle, Circle, Pause,
  Calendar, Folder, Zap, MoreHorizontal, Pencil, Trash2, X
} from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type TaskStatus = "todo" | "in_progress" | "paused" | "done" | "review";
type TaskPriority = "low" | "normal" | "high";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  dueDate: string | null;
  progress: number;
  projectId: string | null;
  project: { id: string; name: string } | null;
  createdAt: string;
}

interface Stats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  paused: number;
  overdue: number;
}

interface UpcomingDeadline {
  id: string;
  dueDate: string;
  projectName: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
}

interface ProjectDist {
  id: string;
  name: string;
  count: number;
}

interface ApiResponse {
  tasks: TaskItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: Stats;
  upcomingDeadlines: UpcomingDeadline[];
  projectsDistribution: ProjectDist[];
  myProjects: { id: string; name: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "all",         label: "Toutes" },
  { id: "todo",        label: "À faire" },
  { id: "in_progress", label: "En cours" },
  { id: "paused",      label: "En pause" },
  { id: "done",        label: "Terminées" },
  { id: "overdue",     label: "En retard" },
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  todo:        { label: "À faire",    color: "text-gray-500",  bg: "bg-gray-100",   Icon: Circle },
  in_progress: { label: "En cours",   color: "text-blue-600",  bg: "bg-blue-50",    Icon: Clock },
  paused:      { label: "En pause",   color: "text-amber-600", bg: "bg-amber-50",   Icon: Pause },
  done:        { label: "Terminée",   color: "text-green-600", bg: "bg-green-50",   Icon: CheckCircle2 },
  review:      { label: "En révision",color: "text-purple-600",bg: "bg-purple-50",  Icon: CheckCircle2 },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  high:   { label: "Haute",   color: "text-red-600",    dot: "bg-red-500" },
  normal: { label: "Normale", color: "text-orange-500", dot: "bg-orange-400" },
  low:    { label: "Basse",   color: "text-gray-400",   dot: "bg-gray-300" },
};

const DONUT_COLORS = ["#1A4D4F", "#E6B325", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isOverdue(task: TaskItem) {
  if (!task.dueDate) return false;
  if (task.status === "done" || task.status === "review") return false;
  return new Date(task.dueDate) < new Date();
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return `Dans ${diff}j`;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  if (total === 0) return (
    <div className="w-28 h-28 rounded-full border-[10px] border-gray-100 flex items-center justify-center">
      <span className="text-xs text-gray-400">Aucune</span>
    </div>
  );

  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = (d.count / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  const gradient = segments.map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`).join(", ");

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <div
        className="w-28 h-28 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-800">{total}</span>
        <span className="text-[10px] text-gray-400">tâches</span>
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({
  open, onClose, task, projects, onSave,
}: {
  open: boolean;
  onClose: () => void;
  task?: TaskItem | null;
  projects: { id: string; name: string }[];
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<string>(task?.priority ?? "normal");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : "");
  const [projectId, setProjectId] = useState(task?.projectId ?? "");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ title, description: description || undefined, status, priority, dueDate: dueDate ? new Date(dueDate).toISOString() : null, projectId: projectId || null });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">{task ? "Modifier la tâche" : "Nouvelle tâche"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Titre de la tâche"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Description optionnelle"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Statut</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Priorité</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Échéance</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Projet</label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Sans projet</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit"
              className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
              {task ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyTasksPage({ currentProfileId }: { currentProfileId: string }) {
  const [tab, setTab]           = useState("all");
  const [search, setSearch]     = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState("");
  const [page, setPage]         = useState(1);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTask, setEditTask]     = useState<TaskItem | null>(null);
  const [openMenu, setOpenMenu]     = useState<string | null>(null);

  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ["myTasks", tab, search, priority, projectId, page],
    [tab, search, priority, projectId, page]
  );

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ tab, page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (priority) params.set("priority", priority);
      if (projectId) params.set("projectId", projectId);
      return apiFetch(`/tasks?${params}`);
    },
    placeholderData: prev => prev,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["myTasks"] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiFetch("/tasks", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => { invalidate(); setModalOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: Record<string, unknown>) =>
      apiFetch(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => { invalidate(); setEditTask(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); setOpenMenu(null); },
  });

  const stats   = data?.stats;
  const tasks   = data?.tasks ?? [];
  const pagination = data?.pagination;
  const upcomingDeadlines = data?.upcomingDeadlines ?? [];
  const projectsDistribution = data?.projectsDistribution ?? [];
  const myProjects = data?.myProjects ?? [];

  const donutData = stats ? [
    { label: "En cours",  count: stats.inProgress, color: "#3B82F6" },
    { label: "À faire",   count: stats.todo,        color: "#1A4D4F" },
    { label: "En pause",  count: stats.paused,      color: "#E6B325" },
    { label: "Terminées", count: stats.done,         color: "#10B981" },
    { label: "En retard", count: stats.overdue,      color: "#EF4444" },
  ].filter(d => d.count > 0) : [];

  function handleSave(body: Record<string, unknown>) {
    if (editTask) {
      updateMutation.mutate({ id: editTask.id, ...body });
    } else {
      createMutation.mutate(body);
    }
  }

  function openEdit(task: TaskItem) {
    setEditTask(task);
    setOpenMenu(null);
  }

  function handleDelete(id: string) {
    if (confirm("Supprimer cette tâche ?")) deleteMutation.mutate(id);
  }

  return (
    <div className="flex gap-6 min-h-0">
      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mes tâches</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {stats ? `${stats.total} tâche${stats.total !== 1 ? "s" : ""} au total` : "Chargement…"}
            </p>
          </div>
          <button
            onClick={() => { setEditTask(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nouvelle tâche
          </button>
        </div>

        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total",       value: stats.total,      color: "text-gray-800",   bg: "bg-gray-50"    },
              { label: "À faire",     value: stats.todo,       color: "text-primary",    bg: "bg-primary/5"  },
              { label: "En cours",    value: stats.inProgress, color: "text-blue-700",   bg: "bg-blue-50"    },
              { label: "En pause",    value: stats.paused,     color: "text-amber-700",  bg: "bg-amber-50"   },
              { label: "Terminées",   value: stats.done,       color: "text-green-700",  bg: "bg-green-50"   },
              { label: "En retard",   value: stats.overdue,    color: "text-red-600",    bg: "bg-red-50"     },
            ].map(c => (
              <div key={c.label} className={`${c.bg} rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-white text-primary shadow-sm font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {t.id === "overdue" && stats && stats.overdue > 0 && (
                <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.overdue}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher une tâche…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={priority}
              onChange={e => { setPriority(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="normal">Normale</option>
              <option value="low">Basse</option>
            </select>
            <select
              value={projectId}
              onChange={e => { setProjectId(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white max-w-[180px] truncate"
            >
              <option value="">Tous les projets</option>
              {myProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Task table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle2 size={40} className="mb-3 text-gray-200" />
              <p className="font-medium text-gray-500">Aucune tâche trouvée</p>
              <p className="text-sm mt-1">Modifiez les filtres ou créez une nouvelle tâche</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tâche</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Projet</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Priorité</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Échéance</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map(task => {
                    const sc = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
                    const pc = PRIORITY_CONFIG[task.priority ?? "normal"];
                    const overdue = isOverdue(task);

                    return (
                      <tr key={task.id} className="hover:bg-gray-50/50 transition-colors group">
                        {/* Title */}
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <div className="flex items-start gap-3">
                            <sc.Icon size={16} className={`mt-0.5 flex-shrink-0 ${sc.color}`} />
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${task.status === "done" || task.status === "review" ? "line-through text-gray-400" : "text-gray-800"}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Project */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          {task.project ? (
                            <Link
                              href={`/dashboard/projets/${task.project.id}`}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors"
                            >
                              <Folder size={12} />
                              <span className="max-w-[140px] truncate">{task.project.name}</span>
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        {/* Priority */}
                        <td className="py-3.5 px-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
                            <span className={`text-xs font-medium ${pc.color}`}>{pc.label}</span>
                          </div>
                        </td>
                        {/* Due date */}
                        <td className="py-3.5 px-4">
                          {task.dueDate ? (
                            <div className={`flex items-center gap-1.5 text-xs font-medium ${
                              overdue ? "text-red-600" : "text-gray-600"
                            }`}>
                              {overdue && <AlertCircle size={12} />}
                              <Calendar size={12} />
                              {formatDate(task.dueDate)}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                            {overdue ? "En retard" : sc.label}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            {openMenu === task.id && (
                              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36">
                                <button
                                  onClick={() => openEdit(task)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Pencil size={13} /> Modifier
                                </button>
                                <button
                                  onClick={() => handleDelete(task.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={13} /> Supprimer
                                </button>
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
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} sur {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700">{page} / {pagination.pages}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside className="w-72 flex-shrink-0 space-y-4 hidden xl:flex xl:flex-col">
        {/* Résumé donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Résumé</h3>
          {stats && (
            <div className="flex items-center gap-4">
              <DonutChart data={donutData} total={stats.total} />
              <div className="space-y-1.5 flex-1 min-w-0">
                {donutData.map(d => (
                  <div key={d.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-gray-600 truncate">{d.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Échéances à venir */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Échéances à venir</h3>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">Aucune échéance cette semaine</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingDeadlines.map(d => (
                <div key={d.id} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar size={13} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-700">{formatDateFull(d.dueDate)}</p>
                    {d.projectName && (
                      <p className="text-[11px] text-gray-400 truncate">{d.projectName}</p>
                    )}
                    <p className="text-[11px] font-semibold text-primary mt-0.5">{daysUntil(d.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mes projets */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Mes projets</h3>
          {projectsDistribution.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">Aucun projet</p>
          ) : (
            <div className="space-y-2">
              {projectsDistribution.slice(0, 6).map((p, i) => {
                const pct = stats ? Math.round((p.count / stats.total) * 100) : 0;
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/dashboard/projets/${p.id}`} className="text-xs text-gray-700 hover:text-primary transition-colors truncate max-w-[160px]">
                        {p.name}
                      </Link>
                      <span className="text-xs font-semibold text-gray-500 flex-shrink-0 ml-2">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Actions rapides</h3>
          <div className="space-y-2">
            <button
              onClick={() => { setEditTask(null); setModalOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Plus size={14} className="text-primary" />
              </div>
              Nouvelle tâche
            </button>
            <Link
              href="/dashboard/projets"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Folder size={14} className="text-accent" />
              </div>
              Voir les projets
            </Link>
            <button
              onClick={() => { setTab("overdue"); setPage(1); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Zap size={14} className="text-red-500" />
              </div>
              Tâches en retard
              {stats && stats.overdue > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.overdue}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Modal */}
      <TaskModal
        open={modalOpen || editTask !== null}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        task={editTask}
        projects={myProjects}
        onSave={handleSave}
      />

      {/* Close menu on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
