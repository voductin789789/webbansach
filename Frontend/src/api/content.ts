import { api } from './httpClient';
import { ApiEnvelope, getResponseData } from './response';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  authorName: string;
  publishedAt?: string | null;
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const response = await api.get<ApiEnvelope<BlogPost[]>>('/blog');
  return getResponseData(response);
};

export const getBlogPost = async (slug: string): Promise<BlogPost> => {
  const response = await api.get<ApiEnvelope<BlogPost>>(`/blog/${encodeURIComponent(slug)}`);
  return getResponseData(response);
};
