import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/home/NewsletterSection";
import MembershipHero from "@/components/membership/MembershipHero";
import MembershipForm from "@/components/membership/MembershipForm";

export const metadata = {
  title: "Devenir membre – 2A Acteurs de l'Avenir",
  description: "Rejoignez notre mouvement. Ensemble, agissons pour un avenir durable et solidaire au Gabon.",
};

export default function DevenirMembrePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F2]">
      <Header />
      <main className="flex-1">
        <MembershipHero />
        <div className="container mx-auto px-4 xl:px-6 py-12">
          <MembershipForm />
        </div>
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
