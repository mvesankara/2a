
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FileText, Calendar } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Tableau des articles d'actualités à afficher
 */
const articles = [
  {
    id: 1,
    title: "Lancement de notre première initiative sociale",
    summary: "Retour sur notre tout premier projet de terrain au sein de la communauté.",
    date: "12 avril 2025",
  },
  {
    id: 2,
    title: "Assemblée Générale 2025 : ce qu'il faut retenir",
    summary: "Décisions, perspectives et échanges clés de notre AG annuelle.",
    date: "23 mars 2025",
  },
  {
    id: 3,
    title: "Portrait : rencontre avec un membre engagé",
    summary: "Découvrez le parcours inspirant d'un bénévole actif.",
    date: "15 février 2025",
  },
];

/**
 * Page d'actualités qui affiche les dernières actions et nouvelles de l'association
 * @returns Le composant News
 */
const News = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Actualités</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez les dernières nouvelles et initiatives de notre association
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{article.date}</span>
                  </div>
                  <CardTitle className="text-xl">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{article.summary}</p>
                </CardContent>
                <div className="px-6 pb-4 mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 flex items-center justify-center"
                    onClick={() => navigate(`/news/${article.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Lire l'article
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default News;
