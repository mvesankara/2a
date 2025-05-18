
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Pencil, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  type: 'article' | 'project' | 'event';
  color: string | null;
}

export const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categoryType, setCategoryType] = useState<'article' | 'project' | 'event'>('article');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    type: 'article' as 'article' | 'project' | 'event'
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Utiliser la fonction query générique pour éviter les erreurs de type
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name') as unknown as {
          data: Category[] | null;
          error: any;
        };

      if (error) throw error;

      if (data) {
        setCategories(data);
        filterCategoriesByType(categoryType, data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les catégories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCategoriesByType = (type: 'article' | 'project' | 'event', categoriesData = categories) => {
    setFilteredCategories(categoriesData.filter(cat => cat.type === type));
  };

  const handleTabChange = (value: string) => {
    setCategoryType(value as 'article' | 'project' | 'event');
    filterCategoriesByType(value as 'article' | 'project' | 'event');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (value: 'article' | 'project' | 'event') => {
    setFormData({
      ...formData,
      type: value,
    });
  };

  const handleAddCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: formData.name,
            description: formData.description || null,
            type: formData.type,
            color: formData.color,
          },
        ])
        .select() as unknown as {
          data: Category[] | null;
          error: any;
        };

      if (error) throw error;

      toast({
        title: "Catégorie ajoutée",
        description: `La catégorie ${formData.name} a été ajoutée avec succès.`,
      });

      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        type: 'article'
      });
      fetchCategories();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la catégorie",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      type: category.type
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
          type: formData.type
        })
        .eq('id', currentCategory.id) as unknown as {
          error: any;
        };

      if (error) throw error;

      toast({
        title: "Catégorie mise à jour",
        description: `La catégorie ${formData.name} a été mise à jour avec succès.`,
      });

      setIsEditDialogOpen(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la catégorie",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId) as unknown as {
          error: any;
        };

      if (error) throw error;

      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      });

      fetchCategories();
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Gestion des catégories</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
        </Button>
      </div>

      <Tabs defaultValue="article" onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="project">Projets</TabsTrigger>
          <TabsTrigger value="event">Événements</TabsTrigger>
        </TabsList>

        {['article', 'project', 'event'].map((type) => (
          <TabsContent key={type} value={type} className="pt-4">
            {loading ? (
              <div className="text-center py-8">Chargement des catégories...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune catégorie de ce type n'a été trouvée.
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Couleur</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          ></div>
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialogue d'ajout de catégorie */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
            <DialogDescription>
              Créez une nouvelle catégorie pour classer vos contenus.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Couleur
              </Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-12 h-9 p-1"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={handleInputChange}
                  name="color"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'article' | 'project' | 'event') => handleSelectChange(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="project">Projet</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddCategory}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de modification de catégorie */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les détails de la catégorie.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                Couleur
              </Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Input
                  type="color"
                  id="edit-color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-12 h-9 p-1"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={handleInputChange}
                  name="color"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'article' | 'project' | 'event') => handleSelectChange(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="project">Projet</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateCategory}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
