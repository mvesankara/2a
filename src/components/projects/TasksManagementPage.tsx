"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ClipboardList, CheckCircle2, RefreshCw, Clock, AlertCircle, Lock,
  Search, ChevronDown, X, Download, Plus, Pencil, MoreVertical,
  Loader2, ChevronLeft, ChevronRight, Trash2, Save, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskProfile {
  id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null;
}
interface TaskData {
  id: string; title: string; description: string | null;
  status: "todo" | "in_progress" | "done" | "review";
  priority: string | null; dueDate: string | null;
  progress: number; isBlocked: boolean; projectRole: string | null;
  profile: TaskProfile | null; createdAt: string;
}
interface MemberData {
  id: string; profileId: string; role: string | null; profile: TaskProfile;
}
interface Stats { total: number; done: number; inProgress: number; pending: number; overdue: number; blocked: number }
interface ApiResponse { tasks: TaskData[]; total: number; page: number; perPage: number; stats: Stats; members: MemberData[] }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "",          label: "Tous les statuts" },
  { value: "en_cours",  label: "En cours" },
  { value: "en_attente",label: "En attente" },
  { value: "terminee",  label: "Terminée" },
  { value: "retard",    label: "En retard" },
  { value: "bloquee",   label: "Bloquée" },
];

const PRIORITY_OPTIONS = [
  { value: "",       label: "Toutes les priorités" },
  { value: "high",   label: "Élevée" },
  { value: "normal", label: "Moyenne" },
  { value: "low",    label: "Basse" },
];

const SORT_OPTIONS = [
  { value: "recent",   label: "Plus récentes" },
  { value: "oldest",   label: "Plus anciennes" },
  { value: "dueDate",  label: "Échéance proche" },
  { value: "priority", label: "Priorité" },
  { value: "progress", label: "Avancement" },
];

const PRIORITY_META: Record<string, { label: string; cls: string }> = {
  high:   { label: "Élevée",  cls: "bg-red-50 text-red-600 border border-red-100" },
  normal: { label: "Moyenne", cls: "bg-gray-100 text-gray-600" },
  low:    { label: "Basse",   cls: "bg-blue-50 text-blue-600" },
};

// ─── Computed status ──────────────────────────────────────────────────────────

type DisplayStatus = "en_cours" | "en_attente" | "terminee" | "retard" | "bloquee";

function getDisplayStatus(task: Pick<TaskData, "status" | "isBlocked" | "dueDate">): DisplayStatus {
  if (task.isBlocked) return "bloquee";
  if (task.status === "done" || task.status === "review") return "terminee";
  if (task.dueDate && new Date(task.dueDate) < new Date()) return "retard";
  if (task.status === "in_progress") return "en_cours";
  return "en_attente";
}

const DISPLAY_STATUS_META: Record<DisplayStatus, { label: string; cls: string }> = {
  en_cours:   { label: "En cours",   cls: "bg-amber-100 text-amber-700" },
  en_attente: { label: "En attente", cls: "bg-blue-50 text-blue-700" },
  terminee:   { label: "Terminée",   cls: "bg-gray-100 text-gray-600" },
  retard:     { label: "En retard",  cls: "bg-red-100 text-red-700" },
  bloquee:    { label: "Bloquée",    cls: "bg-gray-100 text-gray-500" },
};

// ─── Due date display ─────────────────────────────────────────────────────────

