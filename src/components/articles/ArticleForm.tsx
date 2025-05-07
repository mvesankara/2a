
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ArticleFormProps {
  onSuccess?: () => void;
  initialData?: {
    id?: string;
    title?: string;
    summary?: string;
    content?: string;
  };
}

const ArticleForm = ({ onSuccess, initialData }: ArticleFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!initialData?.id;
  const today = format(new Date(), "d MMMM yyyy", { locale: fr });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive",
      });
      return;
    }

    if (!summary.trim()) {
      toast({
        title: "Erreur",
        description: "Le résumé est requis",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Le contenu est requis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        const { error } = await supabase
          .from("articles")
          .update({
            title,
            summary,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
          
        if (error) throw error;
        
        toast({
          title: "Article mis à jour",
          description: "Votre article a été modifié avec succès",
        });
      } else {
        const { error } = await supabase.from("articles").insert({
          title,
          summary,
          content, 
          user_id: user?.id,
          published: false,
          date: new Date().toISOString(),
        });
        
        if (error) throw error;
        
        toast({
          title: "Article créé",
          description: "Votre article a été créé avec succès et sera examiné avant publication",
        });

        // Reset form
        setTitle("");
        setSummary("");
        setContent("");
      }
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Calendar className="h-4 w-4" />
        <span>{today}</span>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Titre de l'article
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre accrocheur de l'article"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="summary" className="text-sm font-medium">
          Résumé
        </label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Bref résumé de l'article (affiché sur la page actualités)"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Contenu de l'article
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenu détaillé de l'article..."
          className="min-h-[200px]"
          required
        />
      </div>
      
      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting 
            ? "Enregistrement en cours..." 
            : isEditMode 
              ? "Mettre à jour l'article" 
              : "Soumettre l'article"
          }
        </Button>
      </div>
    </form>
  );
};

export default ArticleForm;
