import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/home/NewsletterSection";
import ForgotPasswordContent from "@/components/auth/ForgotPasswordContent";
import { Mail, Link2, Lock, Headphones } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mot de passe oublié – 2A Acteurs de l'Avenir",
  description: "Réinitialisez votre mot de passe en entrant votre adresse e-mail ou numéro de téléphone.",
};

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Mail,
    title: "Demande envoyée",
    desc: "Entrez votre e-mail ou numéro de téléphone pour recevoir un lien sécurisé.",
  },
  {
    step: 2,
    icon: Link2,
    title: "Lien reçu",
    desc: "Vérifiez votre boite mail (et vos spams) ou vos SMS pour obtenir le lien de réinitialisation.",
  },
  {
    step: 3,
    icon: Lock,
    title: "Nouveau mot de passe",
    desc: "Cliquez sur le lien et choisissez un nouveau mot de passe sécurisé.",
  },
];

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* ── Hero section ── */}
      <section className="pt-20 relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[400px]">
          {/* Left: text */}
          <div className="flex flex-col justify-center px-8 md:px-16 xl:px-24 py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                  <path d="M7 1L13 7H10V13H4V7H1L7 1Z" fill="currentColor" opacity="0.5" />
                </svg>
                <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
              </span>
              <span className="text-gray-300">&rsaquo;</span>
              <span className="text-gray-600 font-medium">Mot de passe oublié</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight mb-4">
              Mot de passe<br />oublié&nbsp;?
            </h1>
            <div className="w-14 h-1 bg-accent rounded mb-6" />
            <p className="text-gray-500 leading-relaxed max-w-sm">
              Pas de panique&nbsp;! Entrez votre adresse e-mail ou votre numéro de téléphone associé à votre compte.
              Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          {/* Right: image + decorations */}
          <div className="hidden lg:block relative bg-gray-100 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/forgot-password-hero.jpg')" }}
            />
            <div className="absolute inset-0 bg-primary/10" />

            {/* Geometric diamond decorations */}
            <div className="absolute top-0 right-0 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <polygon points="120,0 200,80 120,160 40,80" fill="#1A4D4F" opacity="0.85" />
                <polygon points="150,20 200,70 150,120 100,70" fill="#E6B325" opacity="0.75" />
                <polygon points="80,30 140,90 80,150 20,90" fill="#2A6D6F" opacity="0.4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Form card — overlaps hero bottom */}
        <div className="relative z-10 flex justify-center px-4 -mt-8 pb-0">
          <ForgotPasswordContent />
        </div>
      </section>

      {/* ── Comment ça fonctionne ── */}
      <section className="pt-64 pb-16 bg-white md:pt-48 lg:pt-32">
        <div className="container mx-auto px-4 xl:px-6">
          <h2 className="text-2xl font-black text-primary text-center mb-12">
            Comment ça fonctionne&nbsp;?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-primary mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Support card ── */}
      <section className="pb-16">
        <div className="container mx-auto px-4 xl:px-6">
          <div className="max-w-4xl mx-auto bg-[#FEF9F0] border border-amber-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Headphones size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-primary">Besoin d&apos;aide&nbsp;?</p>
                <p className="text-sm text-gray-500">Notre équipe est là pour vous accompagner.</p>
              </div>
            </div>

            <div className="sm:ml-auto flex flex-col gap-1.5 text-sm text-gray-600">
              <a href="mailto:contact@acteurs-avenir.org" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={14} className="text-primary flex-shrink-0" />
                contact@acteurs-avenir.org
              </a>
              <a href="tel:+24100000000" className="flex items-center gap-2 hover:text-primary transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                  <path d="M11.5 9.5C10.8 9.5 10.1 9.4 9.5 9.1C9.3 9 9 9.1 8.9 9.3L8.1 10.5C6.4 9.7 4.3 7.6 3.5 5.9L4.7 5.1C4.9 5 5 4.7 4.9 4.5C4.6 3.9 4.5 3.2 4.5 2.5C4.5 2.2 4.3 2 4 2H2C1.7 2 1.5 2.2 1.5 2.5C1.5 8 6 12.5 11.5 12.5C11.8 12.5 12 12.3 12 12V10C12 9.7 11.8 9.5 11.5 9.5Z" fill="#1A4D4F" />
                </svg>
                +241 00 00 00 00
              </a>
              <p className="text-gray-400 text-xs pl-5">Lun - Ven : 8h00 - 17h00</p>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
