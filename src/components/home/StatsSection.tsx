import { Users, FolderCheck, Handshake, MapPin } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Users,
  FolderCheck,
  Handshake,
  MapPin,
};

interface Stat {
  key: string;
  value: string;
  label: string;
  icon: string | null;
}

export default function StatsSection({ stats }: { stats: Stat[] }) {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 xl:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          {/* Title */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              Notre impact
              <br />
              <span className="text-accent">en chiffres</span>
            </h2>
            <div className="w-12 h-1 bg-accent rounded-full mt-3" />
          </div>

          {/* Stats */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon ?? ""] ?? Users;
              return (
                <div key={stat.key} className="text-center">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <p className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
