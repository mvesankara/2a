import Link from "next/link";

const DEMO_ACTIVITIES = [
  {
    id: "1",
    name: "Marie T.",
    action: "a commenté votre article",
    time: "Il y a 3 heures",
    initials: "MT",
    color: "bg-rose-100 text-rose-600",
  },
  {
    id: "2",
    name: "Kevin M.",
    action: "a rejoint le projet Éducation numérique pour tous",
    time: "Il y a 1 jour",
    initials: "KM",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "3",
    name: "Nadia A.",
    action: "a publié un nouvel article",
    time: "Il y a 2 jours",
    initials: "NA",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function ActivityPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">Activité récente</h3>
        <button className="text-xs text-primary font-semibold hover:underline">
          Voir toute
        </button>
      </div>

      <div className="space-y-3">
        {DEMO_ACTIVITIES.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${a.color}`}
            >
              {a.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 leading-snug">
                <span className="font-semibold">{a.name}</span> {a.action}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
