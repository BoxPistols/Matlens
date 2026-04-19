// DTO型（サーバ表現: snake_case）
// 将来の本バックエンド接続時にそのまま使える命名を採用

export interface PaginationDTO {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedDTO<T> {
  items: T[];
  pagination: PaginationDTO;
}

export interface ProjectDTO {
  id: string;
  code: string;
  title: string;
  customer_id: string;
  industry_tag_ids: string[];
  status: string;
  started_at: string;
  due_at: string | null;
  completed_at: string | null;
  specimen_count: number;
  test_count: number;
  pm_id: string;
  lead_engineer_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CreateProjectDTO {
  title: string;
  customer_id: string;
  industry_tag_ids: string[];
  due_at: string | null;
  pm_id: string;
  lead_engineer_id: string;
  description: string | null;
}

export interface UpdateProjectDTO {
  title?: string;
  status?: string;
  due_at?: string | null;
  description?: string | null;
  industry_tag_ids?: string[];
  pm_id?: string;
  lead_engineer_id?: string;
}
