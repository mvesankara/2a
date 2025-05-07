
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ArticleForm from "./ArticleForm";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  published: boolean;
  user_id: string;
}

const UserArticlesList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchArticles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      
      // Ensure type safety of the data
      const typeSafeData: Article[] = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        content: item.content,
        date: item.date,
        published: item.published,
        user_id: item.user_id
      })) || [];
      
      setArticles(typeSafeData);
    } catch (error: any) {
      console.error("Erreur lors du chargement des articles:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [user]);

  const handleDelete = async () => {
    if (!articleToDelete) return;
    
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleToDelete);
      
      if (error) throw error;
      
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès",
      });
      
      setArticles(articles.filter(article => article.id !== articleToDelete));
      setIsDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error: any) {
      console.error("Erreur de suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  const getStatusBadge = (published: boolean) => {
    return published ? (
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
        Publié
      </span>
    ) : (
      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
        En attente
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
        <p className="mt-4 text-muted-foreground">
          Vous n'avez pas encore créé d'article.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {editingArticle && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Modifier l'article</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleForm
              initialData={editingArticle}
              onSuccess={() => {
                setEditingArticle(null);
                fetchArticles();
              }}
            />
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingArticle(null)}
            >
              Annuler
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {articles.map((article) => (
        <Card key={article.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-xl">{article.title}</CardTitle>
              <div>{getStatusBadge(article.published)}</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(article.date)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{article.summary}</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingArticle(article)}
            >
              <Pencil className="h-4 w-4 mr-1" /> Modifier
            </Button>
            <Dialog 
              open={isDeleteDialogOpen && articleToDelete === article.id} 
              onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) setArticleToDelete(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setArticleToDelete(article.id);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                  >
                    Supprimer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default UserArticlesList;