function DueDateDisplay({ dueDate, status }: { dueDate: string | null; status: DisplayStatus }) {
  if (!dueDate) return <span className="text-xs text-gray-400">—</span>;
  const date = new Date(dueDate);
  const days = differenceInDays(date, new Date());

  let relativeText: string;
  let relativeCls: string;

  if (status === "terminee") {
    relativeText = "Terminée";
    relativeCls  = "text-green-600 font-semibold";
  } else if (days < 0) {
    relativeText = `En retard de ${Math.abs(days)} jour${Math.abs(days) > 1 ? "s" : ""}`;
    relativeCls  = "text-red-600 font-semibold";
  } else if (days === 0) {
    relativeText = "Aujourd'hui";
    relativeCls  = "text-orange-600 font-semibold";
  } else if (days <= 7) {
    relativeText = `Dans ${days} jour${days > 1 ? "s" : ""}`;
    relativeCls  = "text-amber-600 font-semibold";
  } else {
    relativeText = `Dans ${days} jours`;
    relativeCls  = "text-gray-500";
  }

  return (
    <div>
      <p className="text-sm text-gray-700">{format(date, "d MMM yyyy", { locale: fr })}</p>
      <p className={cn("text-xs mt-0.5", relativeCls)}>{relativeText}</p>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ profile }: { profile: TaskProfile | null }) {
  if (!profile) return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
      <User size={14} className="text-gray-400" />
    </div>
  );
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
      {profile.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
        : initials}
    </div>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function Dropdown({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 h-10 px-3.5 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap",
          value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
        )}
      >
        {selected?.value ? selected.label : label}
        <ChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-20 min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn("w-full text-left px-4 py-2 text-sm transition-colors", opt.value === value ? "bg-primary/5 text-primary font-semibold" : "text-gray-700 hover:bg-gray-50")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

interface TaskFormState {
  title: string; description: string; assignedProfileId: string;
  status: string; priority: string; dueDate: string; progress: string;
}

