
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ArticleForm from "@/components/articles/ArticleForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewArticle = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/news');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/news")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux actualités
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Créer un nouvel article</CardTitle>
          <CardDescription>
            Rédigez un article qui sera publié après validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewArticle;
