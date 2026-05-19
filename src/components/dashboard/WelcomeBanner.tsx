interface WelcomeBannerProps {
  firstName: string | null;
}

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 340 180" fill="none" className="w-full h-full" aria-hidden="true">
      {/* Background large triangle */}
      <polygon points="220,8 320,172 120,172" fill="#1A4D4F" opacity="0.88" />
      {/* Gold sun circle */}
      <circle cx="255" cy="52" r="32" fill="#E6B325" opacity="0.75" />
      <circle cx="255" cy="52" r="22" fill="#E6B325" opacity="0.5" />
      {/* Smaller accent triangle */}
      <polygon points="130,172 200,80 270,172" fill="#2A6D6F" opacity="0.5" />
      {/* Person 1 silhouette */}
      <circle cx="168" cy="78" r="14" fill="#1A4D4F" />
      <path d="M152 96 Q148 140 168 140 Q188 140 184 96 Z" fill="#1A4D4F" />
      {/* Laptop */}
      <rect x="148" y="122" width="40" height="26" rx="3" fill="#2A6D6F" />
      <rect x="152" y="126" width="32" height="18" rx="1" fill="#E6B325" opacity="0.6" />
      {/* Person 2 silhouette */}
      <circle cx="198" cy="82" r="12" fill="#2A6D6F" />
      <path d="M185 98 Q182 135 200 135 Q218 135 213 98 Z" fill="#2A6D6F" />
      {/* Floating dots */}
      <circle cx="85" cy="55" r="5" fill="#E6B325" opacity="0.45" />
      <circle cx="65" cy="88" r="3" fill="#E6B325" opacity="0.3" />
      <circle cx="100" cy="28" r="3.5" fill="#E6B325" opacity="0.35" />
      <circle cx="310" cy="38" r="4" fill="#E6B325" opacity="0.4" />
      <circle cx="330" cy="120" r="3" fill="#E6B325" opacity="0.3" />
      {/* Leaf / plant */}
      <path d="M92 145 Q72 120 82 95 Q105 112 92 145 Z" fill="#1A4D4F" opacity="0.25" />
      <line x1="92" y1="145" x2="87" y2="108" stroke="#1A4D4F" strokeWidth="1.5" opacity="0.3" />
      {/* Stars */}
      <circle cx="48" cy="120" r="2" fill="#E6B325" opacity="0.4" />
      <circle cx="38" cy="70" r="2.5" fill="#E6B325" opacity="0.3" />
    </svg>
  );
}

export default function WelcomeBanner({ firstName }: WelcomeBannerProps) {
  const displayName = firstName || "Membre";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5">
        <div>
          <h2 className="text-2xl font-black text-accent mb-0.5">
            Bienvenue, {displayName} !
          </h2>
          <div className="w-10 h-0.5 bg-accent rounded mb-3" />
          <p className="text-gray-500 text-sm leading-relaxed">
            Voici un aperçu de vos activités et<br />des actions en cours.
          </p>
        </div>
        <div className="w-72 h-44 flex-shrink-0 hidden sm:block">
          <DashboardIllustration />
        </div>
      </div>
    </div>
  );
}
