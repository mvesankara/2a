
import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import { Star, Shield, Heart } from "lucide-react";

/**
 * Page d'accueil du site
 * Présente les valeurs principales de l'association
 * @returns Le composant Index
 */
const Index = () => {
  /**
   * Tableau des valeurs et caractéristiques de l'association à afficher
   */
  const features = [
    {
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque aspect de notre travail.",
      icon: <Star className="w-6 h-6" />,
    },
    {
      title: "Confiance",
      description: "Bâtir des relations durables basées sur la confiance.",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "Passion",
      description: "Passionnés par l'innovation et le progrès.",
      icon: <Heart className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            Nos Valeurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
