"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MapPin, Calendar, FolderOpen, CheckCircle2, FileText,
  Pencil, MoreVertical, CalendarDays, Clock, Users, ImageOff,
  ChevronRight, ArrowLeft, TrendingUp, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity   { id: string; title: string; date: string | null; status: string; order: number }
interface Indicator  { id: string; label: string; current: number; target: number; unit: string | null }
interface Member     { id: string; role: string | null; profile: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null } }
interface TaskItem   { id: string; title: string; status: string; dueDate: string | null }
interface DocItem    { id: string; name: string; fileType: string; sizeBytes: number | null; createdAt: string }

interface ProjectData {
  id: string; name: string; shortDescription: string | null; description: string | null;
  category: string | null; imageUrl: string | null; isPublished: boolean;
  status: string; priority: string | null; progress: number;
  city: string | null; country: string | null; estimatedDuration: string | null;
  objectives: string | null; plannedActivities: string | null;
  targetBeneficiaries: string | null; successIndicators: string | null;
  budget: number | null; budgetSpent: number | null; budgetSources: string | null;
  humanResources: string | null;
  startDate: string | null; endDate: string | null;
  createdAt: string | null; updatedAt: string | null;
  createdByProfile: { id: string; firstName: string | null; lastName: string | null } | null;
  members: Member[]; tasks: TaskItem[]; activities: Activity[];
  indicators: Indicator[]; documents: DocItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "apercu",    label: "Aperçu" },
  { id: "activites", label: "Activités" },
  { id: "taches",    label: "Tâches" },
  { id: "documents", label: "Documents" },
  { id: "budget",    label: "Budget" },
  { id: "equipe",    label: "Équipe" },
  { id: "suivi",     label: "Suivi & Évaluation" },
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  en_cours: { label: "Actif",    cls: "bg-green-100 text-green-700" },
  en_revue: { label: "En cours", cls: "bg-amber-100 text-amber-700" },
  cloture:  { label: "Terminé",  cls: "bg-gray-100 text-gray-600"  },
};

const ACTIVITY_STATUS: Record<string, { label: string; cls: string }> = {
  termine:     { label: "Terminée",   cls: "bg-gray-100 text-gray-600" },
  en_cours:    { label: "En cours",   cls: "bg-amber-100 text-amber-700" },
  a_venir:     { label: "À venir",    cls: "bg-blue-100 text-blue-700" },
  a_planifier: { label: "À planifier", cls: "bg-gray-50 text-gray-500 border border-gray-200" },
};

const TASK_STATUS: Record<string, { label: string; cls: string }> = {
  done:        { label: "Terminée",   cls: "bg-gray-100 text-gray-600" },
  review:      { label: "En revue",   cls: "bg-primary/10 text-primary" },
  in_progress: { label: "En cours",   cls: "bg-amber-100 text-amber-700" },
  todo:        { label: "À faire",    cls: "bg-blue-50 text-blue-600" },
};

const PRIORITY_META: Record<string, { label: string; cls: string }> = {
  normale: { label: "Normale", cls: "text-gray-500" },
  elevee:  { label: "Élevée",  cls: "text-red-500 font-semibold" },
  urgente: { label: "Urgente", cls: "text-red-600 font-bold" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Éducation":     "bg-blue-50 text-blue-700",
  "Environnement": "bg-green-50 text-green-700",
  "Social":        "bg-purple-50 text-purple-700",
  "Santé":         "bg-cyan-50 text-cyan-700",
  "Innovation":    "bg-amber-50 text-amber-700",
  "Jeunesse":      "bg-pink-50 text-pink-700",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(date: string | null, pattern = "d MMM yyyy") {
  if (!date) return "—";
  try { return format(new Date(date), pattern, { locale: fr }); }
  catch { return "—"; }
}

function fmtAmount(val: number | null): string {
  if (val == null) return "—";
  return `${val.toLocaleString("fr-FR")} FCFA`;
}

function fmtSize(bytes: number | null): string {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} Ko`
    : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

// ─── Donut chart (SVG conic-gradient) ────────────────────────────────────────

function DonutChart({ done, inProgress, todo, progress }: { done: number; inProgress: number; todo: number; progress: number }) {
  const total = Math.max(done + inProgress + todo, 1);
  const donePct = (done / total) * 100;
  const inPct   = (inProgress / total) * 100;
  const todoPct = 100 - donePct - inPct;

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(
            #1A4D4F 0% ${donePct}%,
            #E6B325 ${donePct}% ${donePct + inPct}%,
            #E5E7EB ${donePct + inPct}% 100%
          )`,
        }}
      />
      <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
        <span className="text-2xl font-black text-primary leading-none">{progress}%</span>
      </div>
    </div>
  );
}

