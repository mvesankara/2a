"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileHeader from "./ProfileHeader";
import OverviewTab from "./OverviewTab";
import ProfilTab from "./ProfilTab";
import SecurityTab from "./SecurityTab";
import { Users } from "lucide-react";

const TABS = [
  { id: "apercu", label: "Aperçu" },
  { id: "profil", label: "Profil" },
  { id: "activites", label: "Activités" },
  { id: "projets", label: "Mes projets" },
  { id: "documents", label: "Documents" },
  { id: "preferences", label: "Préférences" },
  { id: "securite", label: "Sécurité" },
];

export type PersonalSpaceData = ReturnType<typeof buildDataShape>;
// Use 'any' at call site — server passes typed object directly

interface PersonalSpaceProps {
  data: any;
}

function PersonalSpaceInner({ data }: PersonalSpaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") ?? "apercu";

  const setTab = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Profile header */}
      <ProfileHeader profile={data.profile} onEditProfile={() => setTab("profil")} />

      {/* Tab navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-none border-b border-gray-100">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? "text-primary border-primary"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "apercu" && <OverviewTab data={data} />}
      {activeTab === "profil" && <ProfilTab profile={data.profile} />}
      {activeTab === "securite" && <SecurityTab />}
      {["activites", "projets", "documents", "preferences"].includes(activeTab) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-primary mb-2">Bientôt disponible</h3>
          <p className="text-sm text-gray-400">
            Cette section est en cours de développement.
          </p>
        </div>
      )}

      {/* CTA banner */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Users size={22} className="text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-primary">Envie de faire encore plus&nbsp;?</p>
          <p className="text-sm text-gray-500">
            Rejoignez un nouveau projet ou proposez une idée pour impacter davantage votre communauté.
          </p>
        </div>
        <a
          href="/projets"
          className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          Découvrir les projets
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function PersonalSpace(props: PersonalSpaceProps) {
  return (
    <Suspense fallback={null}>
      <PersonalSpaceInner {...props} />
    </Suspense>
  );
}

// Dummy for type inference — unused at runtime
function buildDataShape() { return {} as Parameters<typeof PersonalSpaceInner>[0]["data"]; }
