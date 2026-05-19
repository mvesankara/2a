import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const navigation = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Nos projets", href: "/projets" },
  { label: "Actualités", href: "/actualites" },
  { label: "Devenir membre", href: "/devenir-membre" },
  { label: "Contact", href: "/contact" },
];

const liens = [
  { label: "Espace membre", href: "/my-space" },
  { label: "Faire un don", href: "/don" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "FAQ", href: "/faq" },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-end gap-1 mb-3">
              <span className="text-4xl font-black text-white">2</span>
              <span className="text-4xl font-black text-accent">A</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Acteurs de l&apos;Avenir, ensemble pour construire un futur meilleur.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "https://facebook.com" },
                { Icon: Instagram, href: "https://instagram.com" },
                { Icon: Linkedin, href: "https://linkedin.com" },
                { Icon: Youtube, href: "https://youtube.com" },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-accent hover:border-accent transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/70 hover:text-accent text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Liens utiles</h4>
            <ul className="space-y-2">
              {liens.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/70 hover:text-accent text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>📞 +241 00 00 00 00</li>
              <li>✉️ contact@acteurs-avenir.org</li>
              <li>📍 Libreville, Gabon</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center text-white/50 text-sm">
          © {new Date().getFullYear()} Acteurs de l&apos;Avenir – Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
