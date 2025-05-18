
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: UserRole;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permission, 
  role, 
  fallback, 
  loadingComponent 
}) => {
  const { hasPermission, hasRole, loading } = usePermissions();
  
  // Show loading state
  if (loading) {
    return loadingComponent || (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return fallback || (
      <Card>
        <CardHeader>
          <CardTitle>Accès restreint</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Check role if specified
  if (role && !hasRole(role)) {
    return fallback || (
      <Card>
        <CardHeader>
          <CardTitle>Accès restreint</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Vous devez avoir le rôle {role} pour accéder à cette fonctionnalité.</p>
        </CardContent>
      </Card>
    );
  }
  
  // If all checks pass, render children
  return <>{children}</>;
};
