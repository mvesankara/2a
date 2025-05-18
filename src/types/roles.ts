
export type UserRole = 'member' | 'moderator' | 'administrator';

export interface UserPermission {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export const rolePermissions = {
  member: ['read:content', 'create:personal-projects', 'join:events'],
  moderator: [
    'read:content', 
    'create:personal-projects', 
    'join:events', 
    'create:articles',
    'create:events',
    'moderate:comments'
  ],
  administrator: [
    'read:content', 
    'create:personal-projects', 
    'join:events', 
    'create:articles',
    'create:events',
    'moderate:comments',
    'manage:users',
    'manage:categories',
    'manage:site-settings'
  ]
};
