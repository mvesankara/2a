
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'project' | 'message' | 'system' | 'article';
  related_entity_id?: string;
  related_entity_type?: string;
  is_read: boolean;
  created_at: string;
}
