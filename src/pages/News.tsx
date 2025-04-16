
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Page d'actualités qui affiche les dernières actions et nouvelles de l'association
 * @returns Le composant News
 */
const News = () => {
  /**
   * Tableau des articles d'actualités à afficher
   */
  const articles = [
    {
      title: "Distribution de fournitures scolaires",
      date: "15 Mars 2024",
      content: "Notre dernière action a permis de distribuer des fournitures scolaires à plus de 100 enfants.",
    },
    {
      title: "Construction d'un puits",
      date: "1 Mars 2024",
      content: "Grâce à vos dons, nous avons pu construire un nouveau puits dans le village de Mikouyi.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Actualités</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{article.date}</p>
              </CardHeader>
              <CardContent>
                <p>{article.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default News;
