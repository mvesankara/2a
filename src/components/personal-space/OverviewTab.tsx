import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users, CheckSquare, Clock, Newspaper, CalendarDays,
  FileText, TrendingUp, MessageSquare, FolderOpen, ImageOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  en_cours: { label: "En cours", cls: "bg-primary/10 text-primary" },
  en_revue: { label: "En revue", cls: "bg-amber-100 text-amber-700" },
  cloture: { label: "Clôturé", cls: "bg-gray-100 text-gray-500" },
};

const ACTIVITY_ICONS: Record<string, { Icon: typeof Users; cls: string }> = {
  task_completed: { Icon: CheckSquare, cls: "bg-green-100 text-green-600" },
  project_joined: { Icon: FolderOpen, cls: "bg-amber-100 text-amber-600" },
  article_published: { Icon: Newspaper, cls: "bg-primary/10 text-primary" },
  article: { Icon: FileText, cls: "bg-blue-100 text-blue-600" },
  task: { Icon: CheckSquare, cls: "bg-green-100 text-green-600" },
  invitation: { Icon: Users, cls: "bg-purple-100 text-purple-600" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({ title, action, href, children }: { title: string; action?: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {action && href && (
          <a href={href} className="text-xs text-primary font-semibold hover:underline">{action}</a>
        )}
      </div>
      {children}
    </div>
  );
}

function AboutCard({ profile }: { profile: { personalDescription: string | null; dateOfBirth: string | null; gender: string | null; country: string | null } }) {
  return (
    <Card title="À propos de moi">
      {profile.personalDescription ? (
        <p className="text-sm text-gray-600 leading-relaxed">{profile.personalDescription}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">Aucune description renseignée.</p>
      )}
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-gray-50">
        {[
          { label: "Date de naissance", value: profile.dateOfBirth ? format(new Date(profile.dateOfBirth), "d MMMM yyyy", { locale: fr }) : "—" },
          { label: "Genre", value: profile.gender ?? "—" },
          { label: "Pays", value: profile.country ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <CalendarDays size={16} className="text-gray-300" />
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xs font-semibold text-gray-700">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProjectsCard({ projects }: { projects: Array<{ id: string; name: string; imageUrl: string | null; progress: number; status: string; memberRole: string | null }> }) {
  return (
    <Card title="Mes projets" action="Voir tous" href="/projets">
      {projects.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun projet rejoint.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const statusInfo = STATUS_LABELS[p.status] ?? STATUS_LABELS.en_cours;
            return (
              <div key={p.id} className="flex gap-3">
                <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {p.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    : <ImageOff size={14} className="text-gray-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400">Rôle : {p.memberRole ?? "Membre actif"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{p.progress}%</span>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0", statusInfo.cls)}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function EngagementCard({ engagement }: {
  engagement: { projectsCount: number; activeProjectsCount: number; tasksCompleted: number; tasksThisMonth: number; hoursInvested: number; hoursThisMonth: number; articlesPublished: number; articlesPending: number }
}) {
  const stats = [
    { icon: Users, label: "Projets rejoints", value: engagement.projectsCount, sub: `${engagement.activeProjectsCount} en cours`, cls: "bg-primary/10 text-primary" },
    { icon: CheckSquare, label: "Tâches complétées", value: engagement.tasksCompleted, sub: `+${engagement.tasksThisMonth} ce mois-ci`, cls: "bg-accent/15 text-accent" },
    { icon: Clock, label: "Heures consacrées", value: `${engagement.hoursInvested}h`, sub: `+${engagement.hoursThisMonth}h ce mois-ci`, cls: "bg-amber-100 text-amber-600" },
    { icon: Newspaper, label: "Articles publiés", value: engagement.articlesPublished, sub: `${engagement.articlesPending} en attente`, cls: "bg-green-100 text-green-600" },
  ];
  return (
    <Card title="Mon engagement">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value, sub, cls }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", cls)}>
              <Icon size={16} />
            </div>
            <p className="text-xl font-black text-gray-800">{value}</p>
            <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
            <p className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={9} />{sub}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivitiesCard({ activities }: { activities: Array<{ id: string; type: string; title: string; description: string; createdAt: string }> }) {
  return (
    <Card title="Activités récentes" action="Voir tout" href="/dashboard/espace-personnel?tab=activites">
      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucune activité récente.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((a) => {
            const iconInfo = ACTIVITY_ICONS[a.type] ?? { Icon: MessageSquare, cls: "bg-gray-100 text-gray-500" };
            const Icon = iconInfo.Icon;
            return (
              <div key={a.id} className="flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", iconInfo.cls)}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">
                    <span className="font-semibold">{a.title}</span>{" "}
                    {a.description}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function EventsCard({ events }: { events: Array<{ id: string; title: string; location: string | null; startDate: string }> }) {
  return (
    <Card title="Prochains événements" action="Voir tout" href="/evenements">
      {events.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun événement à venir.</p>
      ) : (
        <div className="space-y-3">
          {events.map((e) => {
            const date = new Date(e.startDate);
            return (
              <div key={e.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center bg-primary/10 rounded-xl px-2.5 py-2 min-w-[48px] text-center flex-shrink-0">
                  <span className="text-lg font-black text-primary leading-none">{format(date, "d")}</span>
                  <span className="text-[9px] font-bold text-primary uppercase">{format(date, "MMM", { locale: fr })}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{e.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {format(date, "d MMMM yyyy • HH:mm", { locale: fr })}
                  </p>
                  {e.location && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                      <CalendarDays size={9} /> {e.location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function DocumentsCard({ documents }: { documents: Array<{ id: string; name: string; fileType: string; sizeBytes: number | null; createdAt: string }> }) {
  return (
    <Card title="Documents récents" action="Voir tout" href="/dashboard/espace-personnel?tab=documents">
      <div className="space-y-2.5">
        {documents.map((d) => (
          <div key={d.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-primary transition-colors">{d.name}</p>
              <p className="text-[10px] text-gray-400">
                {d.fileType} · {format(new Date(d.createdAt), "d MMM yyyy", { locale: fr })} · {formatSize(d.sizeBytes)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function OverviewTab({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] gap-5 items-start">
      {/* Left column */}
      <div className="flex flex-col gap-5">
        <AboutCard profile={data.profile} />
        <ProjectsCard projects={data.projects} />
      </div>

      {/* Center column */}
      <div className="flex flex-col gap-5">
        <EngagementCard engagement={data.engagement} />
        <ActivitiesCard activities={data.activities} />
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-5">
        <EventsCard events={data.upcomingEvents} />
        <DocumentsCard documents={data.documents} />
      </div>
    </div>
  );
}
