
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
    <div className="bg-background min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-lg">Chargement...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
