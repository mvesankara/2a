
export interface Category {
  id: string;
  name: string;
  description: string | null;
  type: 'article' | 'project' | 'event';
  color: string | null;
  created_at: string;
}
