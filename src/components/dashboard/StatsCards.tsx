import { FolderOpen, CheckSquare, Users, Newspaper, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    activeProjects: number;
    pendingTasks: number;
    totalMembers: number;
    publishedArticles: number;
  };
}

const CARDS = [
  {
    key: "activeProjects" as const,
    label: "Projets actifs",
    icon: FolderOpen,
    trend: "+2 ce mois-ci",
    color: "bg-primary/10 text-primary",
  },
  {
    key: "pendingTasks" as const,
    label: "Tâches en cours",
    icon: CheckSquare,
    trend: "+3 ce mois-ci",
    color: "bg-accent/10 text-accent",
  },
  {
    key: "totalMembers" as const,
    label: "Membres collaborent",
    icon: Users,
    trend: "+6 ce mois-ci",
    color: "bg-primary/10 text-primary",
  },
  {
    key: "publishedArticles" as const,
    label: "Articles publiés",
    icon: Newspaper,
    trend: "+1 ce mois-ci",
    color: "bg-accent/10 text-accent",
  },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, trend, color }) => (
        <div
          key={key}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-gray-800">{stats[key]}</p>
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
            <p className="text-[10px] text-green-500 font-medium flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={9} />
              {trend}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
