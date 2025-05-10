
import { ReactNode } from "react";

/**
 * Props du composant CommunityLayout
 */
interface CommunityLayoutProps {
  children: ReactNode;
  loading?: boolean;
}

/**
 * Layout pour les pages de la section communauté
 */
export const CommunityLayout = ({ 
  children, 
  loading = false 
}: CommunityLayoutProps) => {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Chargement...</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
