
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Category } from "@/types/categories";
import { usePermissions } from "@/hooks/usePermissions";
import { Pencil, Trash2, Plus } from "lucide-react";

interface FormData {
  name: string;
  description: string;
  type: "article" | "project" | "event";
  color: string;
}

const emptyFormData: FormData = {
  name: "",
  description: "",
  type: "article",
  color: "#3B82F6",
};

export const CategoriesManagement = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryType, setCategoryType] = useState<"article" | "project" | "event">("article");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Use a type assertion to bypass type checking
      const { data, error } = await (supabase
        .from('categories')
        .select('*')
        .order('name') as any);

      if (error) throw error;

      // Type casting to handle Supabase typing issues
      const typedData = data as unknown as Category[];
      setCategories(typedData);
      filterCategoriesByType(categoryType, typedData);
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

  const filterCategoriesByType = useCallback((type: string, data?: Category[]) => {
    const categoriesToFilter = data || categories;
    const filtered = categoriesToFilter.filter(
      (category) => category.type === type
    );
    setFilteredCategories(filtered);
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategoriesByType(categoryType);
  }, [categoryType, filterCategoriesByType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as FormData["type"] }));
  };

  const addCategory = async () => {
    try {
      setLoading(true);
      // Use a type assertion to bypass type checking
      const { data, error } = await (supabase
        .from('categories')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            type: formData.type,
            color: formData.color,
          },
        ])
        .select() as any);

      if (error) throw error;

      // Type casting to handle Supabase typing issues
      const newCategory = (data as unknown as Category[])[0];
      setCategories([...categories, newCategory]);
      
      if (newCategory.type === categoryType) {
        setFilteredCategories([...filteredCategories, newCategory]);
      }
      
      setFormData(emptyFormData);
      setIsAddDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Catégorie ajoutée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la catégorie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      type: category.type,
      color: category.color || "#3B82F6",
    });
    setIsEditDialogOpen(true);
  };

  const updateCategory = async () => {
    if (!currentCategory) return;
    
    try {
      setLoading(true);
      // Use a type assertion to bypass type checking
      const { error } = await (supabase
        .from('categories')
        .update({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          type: formData.type
        })
        .eq('id', currentCategory.id) as any);

      if (error) throw error;

      // Update local state
      const updatedCategory = { 
        ...currentCategory, 
        name: formData.name, 
        description: formData.description,
        color: formData.color,
        type: formData.type
      };
      
      setCategories(categories.map(c => 
        c.id === currentCategory.id ? updatedCategory : c
      ));
      
      filterCategoriesByType(categoryType);
      
      setFormData(emptyFormData);
      setCurrentCategory(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Catégorie mise à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la catégorie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const deleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      setLoading(true);
      // Use a type assertion to bypass type checking
      const { error } = await (supabase
        .from('categories')
        .delete()
        .eq('id', currentCategory.id) as any);

      if (error) throw error;

      // Update local state
      setCategories(categories.filter(c => c.id !== currentCategory.id));
      setFilteredCategories(filteredCategories.filter(c => c.id !== currentCategory.id));
      
      setCurrentCategory(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to manage categories
  if (!hasPermission('manage:categories')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Vous n'avez pas les permissions nécessaires pour gérer les catégories.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des catégories</CardTitle>
        <CardDescription>
          Ajoutez, modifiez et supprimez des catégories pour les articles, projets et événements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="article" onValueChange={(value) => setCategoryType(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="project">Projets</TabsTrigger>
            <TabsTrigger value="event">Événements</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-end my-4">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
            </Button>
          </div>
          
          <TabsContent value="article">
            <CategoriesTable 
              categories={filteredCategories} 
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="project">
            <CategoriesTable 
              categories={filteredCategories} 
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="event">
            <CategoriesTable 
              categories={filteredCategories} 
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              loading={loading}
            />
          </TabsContent>
        </Tabs>

        {/* Add Category Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une catégorie</DialogTitle>
              <DialogDescription>
                Créer une nouvelle catégorie pour les {
                  categoryType === "article" ? "articles" : 
                  categoryType === "project" ? "projets" : "événements"
                }
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
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="project">Projet</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Couleur
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={addCategory} disabled={loading}>
                {loading ? "Ajout en cours..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier une catégorie</DialogTitle>
              <DialogDescription>
                Modifier les informations de la catégorie
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
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="project">Projet</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Couleur
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={updateCategory} disabled={loading}>
                {loading ? "Mise à jour en cours..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer la catégorie</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={deleteCategory} variant="destructive" disabled={loading}>
                {loading ? "Suppression en cours..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  loading: boolean;
}

const CategoriesTable = ({ categories, onEdit, onDelete, loading }: CategoriesTableProps) => {
  if (loading) {
    return <div className="text-center py-4">Chargement des catégories...</div>;
  }

  if (categories.length === 0) {
    return <div className="text-center py-4">Aucune catégorie trouvée</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Couleur</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: category.color || "#3B82F6" }}
              />
            </TableCell>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>{category.description}</TableCell>
            <TableCell className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(category)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
