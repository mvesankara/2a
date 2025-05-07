
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ArticleForm from "@/components/articles/ArticleForm";
import UserArticlesList from "@/components/articles/UserArticlesList";

interface ArticlesSectionProps {
  onSuccess?: () => void;
}

const ArticlesSection = ({ onSuccess }: ArticlesSectionProps) => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Créer un article</CardTitle>
          <CardDescription>
            Rédigez un nouvel article pour partager avec la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm onSuccess={onSuccess} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Mes articles</CardTitle>
          <CardDescription>
            Liste de tous vos articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserArticlesList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticlesSection;
