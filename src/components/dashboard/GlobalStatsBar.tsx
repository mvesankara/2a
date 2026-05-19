import { Activity, Users, TrendingUp, Calendar } from "lucide-react";

interface GlobalStatsBarProps {
  stats: {
    actionsRealisees: number;
    participants: number;
    tauxAvancement: number;
    evenements: number;
  };
}

const ITEMS = [
  {
    key: "actionsRealisees" as const,
    label: "Actions réalisées",
    icon: Activity,
    trend: "+18%",
    color: "text-primary",
  },
  {
    key: "participants" as const,
    label: "Participants impliqués",
    icon: Users,
    trend: "+12%",
    color: "text-primary",
  },
  {
    key: "tauxAvancement" as const,
    label: "Taux d'avancement",
    icon: TrendingUp,
    trend: "+10%",
    suffix: "%",
    color: "text-primary",
  },
  {
    key: "evenements" as const,
    label: "Événements",
    icon: Calendar,
    trend: "+2",
    color: "text-primary",
  },
];

export default function GlobalStatsBar({ stats }: GlobalStatsBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ITEMS.map(({ key, label, icon: Icon, trend, suffix, color }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-800">
                {stats[key]}{suffix ?? ""}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
              <p className="text-[10px] text-green-500 font-semibold">{trend}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
