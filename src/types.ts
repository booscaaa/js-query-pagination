/**
 * Filter operators for advanced querying
 */
export type FilterOperator = 
  | 'like' 
  | 'likeor' 
  | 'likeand' 
  | 'eq' 
  | 'eqor' 
  | 'eqand' 
  | 'gte' 
  | 'gt' 
  | 'lte' 
  | 'lt' 
  | 'in' 
  | 'notin' 
  | 'between' 
  | 'isnull' 
  | 'isnotnull';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Basic pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  sort?: string[];
  vacuum?: boolean;
}

/**
 * Advanced filter parameters
 */
export interface AdvancedFilterParams {
  like?: Record<string, string>;
  likeor?: Record<string, string[]>;
  likeand?: Record<string, string[]>;
  eq?: Record<string, any>;
  eqor?: Record<string, any[]>;
  eqand?: Record<string, any[]>;
  gte?: Record<string, any>;
  gt?: Record<string, any>;
  lte?: Record<string, any>;
  lt?: Record<string, any>;
  in?: Record<string, any[]>;
  notin?: Record<string, any[]>;
  between?: Record<string, [any, any]>;
  isnull?: string[];
  isnotnull?: string[];
}

/**
 * Complete pagination and filter parameters
 */
export interface PaginateParams extends PaginationParams, AdvancedFilterParams {}

/**
 * Builder configuration options
 */
export interface BuilderOptions {
  encodeValues?: boolean;
  arrayFormat?: 'brackets' | 'indices' | 'comma' | 'separator' | 'repeat';
  arraySeparator?: string;
  skipNulls?: boolean;
  skipEmptyString?: boolean;
}

/**
 * Query string result
 */
export interface QueryStringResult {
  queryString: string;
  params: Record<string, any>;
  url: string;
}

/**
 * HTTP client configuration for axios/fetch
 */
export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Axios-compatible request configuration
 */
export interface AxiosRequestConfig extends HttpClientConfig {
  method?: string;
  url?: string;
  params?: Record<string, any>;
  data?: any;
}

/**
 * Fetch-compatible request configuration
 */
export interface FetchRequestConfig extends HttpClientConfig {
  method?: string;
  body?: any;
  signal?: AbortSignal;
}