function TaskModal({
  task, projectId, members, onClose, onSaved,
}: {
  task: TaskData | null;
  projectId: string;
  members: MemberData[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TaskFormState>({
    title:             task?.title ?? "",
    description:       task?.description ?? "",
    assignedProfileId: task?.profile?.id ?? "",
    status:            task?.status ?? "todo",
    priority:          task?.priority ?? "normal",
    dueDate:           task?.dueDate ? task.dueDate.slice(0, 10) : "",
    progress:          String(task?.progress ?? 0),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof TaskFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setErrors({ title: "Le titre est requis" }); return; }
    setErrors({});
    setSaving(true);
    try {
      const token = getToken();
      const url   = task ? `/api/projects/${projectId}/tasks/${task.id}` : `/api/projects/${projectId}/tasks`;
      const method = task ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:             form.title.trim(),
          description:       form.description || null,
          assignedProfileId: form.assignedProfileId || null,
          status:            form.status,
          priority:          form.priority,
          dueDate:           form.dueDate || null,
          progress:          Number(form.progress),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur");
      }
      toast({ title: task ? "Tâche mise à jour" : "Tâche créée" });
      onSaved();
      onClose();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";
  const selectCls = "w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white appearance-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">{task ? "Modifier la tâche" : "Nouvelle tâche"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={set("title")} placeholder="Titre de la tâche" className={cn(inputCls, errors.title && "border-red-400")} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Description optionnelle…" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Responsable</label>
              <div className="relative">
                <select value={form.assignedProfileId} onChange={set("assignedProfileId")} className={selectCls}>
                  <option value="">Non assigné</option>
                  {members.map((m) => (
                    <option key={m.profileId} value={m.profileId}>
                      {[m.profile.firstName, m.profile.lastName].filter(Boolean).join(" ")}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
              <div className="relative">
                <select value={form.status} onChange={set("status")} className={selectCls}>
                  <option value="todo">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="review">En revue</option>
                  <option value="done">Terminée</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priorité</label>
              <div className="relative">
                <select value={form.priority} onChange={set("priority")} className={selectCls}>
                  <option value="low">Basse</option>
                  <option value="normal">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Échéance</label>
              <input type="date" value={form.dueDate} onChange={set("dueDate")} className={inputCls} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Avancement</label>
              <span className="text-sm font-bold text-primary">{form.progress}%</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={form.progress} onChange={set("progress")} className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Enregistrement…" : task ? "Enregistrer" : "Créer la tâche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Actions menu per row ─────────────────────────────────────────────────────

function RowActions({ task, projectId, onEdit, onDeleted }: {
  task: TaskData; projectId: string;
  onEdit: () => void; onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleDelete = async () => {
    setOpen(false);
    if (!confirm("Supprimer cette tâche ?")) return;
    try {
      const token = getToken();
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur");
      toast({ title: "Tâche supprimée" });
      onDeleted();
    } catch {
      toast({ title: "Impossible de supprimer la tâche", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button onClick={onEdit} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors" title="Modifier">
        <Pencil size={13} className="text-gray-500" />
      </button>
      <div ref={ref} className="relative">
        <button onClick={() => setOpen((o) => !o)} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <MoreVertical size={13} className="text-gray-500" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden">
            <button onClick={() => { onEdit(); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Pencil size={13} className="text-gray-400" /> Modifier
            </button>
            <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, perPage, total, onPage, onPerPage }: {
  page: number; perPage: number; total: number;
  onPage: (p: number) => void; onPerPage: (pp: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  const pages: (number | "…")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
  if (page < totalPages - 2) pages.push("…");
  if (totalPages > 1) add(totalPages);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">Affichage de {from} à {to} sur {total} tâche{total > 1 ? "s" : ""}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={15} />
        </button>
        {pages.map((p, i) => p === "…" ? (
          <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)} className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors", p === page ? "bg-primary text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50")}>
            {p}
          </button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Par page</span>
        <select value={perPage} onChange={(e) => onPerPage(Number(e.target.value))} className="h-8 px-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none appearance-none bg-white">
          {[6, 12, 24].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TasksManagementPage({
  projectId, projectName, currentProfileId,
}: {
  projectId: string; projectName: string; currentProfileId: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");
  const [priorityFilter,  setPriorityFilter]  = useState("");
  const [memberFilter,    setMemberFilter]    = useState("");
  const [sort,            setSort]            = useState("recent");
  const [page,            setPage]            = useState(1);
  const [perPage,         setPerPage]         = useState(6);
  const [viewTab,         setViewTab]         = useState("all");
  const [editingTask,     setEditingTask]     = useState<TaskData | null>(null);
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [selected,        setSelected]        = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const resetFilters = useCallback(() => {
    setSearch(""); setDebouncedSearch("");
    setStatusFilter(""); setPriorityFilter(""); setMemberFilter(""); setSort("recent"); setPage(1);
  }, []);

  const hasActiveFilters = !!(debouncedSearch || statusFilter || priorityFilter || memberFilter);

  const qk = ["project-tasks", projectId, debouncedSearch, statusFilter, priorityFilter, memberFilter, sort, page, perPage];

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: qk,
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter    && { status: statusFilter }),
        ...(priorityFilter  && { priority: priorityFilter }),
        ...(memberFilter    && { profileId: memberFilter }),
        sort, page: String(page), perPage: String(perPage),
      });
      const res = await fetch(`/api/projects/${projectId}/tasks?${params}`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    staleTime: 15_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });

  const tasks   = data?.tasks   ?? [];
  const stats   = data?.stats;
  const members = data?.members ?? [];
  const total   = data?.total   ?? 0;

  const memberOptions = [
    { value: "", label: "Tous les responsables" },
    ...members.map((m) => ({
      value: m.profileId,
      label: [m.profile.firstName, m.profile.lastName].filter(Boolean).join(" ") || "—",
    })),
  ];

  const VIEW_TABS = [
    { id: "all",         label: "Toutes les tâches" },
    { id: "par_statut",  label: "Par statut" },
    { id: "par_resp",    label: "Par responsable" },
    { id: "par_priorite",label: "Par priorité" },
  ];

  const STAT_CARDS = [
    { icon: ClipboardList, label: "Total tâches",  value: stats?.total,      cls: "bg-gray-50",    iconCls: "bg-white text-gray-500" },
    { icon: CheckCircle2,  label: "Terminées",     value: stats?.done,       cls: "bg-white",      iconCls: "bg-primary/10 text-primary" },
    { icon: RefreshCw,     label: "En cours",      value: stats?.inProgress, cls: "bg-white",      iconCls: "bg-amber-100 text-amber-600" },
    { icon: Clock,         label: "En attente",    value: stats?.pending,    cls: "bg-white",      iconCls: "bg-blue-50 text-blue-600" },
    { icon: AlertCircle,   label: "En retard",     value: stats?.overdue,    cls: "bg-white",      iconCls: "bg-red-50 text-red-500" },
    { icon: Lock,          label: "Bloquées",      value: stats?.blocked,    cls: "bg-white",      iconCls: "bg-gray-100 text-gray-400" },
  ];

  // Select all toggle
  const allSelected = tasks.length > 0 && tasks.every((t) => selected.has(t.id));
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(tasks.map((t) => t.id)));
  const toggleOne   = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Title + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Gestion des tâches</h1>
          <p className="text-sm text-gray-400 mt-0.5">Organisez et suivez l&apos;avancement des tâches du projet.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast({ title: "Export", description: "Fonctionnalité bientôt disponible." })}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={15} /> Exporter
          </button>
          <button
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAT_CARDS.map(({ icon: Icon, label, value, cls, iconCls }) => (
          <div key={label} className={cn("flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-gray-100 shadow-sm", cls)}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconCls)}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-800 leading-none">{value ?? "—"}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* View tabs */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-gray-100 px-4">
          {VIEW_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewTab(id)}
              className={cn(
                "flex-shrink-0 px-4 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap",
                viewTab === id ? "text-primary border-primary" : "text-gray-400 border-transparent hover:text-gray-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {viewTab !== "all" ? (
          <div className="p-12 text-center">
            <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Vue disponible prochainement</p>
          </div>
        ) : (
          <>
            {/* Filter bar */}
            <div className="p-4 flex flex-wrap items-center gap-2.5 border-b border-gray-100">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Rechercher une tâche..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <Dropdown label="Statut"       value={statusFilter}   options={STATUS_OPTIONS}   onChange={(v) => { setStatusFilter(v);   setPage(1); }} />
              <Dropdown label="Priorité"     value={priorityFilter} options={PRIORITY_OPTIONS} onChange={(v) => { setPriorityFilter(v); setPage(1); }} />
              <Dropdown label="Responsable"  value={memberFilter}   options={memberOptions}    onChange={(v) => { setMemberFilter(v);   setPage(1); }} />

              {hasActiveFilters && (
                <button onClick={resetFilters} className="flex items-center gap-1.5 h-10 px-3.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <X size={13} /> Réinitialiser
                </button>
              )}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Trier par :</span>
                <Dropdown label="Trier" value={sort} options={SORT_OPTIONS} onChange={(v) => { setSort(v); setPage(1); }} />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 w-8">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded accent-primary" />
                    </th>
                    {["Tâche", "Responsable", "Statut", "Priorité", "Échéance", "Avancement", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Loader2 size={28} className="animate-spin text-primary mx-auto" />
                        <p className="text-sm text-gray-400 mt-2">Chargement…</p>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-sm text-red-500">Erreur de chargement.</td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <ClipboardList size={40} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Aucune tâche trouvée</p>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => {
                      const displayStatus = getDisplayStatus(task);
                      const statusMeta    = DISPLAY_STATUS_META[displayStatus];
                      const priorityMeta  = PRIORITY_META[task.priority ?? "normal"] ?? PRIORITY_META.normal;
                      const isChecked     = selected.has(task.id);
                      const name = task.profile
                        ? [task.profile.firstName, task.profile.lastName].filter(Boolean).join(" ") || "—"
                        : "Non assigné";
                      return (
                        <tr
                          key={task.id}
                          className={cn("border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors", isChecked && "bg-primary/3")}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={isChecked} onChange={() => toggleOne(task.id)} className="rounded accent-primary" />
                          </td>
                          {/* Tâche */}
                          <td className="px-4 py-3 max-w-[260px]">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                          </td>
                          {/* Responsable */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar profile={task.profile} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-700 truncate">{name}</p>
                                {task.projectRole && <p className="text-xs text-gray-400">{task.projectRole}</p>}
                              </div>
                            </div>
                          </td>
                          {/* Statut */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", statusMeta.cls)}>
                              {statusMeta.label}
                            </span>
                          </td>
                          {/* Priorité */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", priorityMeta.cls)}>
                              {priorityMeta.label}
                            </span>
                          </td>
                          {/* Échéance */}
                          <td className="px-4 py-3">
                            <DueDateDisplay dueDate={task.dueDate} status={displayStatus} />
                          </td>
                          {/* Avancement */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 w-8">{task.progress}%</span>
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3">
                            <RowActions
                              task={task}
                              projectId={projectId}
                              onEdit={() => { setEditingTask(task); setIsModalOpen(true); }}
                              onDeleted={invalidate}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && tasks.length > 0 && (
              <div className="px-4 pb-4">
                <Pagination page={page} perPage={perPage} total={total} onPage={setPage} onPerPage={(pp) => { setPerPage(pp); setPage(1); }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          projectId={projectId}
          members={members}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}
