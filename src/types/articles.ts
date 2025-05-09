
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  published: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    full_name: string;
  };
}

export interface ArticleFormData {
  title: string;
  summary: string;
  content: string;
}
