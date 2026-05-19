"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  projectName: string | null;
  priority: string | null;
}

interface TasksSectionProps {
  initialTasks: Task[];
  profileId: string;
}

function formatDue(iso: string) {
  const d = new Date(iso);
  return format(d, "d MMM", { locale: fr });
}

function dueDateClass(iso: string | null, isDone: boolean) {
  if (!iso || isDone) return "text-gray-400";
  const d = new Date(iso);
  if (isToday(d)) return "text-amber-500 font-semibold";
  if (isPast(d)) return "text-red-500 font-semibold";
  return "text-gray-400";
}

export default function TasksSection({ initialTasks, profileId: _profileId }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const toggleTask = async (task: Task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));

    try {
      const r = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!r.ok) throw new Error();
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      toast({ title: "Erreur", description: "Impossible de mettre à jour la tâche", variant: "destructive" });
    }
  };

  const deleteTask = async (taskId: string) => {
    const prev = tasks;
    setTasks((t) => t.filter((x) => x.id !== taskId));
    try {
      const r = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!r.ok) throw new Error();
    } catch {
      setTasks(prev);
      toast({ title: "Erreur", description: "Impossible de supprimer la tâche", variant: "destructive" });
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          title: newTitle.trim(),
          dueDate: newDue ? new Date(newDue).toISOString() : undefined,
        }),
      });
      if (!r.ok) throw new Error();
      const created: Task = await r.json();
      setTasks((prev) => [...prev, { ...created, projectName: created.projectName ?? null }]);
      setNewTitle("");
      setNewDue("");
      setAdding(false);
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer la tâche", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Mes tâches</h3>
        <button className="text-xs text-primary font-semibold hover:underline">
          Voir toutes
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.length === 0 && !adding && (
          <p className="text-sm text-gray-400 text-center py-6">
            Aucune tâche pour l&apos;instant.
          </p>
        )}

        {tasks.map((task) => {
          const isDone = task.status === "done";
          return (
            <div
              key={task.id}
              className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 group"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                  isDone
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300 hover:border-primary"
                )}
                aria-label={isDone ? "Marquer comme non fait" : "Marquer comme fait"}
              >
                {isDone && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium leading-tight", isDone && "line-through text-gray-400")}>
                  {task.title}
                </p>
                {task.projectName && (
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{task.projectName}</p>
                )}
              </div>

              {/* Due date */}
              {task.dueDate && (
                <span className={cn("text-[11px] flex-shrink-0", dueDateClass(task.dueDate, isDone))}>
                  {formatDue(task.dueDate)}
                </span>
              )}

              {/* Delete (on hover) */}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                aria-label="Supprimer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add task form */}
      {adding ? (
        <form onSubmit={addTask} className="mt-3 space-y-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre de la tâche…"
            required
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white text-sm rounded-xl font-medium hover:bg-primary/90 disabled:opacity-70 flex items-center gap-1"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setNewTitle(""); setNewDue(""); }}
              className="px-3 py-2 text-gray-400 text-sm rounded-xl hover:bg-gray-50"
            >
              ✕
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
        >
          <Plus size={16} />
          Ajouter une tâche
        </button>
      )}
    </div>
  );
}
