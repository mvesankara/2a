
import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesManagement } from './CategoriesManagement';

const AdminDashboardExtended = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div>
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <AdminDashboard />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardExtended;
