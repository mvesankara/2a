const QUOTES = [
  { text: "Seul on va plus vite, ensemble on va plus loin.", author: "Proverbe africain" },
  { text: "Une seule main ne peut pas attacher un paquet.", author: "Proverbe africain" },
  { text: "Si tu veux aller vite, marche seul. Si tu veux aller loin, marche ensemble.", author: "Proverbe africain" },
  { text: "L'avenir appartient à ceux qui préparent le terrain aujourd'hui.", author: "Proverbe africain" },
  { text: "C'est en forgeant qu'on devient forgeron.", author: "Proverbe africain" },
  { text: "La connaissance est comme un jardin : si on ne le cultive pas, on ne peut pas le récolter.", author: "Proverbe africain" },
  { text: "Quand les araignées s'unissent, elles peuvent arrêter un lion.", author: "Proverbe africain" },
];

export default function DailyQuote() {
  const dayIndex = new Date().getDay();
  const quote = QUOTES[dayIndex % QUOTES.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative overflow-hidden">
      {/* Decorative pattern (bottom-right) */}
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-10">
        <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
          <polygon points="0,70 40,0 80,70" fill="#1A4D4F" />
          <polygon points="20,70 60,10 100,70" fill="#E6B325" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Citation du jour</h3>
          <div className="text-accent opacity-40">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor">
              <path d="M0 16V9.5C0 6.7 1.3 4.4 4 2.5L5.5 4C3.5 5.5 2.5 7 2.5 8.5H5V16H0ZM11 16V9.5C11 6.7 12.3 4.4 15 2.5L16.5 4C14.5 5.5 13.5 7 13.5 8.5H16V16H11Z" />
            </svg>
          </div>
        </div>

        <blockquote className="text-sm font-semibold text-primary leading-relaxed mb-3">
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        <p className="text-[11px] text-gray-400 font-medium">– {quote.author}</p>
      </div>
    </div>
  );
}
