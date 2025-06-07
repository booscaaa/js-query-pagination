import {
  PaginateParams,
  SortConfig,
  FilterConfig,
  BuilderOptions,
  QueryStringResult,
  AxiosRequestConfig,
  FetchRequestConfig,
  FilterOperator
} from './types';
import {
  buildQueryString,
  parseSortString,
  mergeParams,
  validatePaginationParams,
  DEFAULT_OPTIONS
} from './utils';

/**
 * Fluent builder for creating pagination queries
 */
export class PaginateBuilder {
  private params: PaginateParams = {};
  private options: BuilderOptions;
  private baseUrl: string = '';

  constructor(options: Partial<BuilderOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Set the base URL for requests
   */
  setBaseUrl(url: string): PaginateBuilder {
    this.baseUrl = url;
    return this;
  }

  /**
   * Set the page number
   */
  page(page: number): PaginateBuilder {
    this.params.page = page;
    return this;
  }

  /**
   * Set the limit (items per page)
   */
  limit(limit: number): PaginateBuilder {
    this.params.limit = limit;
    return this;
  }

  /**
   * Set search term and fields
   */
  search(term: string, ...fields: string[]): PaginateBuilder {
    this.params.search = term;
    if (fields.length > 0) {
      this.params.searchFields = fields;
    }
    return this;
  }

  /**
   * Add search fields
   */
  searchFields(...fields: string[]): PaginateBuilder {
    this.params.searchFields = [...(this.params.searchFields || []), ...fields];
    return this;
  }

  /**
   * Add sorting
   */
  sort(...sorts: string[]): PaginateBuilder {
    this.params.sort = [...(this.params.sort || []), ...sorts];
    return this;
  }

  /**
   * Add ascending sort
   */
  sortAsc(field: string): PaginateBuilder {
    return this.sort(field);
  }

  /**
   * Add descending sort
   */
  sortDesc(field: string): PaginateBuilder {
    return this.sort(`-${field}`);
  }

  /**
   * Enable vacuum mode (remove empty filters)
   */
  vacuum(enabled: boolean = true): PaginateBuilder {
    this.params.vacuum = enabled;
    return this;
  }

  /**
   * Add LIKE filter
   */
  like(field: string, value: string): PaginateBuilder {
    if (!this.params.like) this.params.like = {};
    this.params.like[field] = value;
    return this;
  }

  /**
   * Add LIKE OR filter
   */
  likeOr(field: string, ...values: string[]): PaginateBuilder {
    if (!this.params.likeor) this.params.likeor = {};
    this.params.likeor[field] = [...(this.params.likeor[field] || []), ...values];
    return this;
  }

  /**
   * Add LIKE AND filter
   */
  likeAnd(field: string, ...values: string[]): PaginateBuilder {
    if (!this.params.likeand) this.params.likeand = {};
    this.params.likeand[field] = [...(this.params.likeand[field] || []), ...values];
    return this;
  }

  /**
   * Add equals filter
   */
  equals(field: string, value: any): PaginateBuilder {
    if (!this.params.eq) this.params.eq = {};
    this.params.eq[field] = value;
    return this;
  }

  /**
   * Add equals OR filter
   */
  equalsOr(field: string, ...values: any[]): PaginateBuilder {
    if (!this.params.eqor) this.params.eqor = {};
    this.params.eqor[field] = [...(this.params.eqor[field] || []), ...values];
    return this;
  }

  /**
   * Add equals AND filter
   */
  equalsAnd(field: string, ...values: any[]): PaginateBuilder {
    if (!this.params.eqand) this.params.eqand = {};
    this.params.eqand[field] = [...(this.params.eqand[field] || []), ...values];
    return this;
  }

  /**
   * Add greater than or equal filter
   */
  greaterThanOrEqual(field: string, value: any): PaginateBuilder {
    if (!this.params.gte) this.params.gte = {};
    this.params.gte[field] = value;
    return this;
  }

  /**
   * Add greater than filter
   */
  greaterThan(field: string, value: any): PaginateBuilder {
    if (!this.params.gt) this.params.gt = {};
    this.params.gt[field] = value;
    return this;
  }

  /**
   * Add less than or equal filter
   */
  lessThanOrEqual(field: string, value: any): PaginateBuilder {
    if (!this.params.lte) this.params.lte = {};
    this.params.lte[field] = value;
    return this;
  }

  /**
   * Add less than filter
   */
  lessThan(field: string, value: any): PaginateBuilder {
    if (!this.params.lt) this.params.lt = {};
    this.params.lt[field] = value;
    return this;
  }

  /**
   * Add IN filter
   */
  whereIn(field: string, ...values: any[]): PaginateBuilder {
    if (!this.params.in) this.params.in = {};
    this.params.in[field] = [...(this.params.in[field] || []), ...values];
    return this;
  }

  /**
   * Add NOT IN filter
   */
  whereNotIn(field: string, ...values: any[]): PaginateBuilder {
    if (!this.params.notin) this.params.notin = {};
    this.params.notin[field] = [...(this.params.notin[field] || []), ...values];
    return this;
  }

  /**
   * Add BETWEEN filter
   */
  between(field: string, min: any, max: any): PaginateBuilder {
    if (!this.params.between) this.params.between = {};
    this.params.between[field] = [min, max];
    return this;
  }

  /**
   * Add IS NULL filter
   */
  isNull(...fields: string[]): PaginateBuilder {
    this.params.isnull = [...(this.params.isnull || []), ...fields];
    return this;
  }

  /**
   * Add IS NOT NULL filter
   */
  isNotNull(...fields: string[]): PaginateBuilder {
    this.params.isnotnull = [...(this.params.isnotnull || []), ...fields];
    return this;
  }

  /**
   * Add custom filter
   */
  filter(field: string, operator: FilterOperator, value: any): PaginateBuilder {
    switch (operator) {
      case 'like':
        return this.like(field, value);
      case 'eq':
        return this.equals(field, value);
      case 'gte':
        return this.greaterThanOrEqual(field, value);
      case 'gt':
        return this.greaterThan(field, value);
      case 'lte':
        return this.lessThanOrEqual(field, value);
      case 'lt':
        return this.lessThan(field, value);
      case 'in':
        return this.whereIn(field, ...(Array.isArray(value) ? value : [value]));
      case 'notin':
        return this.whereNotIn(field, ...(Array.isArray(value) ? value : [value]));
      case 'isnull':
        return this.isNull(field);
      case 'isnotnull':
        return this.isNotNull(field);
      default:
        throw new Error(`Unsupported filter operator: ${operator}`);
    }
  }

  /**
   * Merge with existing parameters
   */
  merge(params: Partial<PaginateParams>): PaginateBuilder {
    this.params = mergeParams(this.params, params);
    return this;
  }

  /**
   * Reset all parameters
   */
  reset(): PaginateBuilder {
    this.params = {};
    return this;
  }

  /**
   * Get current parameters
   */
  getParams(): PaginateParams {
    return { ...this.params };
  }

  /**
   * Build query string
   */
  buildQueryString(): string {
    validatePaginationParams(this.params);
    return buildQueryString(this.params, this.options);
  }

  /**
   * Build complete URL with query string
   */
  buildUrl(baseUrl?: string): string {
    const url = baseUrl || this.baseUrl;
    const queryString = this.buildQueryString();
    
    if (!queryString) return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${queryString}`;
  }

  /**
   * Build result object with query string, params, and URL
   */
  build(baseUrl?: string): QueryStringResult {
    const queryString = this.buildQueryString();
    const url = this.buildUrl(baseUrl);
    
    return {
      queryString,
      params: this.getParams(),
      url
    };
  }

  /**
   * Build axios-compatible request configuration
   */
  buildAxiosConfig(config: Partial<AxiosRequestConfig> = {}): AxiosRequestConfig {
    validatePaginationParams(this.params);
    
    return {
      ...config,
      params: {
        ...config.params,
        ...this.params
      }
    };
  }

  /**
   * Build fetch-compatible request configuration
   */
  buildFetchConfig(baseUrl?: string, config: Partial<FetchRequestConfig> = {}): { url: string; config: FetchRequestConfig } {
    const url = this.buildUrl(baseUrl);
    
    return {
      url,
      config: {
        method: 'GET',
        ...config
      }
    };
  }

  /**
   * Create a new builder instance
   */
  clone(): PaginateBuilder {
    const newBuilder = new PaginateBuilder(this.options);
    newBuilder.params = { ...this.params };
    newBuilder.baseUrl = this.baseUrl;
    return newBuilder;
  }
}