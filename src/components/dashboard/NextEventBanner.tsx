import { CalendarDays, ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface NextEventBannerProps {
  event: {
    id: string;
    title: string;
    location: string | null;
    startDate: string;
  };
}

export default function NextEventBanner({ event }: NextEventBannerProps) {
  const date = new Date(event.startDate);
  const formattedDate = format(date, "EEEE d MMMM yyyy • HH:mm", { locale: fr });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <CalendarDays size={18} className="text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-0.5">
          Prochaine échéance à venir
        </p>
        <p className="text-sm font-bold text-primary truncate">{event.title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{capitalizedDate}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
          Ce mois-ci <ChevronDown size={12} />
        </div>
        <Link
          href={`/evenements`}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Voir détails
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
