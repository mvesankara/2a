import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, rolePermissions } from '@/types/roles';

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First check profiles table for role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erreur en récupérant le rôle de l\'utilisateur:', profileError);
          throw profileError;
        }

        if (profileData?.role) {
          setUserRole(profileData.role as UserRole);
        } else {
          // Default to member if no role is found
          setUserRole('member');
        }
      } catch (error) {
        console.error('Erreur en récupérant le rôle de l\'utilisateur:', error);
        // Default to member in case of error
        setUserRole('member');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  const hasPermission = (permission: string): boolean => {
    if (loading) return false;
    
    // Check if the user's role has the specified permission
    return rolePermissions[userRole]?.includes(permission) || false;
  };

  const hasRole = (role: UserRole): boolean => {
    if (loading) return false;
    
    // For admin, return true for any role check
    if (userRole === 'administrator') return true;
    
    // For moderator, return true for moderator and member roles
    if (userRole === 'moderator' && (role === 'moderator' || role === 'member')) return true;
    
    // Otherwise, exact match only
    return userRole === role;
  };

  return {
    userRole,
    loading,
    hasPermission,
    hasRole,
    isAdmin: userRole === 'administrator',
    isModerator: userRole === 'moderator' || userRole === 'administrator',
    isMember: true // Everyone is at least a member
  };
};
