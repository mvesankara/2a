import Link from "next/link";
import { FileText, CheckSquare, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotifItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <FileText size={16} className="text-primary" />,
  task: <CheckSquare size={16} className="text-accent" />,
  invitation: <Users size={16} className="text-green-500" />,
};

export default function NotificationsPanel({ notifications }: { notifications: NotifItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
        <Link href="/dashboard/notifications" className="text-xs text-primary font-semibold hover:underline">
          Voir toutes
        </Link>
      </div>

      {notifications.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Aucune notification</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                {TYPE_ICONS[n.type] ?? <FileText size={16} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 leading-snug">{n.message || n.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                </p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
