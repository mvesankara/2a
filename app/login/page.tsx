import { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/home/NewsletterSection";
import LoginPageContent from "@/components/auth/LoginPageContent";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion – 2A Acteurs de l'Avenir",
  description: "Connectez-vous à votre espace membre pour accéder à votre tableau de bord.",
};

const securityBadges = [
  { Icon: Lock, title: "Connexion sécurisée", sub: "Chiffrement SSL" },
  { Icon: Eye, title: "Confidentialité garantie", sub: "Données protégées" },
  { Icon: FileCheck, title: "Conformité RGPD", sub: "Respect de votre vie privée" },
];

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col pt-20">
        <Suspense fallback={<div className="flex-1 min-h-[60vh]" />}>
          <LoginPageContent />
        </Suspense>

        {/* Security section */}
        <section className="bg-[#F8F7F2] border-t border-gray-200 py-10">
          <div className="container mx-auto px-4 xl:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex items-start gap-4 flex-shrink-0 max-w-xs">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">Vos données sont en sécurité</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Nous protégeons vos informations personnelles et ne les partageons jamais avec des tiers.
                  </p>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-gray-200 flex-shrink-0" />

              <div className="flex flex-1 justify-around flex-wrap gap-8">
                {securityBadges.map(({ Icon, title, sub }) => (
                  <div key={title} className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-primary">{title}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}