// ─── Avatar helper ────────────────────────────────────────────────────────────

function Avatar({ profile, size = "md" }: { profile: { firstName: string | null; lastName: string | null; avatarUrl: string | null }; size?: "sm" | "md" }) {
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const cls = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={cn("rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0 font-bold text-primary", cls)}>
      {profile.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
        : initials}
    </div>
  );
}

// ─── Document icon ────────────────────────────────────────────────────────────

function DocIcon({ type }: { type: string }) {
  const isPdf = type.toUpperCase() === "PDF";
  const isXls = type.toUpperCase().includes("XLS");
  const cls = isPdf ? "bg-red-50" : isXls ? "bg-green-50" : "bg-gray-50";
  const color = isPdf ? "text-red-500" : isXls ? "text-green-600" : "text-gray-500";
  return (
    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", cls)}>
      <FileText size={16} className={color} />
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ project, currentProfileId }: { project: ProjectData; currentProfileId: string }) {
  const { toast } = useToast();
  const statusMeta = STATUS_META[project.status] ?? STATUS_META.en_cours;
  const priorityMeta = PRIORITY_META[project.priority ?? "normale"] ?? PRIORITY_META.normale;
  const location = [project.city, project.country].filter(Boolean).join(", ");
  const updatedByName = project.createdByProfile
    ? [project.createdByProfile.firstName, project.createdByProfile.lastName].filter(Boolean).join(" ")
    : "—";

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Statut",          value: <span className={cn("font-semibold", statusMeta.cls.replace("bg-", "text-").replace(/\s.*/, ""), "text-sm")}>{statusMeta.label}</span> },
    { label: "Priorité",        value: <span className={cn("text-sm", priorityMeta.cls)}>{priorityMeta.label}</span> },
    { label: "Catégorie",       value: <span className="text-sm text-gray-700">{project.category ?? "—"}</span> },
    { label: "Localisation",    value: <span className="text-sm text-gray-700">{location || "—"}</span> },
    { label: "Date de début",   value: <span className="text-sm text-gray-700">{fmt(project.startDate)}</span> },
    { label: "Date de fin prévue", value: <span className="text-sm text-gray-700">{fmt(project.endDate)}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Statut */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Statut du projet</h3>
          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", statusMeta.cls)}>
            {statusMeta.label}
          </span>
        </div>
        <div className="space-y-2.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
              <div className="text-right">{value}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => toast({ title: "Bientôt disponible", description: "Le plan du projet sera disponible prochainement." })}
          className="mt-4 w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Voir le plan du projet
          <CalendarDays size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Équipe */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Équipe du projet</h3>
          <button className="text-xs text-primary font-semibold hover:underline">Voir tout</button>
        </div>
        {project.members.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Aucun membre</p>
        ) : (
          <div className="space-y-3">
            {project.members.slice(0, 4).map((m) => {
              const isCurrentUser = m.profile.id === currentProfileId;
              const isCoord = m.role?.toLowerCase().includes("coordinateur") || m.role?.toLowerCase().includes("responsable");
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar profile={m.profile} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {[m.profile.firstName, m.profile.lastName].filter(Boolean).join(" ") || "—"}
                    </p>
                    <p className="text-xs text-gray-400">{m.role ?? "Membre"}</p>
                  </div>
                  {isCurrentUser && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full flex-shrink-0">Vous</span>
                  )}
                  {!isCurrentUser && isCoord && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex-shrink-0">Responsable</span>
                  )}
                  {!isCurrentUser && !isCoord && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0">Membre</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Documents */}
      {project.documents.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Documents</h3>
            <button className="text-xs text-primary font-semibold hover:underline">Voir tout</button>
          </div>
          <div className="space-y-2.5">
            {project.documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 rounded-xl p-1 -mx-1 transition-colors">
                <DocIcon type={doc.fileType} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-primary transition-colors">{doc.name}</p>
                  <p className="text-[10px] text-gray-400">{doc.fileType} · {fmtSize(doc.sizeBytes)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dernière mise à jour */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Dernière mise à jour</h3>
        <p className="text-sm text-gray-600">
          {project.updatedAt
            ? `Il y a ${Math.max(1, Math.round((Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24)))} jour(s) par ${updatedByName}`
            : "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ project }: { project: ProjectData }) {
  const done       = project.tasks.filter((t) => t.status === "done" || t.status === "review").length;
  const inProgress = project.tasks.filter((t) => t.status === "in_progress").length;
  const todo       = project.tasks.filter((t) => t.status === "todo").length;
  const total      = project.tasks.length;

  const objectiveLines = project.objectives?.split("\n").filter(Boolean) ?? [];

  const stats = [
    { icon: CalendarDays, label: "Date de début",       value: fmt(project.startDate) },
    { icon: Calendar,     label: "Date de fin prévue",  value: fmt(project.endDate) },
    { icon: Clock,        label: "Durée",                value: project.estimatedDuration ?? "—" },
    { icon: FolderOpen,   label: "Budget total",         value: fmtAmount(project.budget) },
    { icon: TrendingUp,   label: "Dépensé",              value: fmtAmount(project.budgetSpent) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
      {/* ── Left column ──────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Progression */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">Progression du projet</h3>
            <span className="text-sm font-black text-primary">{project.progress}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          {/* 5-stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Icon size={16} className="text-gray-500" />
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
                <p className="text-xs font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
          </div>
        )}

        {/* Objectifs */}
        {objectiveLines.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Objectifs principaux</h3>
            <ul className="space-y-2.5">
              {objectiveLines.map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Activités récentes */}
        {project.activities.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Activités récentes</h3>
            <div className="divide-y divide-gray-50">
              {project.activities.slice(0, 4).map((act) => {
                const meta = ACTIVITY_STATUS[act.status] ?? ACTIVITY_STATUS.a_venir;
                return (
                  <div key={act.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderOpen size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{act.title}</p>
                      {act.date && (
                        <p className="text-xs text-gray-400 mt-0.5">{fmt(act.date)}</p>
                      )}
                    </div>
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0", meta.cls)}>
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {project.activities.length > 4 && (
              <button className="mt-4 flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                Voir toutes les activités <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Right column ─────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Avancement donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Avancement</h3>
          <div className="flex items-center gap-6">
            <DonutChart done={done} inProgress={inProgress} todo={todo} progress={project.progress} />
            <div className="space-y-2.5">
              {[
                { label: "Terminée", count: done,       pct: total ? Math.round((done / total) * 100) : 0,       color: "bg-primary" },
                { label: "En cours", count: inProgress,  pct: total ? Math.round((inProgress / total) * 100) : 0,  color: "bg-accent" },
                { label: "À venir",  count: todo,        pct: total ? Math.round((todo / total) * 100) : 0,        color: "bg-gray-200" },
              ].map(({ label, count, pct, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", color)} />
                  <span className="text-xs text-gray-600">{label}</span>
                  <span className="text-xs font-bold text-gray-800 ml-auto">{count} ({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicateurs clés */}
        {project.indicators.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Indicateurs clés</h3>
            <div className="space-y-4">
              {project.indicators.map((ind) => {
                const pct = Math.min(100, Math.round((ind.current / Math.max(ind.target, 1)) * 100));
                return (
                  <div key={ind.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-600">{ind.label}</span>
                      <span className="text-xs font-bold text-gray-800">{ind.current} / {ind.target}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Impact attendu */}
        {project.targetBeneficiaries && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Impact attendu</h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-primary" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{project.targetBeneficiaries}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TasksTab({ tasks }: { tasks: TaskItem[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Target size={36} className="text-gray-200 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-400">Aucune tâche pour ce projet</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["Tâche", "Statut", "Échéance"].map((h) => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tasks.map((t) => {
            const meta = TASK_STATUS[t.status] ?? TASK_STATUS.todo;
            return (
              <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-700">{t.title}</td>
                <td className="px-5 py-3">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", meta.cls)}>{meta.label}</span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{fmt(t.dueDate)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Team Tab ─────────────────────────────────────────────────────────────────

function TeamTab({ members, currentProfileId }: { members: Member[]; currentProfileId: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-5">Membres de l&apos;équipe ({members.length})</h3>
      {members.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-8">Aucun membre dans ce projet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {members.map((m) => {
            const name = [m.profile.firstName, m.profile.lastName].filter(Boolean).join(" ") || "—";
            const isCurrentUser = m.profile.id === currentProfileId;
            const isCoord = m.role?.toLowerCase().includes("coordinateur") || m.role?.toLowerCase().includes("responsable");
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Avatar profile={m.profile} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-400">{m.role ?? "Membre"}</p>
                </div>
                {isCurrentUser && (
                  <span className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">Vous</span>
                )}
                {!isCurrentUser && isCoord && (
                  <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Responsable</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Placeholder Tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FolderOpen size={24} className="text-primary" />
      </div>
      <h3 className="text-base font-bold text-primary mb-2">Bientôt disponible</h3>
      <p className="text-sm text-gray-400">La section &laquo;&nbsp;{label}&nbsp;&raquo; sera disponible prochainement.</p>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ProjectDetailPage({ data }: { data: { project: ProjectData; currentProfileId: string } }) {
  const { project, currentProfileId } = data;
  const [tab, setTab] = useState("apercu");
  const { toast } = useToast();

  const statusMeta = STATUS_META[project.status] ?? STATUS_META.en_cours;
  const catCls = CATEGORY_COLORS[project.category ?? ""] ?? "bg-gray-100 text-gray-600";
  const location = [project.city, project.country].filter(Boolean).join(", ");
  const creatorName = project.createdByProfile
    ? [project.createdByProfile.firstName, project.createdByProfile.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Image */}
          <div className="w-full sm:w-56 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
            {project.imageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              : <ImageOff size={28} className="text-gray-300" />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-gray-800">{project.name}</h1>
                  <span className={cn("text-xs font-bold px-3 py-1 rounded-full", statusMeta.cls)}>
                    {statusMeta.label}
                  </span>
                </div>
                {project.shortDescription && (
                  <p className="text-sm text-gray-500 mt-1.5 max-w-xl leading-relaxed">{project.shortDescription}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toast({ title: "Bientôt disponible", description: "La modification de projet arrive prochainement." })}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={14} /> Modifier le projet
                </button>
                <button
                  onClick={() => toast({ title: "Options", description: "Menu d'options disponible prochainement." })}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Plus d&apos;options <MoreVertical size={14} />
                </button>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
              {project.category && (
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full", catCls)}>
                  <FolderOpen size={11} /> {project.category}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin size={12} className="text-primary" /> {location}
                </span>
              )}
              {project.createdAt && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={12} className="text-primary" />
                  Créé le {fmt(project.createdAt)}
                  {creatorName && ` par ${creatorName}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-start">
        <div className="space-y-5">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-none border-b border-gray-100">
              {TABS.map(({ id, label }) =>
                id === "taches" ? (
                  <Link
                    key={id}
                    href={`/dashboard/projets/${project.id}/taches`}
                    className="flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300"
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap",
                      tab === id
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                    )}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tab content */}
          {tab === "apercu"    && <OverviewTab project={project} />}
          {tab === "taches"    && <TasksTab tasks={project.tasks} />}
          {tab === "equipe"    && <TeamTab members={project.members} currentProfileId={currentProfileId} />}
          {["activites", "documents", "budget", "suivi"].includes(tab) && (
            <PlaceholderTab label={TABS.find((t) => t.id === tab)?.label ?? ""} />
          )}
        </div>

        {/* Sidebar */}
        <Sidebar project={project} currentProfileId={currentProfileId} />
      </div>
    </div>
  );
}
