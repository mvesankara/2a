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
import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { FileText, Calendar, ArrowLeft, LayoutDashboard, Plus } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  published: boolean;
  user_id: string;
}

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
]

const News = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [articles, setArticles] = useState<Article[]>([])
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .order("date", { ascending: false })

        if (error) throw error

        const typedData: Article[] = data?.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content,
          date: item.date,
          published: item.published,
          user_id: item.user_id,
        })) || []

        if (typedData.length > 0) {
          setArticles(typedData)
        } else {
          setArticles(fallbackArticles)
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

        if (id) {
          const found = typedData.find(a => a.id === id) || fallbackArticles.find(a => a.id === id)
          setArticle(found || null)
        }
      } catch (error) {
        console.error("Erreur chargement articles:", error)
        setArticles(fallbackArticles)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [id])

  const formatDate = (dateString: string) =>
    format(new Date(dateString), "d MMMM yyyy", { locale: fr })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Navigation */}
          <div className="flex flex-wrap gap-4 mb-6">
            {id && (
              <Button variant="outline" onClick={() => navigate("/news")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour
              </Button>
            )}
            {user && (
              <>
                <Button onClick={() => navigate("/articles/new")}>
                  <Plus className="h-4 w-4 mr-2" /> Soumettre un article
                </Button>
              </>
            )}
          </div>

          {id && article ? (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.date)}</span>
              </div>
              <div className="prose max-w-none">
                <p className="text-lg font-medium mb-4">{article.summary}</p>
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-4">Actualités</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Découvrez les dernières nouvelles et initiatives de notre association
                </p>
              </div>

              {loading ? (
                <p>Chargement en cours...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Card key={article.id} className="flex flex-col hover:shadow transition">
                      <CardHeader className="pb-2">
                        <div className="text-sm text-muted-foreground flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(article.date)}
                        </div>
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p>{article.summary}</p>
                      </CardContent>
                      <div className="px-6 pb-4 mt-auto">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/news/${article.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Lire l’article
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
  )
}

export default News
