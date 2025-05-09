
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FileText, Calendar, ArrowLeft, LayoutDashboard } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Article } from "@/types/articles";

/**
 * Articles fictifs de secours au cas où la base de données ne contient pas d'articles
 */
const fallbackArticles: Article[] = [
  {
    id: "1",
    title: "Lancement de notre première initiative sociale",
    summary: "Retour sur notre tout premier projet de terrain au sein de la communauté.",
    content: "Contenu détaillé de l'article...",
    date: "2025-04-12",
    published: true,
    user_id: "",
  },
  {
    id: "2",
    title: "Assemblée Générale 2025 : ce qu'il faut retenir",
    summary: "Décisions, perspectives et échanges clés de notre AG annuelle.",
    content: "Contenu détaillé de l'article...",
    date: "2025-03-23",
    published: true,
    user_id: "",
  },
  {
    id: "3",
    title: "Portrait : rencontre avec un membre engagé",
    summary: "Découvrez le parcours inspirant d'un bénévole actif.",
    content: "Contenu détaillé de l'article...",
    date: "2025-02-15",
    published: true,
    user_id: "",
  },
];

/**
 * Page d'actualités qui affiche les dernières actions et nouvelles de l'association
 * @returns Le composant News
 */
const News = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // Use a more direct approach to avoid type issues
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: false }) as { data: Article[] | null, error: any };
        
        if (error) throw error;
        
        // If no articles are found, use the fallback articles
        if (data && data.length > 0) {
          setArticles(data);
        } else {
          console.log("Aucun article trouvé, utilisation des articles fictifs");
          setArticles(fallbackArticles);
        }
        
        // If an ID is provided, fetch that specific article
        if (id) {
          // First check in the already retrieved articles
          const foundArticle = data?.find(a => a.id === id) || fallbackArticles.find(a => a.id === id);
          
          if (foundArticle) {
            setArticle(foundArticle);
          } else {
            // Try to fetch the specific article
            const { data: specificArticleData, error: specificError } = await supabase
              .from('articles')
              .select('*')
              .eq('id', id)
              .eq('published', true)
              .single() as { data: Article | null, error: any };
            
            if (specificError) {
              console.error("Erreur lors de la récupération de l'article:", specificError);
              navigate("/news");
            } else if (specificArticleData) {
              setArticle(specificArticleData);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles:", error);
        setArticles(fallbackArticles);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [id]);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Boutons de navigation */}
          <div className="flex space-x-4 mb-6">
            {id && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate("/news")}
              >
                <ArrowLeft className="h-4 w-4" /> Retour aux actualités
              </Button>
            )}
            
            {user && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
            )}
          </div>
          
          {id && article ? (
            // Affichage d'un article spécifique
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.date)}</span>
                {article.profiles?.full_name && (
                  <span className="ml-4">Par {article.profiles.full_name}</span>
                )}
              </div>
              <div className="prose max-w-none">
                <p className="text-lg font-medium mb-4">{article.summary}</p>
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </div>
          ) : (
            // Affichage de la liste des articles
            <>
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-4">Actualités</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Découvrez les dernières nouvelles et initiatives de notre association
                </p>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-white rounded-lg shadow p-6 h-64">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded mt-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Card key={article.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(article.date)}</span>
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
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default News;
