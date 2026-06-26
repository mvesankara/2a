import Link from "next/link";
import { CalendarDays, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCard {
  id: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  progress: number;
  status: string;
  endDate: string | null;
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  en_cours: { label: "En cours", class: "bg-primary/10 text-primary" },
  en_revue: { label: "En revue", class: "bg-amber-100 text-amber-700" },
  cloture: { label: "Clôturé", class: "bg-gray-100 text-gray-500" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProjectsSection({ projects }: { projects: ProjectCard[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Mes projets récents</h3>
        <Link href="/dashboard/projets" className="text-xs text-primary font-semibold hover:underline">
          Voir tous
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Vous n&apos;êtes membre d&apos;aucun projet pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const statusInfo = STATUS_LABELS[p.status] ?? STATUS_LABELS.en_cours;
            return (
              <div key={p.id} className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff size={16} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>

                  {/* Progress */}
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          p.progress >= 80 ? "bg-green-500" : "bg-primary"
                        )}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium flex-shrink-0">
                      {p.progress}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {p.endDate && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <CalendarDays size={10} />
                        Échéance : {formatDate(p.endDate)}
                      </span>
                    )}
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto", statusInfo.class)}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
