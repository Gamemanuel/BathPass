// Core enums
export type AccessLevel = "ADMIN" | "MEMBER" | "VIEWER";
export type OrgStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";
export type OrgRole = "ADMIN" | "MEMBER" | "VIEWER";
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "REIMBURSEMENT";
export type TransactionStatus = "PENDING" | "CLEARED" | "DECLINED";
export type CardStatus = "ACTIVE" | "FROZEN" | "CANCELLED";
export type CardType = "VIRTUAL" | "PHYSICAL";

// Core models
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  balance: number;
  status: OrgStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface OrganizationMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  user?: User;
  organization?: Organization;
}

export interface Transaction {
  id: string;
  org_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  date: string;
  created_by: string;
  receipt_id: string | null;
  created_at: string;
  updated_at: string;
  organization?: Pick<Organization, "id" | "name" | "slug">;
  creator?: Pick<User, "id" | "full_name" | "email">;
}

export interface Card {
  id: string;
  org_id: string;
  status: CardStatus;
  type: CardType;
  last_four: string;
  holder_name: string;
  created_at: string;
  updated_at: string;
  organization?: Pick<Organization, "id" | "name" | "slug">;
}

export interface Receipt {
  id: string;
  transaction_id: string;
  file_path: string;
  file_name: string;
  uploaded_by: string;
  created_at: string;
}

export interface LoginCode {
  id: string;
  user_id: string;
  code: string;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

// API response wrappers
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Paginated list
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// Dashboard stats
export interface DashboardStats {
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  active_cards: number;
  organization_count: number;
  pending_transactions: number;
}

// Filter / query types
export interface TransactionFilters {
  org_id?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface OrganizationFilters {
  status?: OrgStatus;
  search?: string;
  page?: number;
  per_page?: number;
}
