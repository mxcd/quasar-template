export type ListResponse<T> = {
  items: T[];
  limit: number;
  offset: number;
  total: number;
}

export type PaginationParameters = {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function formatISODateToLocal(value: string): string {
  if (!value) return '';
  return new Date(value).toLocaleString();
}
