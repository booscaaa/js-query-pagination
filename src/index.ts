import { PaginateBuilder } from './builder';
import {
  PaginateParams,
  BuilderOptions,
  QueryStringResult,
  AxiosRequestConfig,
  FetchRequestConfig,
  FilterOperator,
  SortDirection,
  SortConfig,
  FilterConfig
} from './types';
import {
  buildQueryString,
  objectToQueryParams,
  parseSortString,
  mergeParams,
  validatePaginationParams,
  DEFAULT_OPTIONS
} from './utils';

// Export all types
export type {
  PaginateParams,
  BuilderOptions,
  QueryStringResult,
  AxiosRequestConfig,
  FetchRequestConfig,
  FilterOperator,
  SortDirection,
  SortConfig,
  FilterConfig
};

// Export utilities
export {
  buildQueryString,
  objectToQueryParams,
  parseSortString,
  mergeParams,
  validatePaginationParams,
  DEFAULT_OPTIONS
};

// Export main builder class
export { PaginateBuilder };

/**
 * Create a new paginate builder instance
 */
export function createPaginate(options?: Partial<BuilderOptions>): PaginateBuilder {
  return new PaginateBuilder(options);
}

/**
 * Create a paginate builder with base URL
 */
export function createPaginateWithUrl(baseUrl: string, options?: Partial<BuilderOptions>): PaginateBuilder {
  return new PaginateBuilder(options).setBaseUrl(baseUrl);
}

/**
 * Quick function to build query string from parameters
 */
export function toQueryString(params: PaginateParams, options?: Partial<BuilderOptions>): string {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  validatePaginationParams(params);
  return buildQueryString(params, mergedOptions);
}

/**
 * Quick function to build URL with query string
 */
export function toUrl(baseUrl: string, params: PaginateParams, options?: Partial<BuilderOptions>): string {
  const queryString = toQueryString(params, options);
  if (!queryString) return baseUrl;
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * Quick function to build axios config
 */
export function toAxiosConfig(params: PaginateParams, config: Partial<AxiosRequestConfig> = {}): AxiosRequestConfig {
  validatePaginationParams(params);
  
  return {
    ...config,
    params: {
      ...config.params,
      ...params
    }
  };
}

/**
 * Quick function to build fetch config
 */
export function toFetchConfig(
  baseUrl: string,
  params: PaginateParams,
  config: Partial<FetchRequestConfig> = {},
  options?: Partial<BuilderOptions>
): { url: string; config: FetchRequestConfig } {
  const url = toUrl(baseUrl, params, options);
  
  return {
    url,
    config: {
      method: 'GET',
      ...config
    }
  };
}

/**
 * Parse JSON string to paginate parameters
 */
export function fromJSON(jsonString: string): PaginateParams {
  try {
    const parsed = JSON.parse(jsonString);
    validatePaginationParams(parsed);
    return parsed;
  } catch (error) {
    throw new Error(`Invalid JSON for pagination parameters: ${error}`);
  }
}

/**
 * Convert object to paginate parameters with validation
 */
export function fromObject(obj: any): PaginateParams {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Invalid object for pagination parameters');
  }
  
  validatePaginationParams(obj);
  return obj as PaginateParams;
}

/**
 * Parse URL query string to paginate parameters
 */
export function fromQueryString(queryString: string): PaginateParams {
  const params: PaginateParams = {};
  const urlParams = new URLSearchParams(queryString);
  
  for (const [key, value] of urlParams.entries()) {
    // Handle array parameters (key[] or key[0], key[1], etc.)
    if (key.includes('[') && key.includes(']')) {
      // Handle indexed array parameters like sort[0], sort[1]
      const indexMatch = key.match(/^([^\[]+)\[(\d+)\]$/);
      if (indexMatch) {
        const [, baseKey] = indexMatch;
        if (!params[baseKey as keyof PaginateParams]) {
          (params as any)[baseKey] = [];
        }
        (params as any)[baseKey].push(value);
      } else {
         // Handle nested object parameters like likeor[field][] or eq[field]
         const nestedArrayMatch = key.match(/^([^\[]+)\[([^\]]+)\]\[\]$/);
         const nestedObjectMatch = key.match(/^([^\[]+)\[([^\]]+)\]$/);
         
         if (nestedArrayMatch) {
            const [, baseKey, nestedKey] = nestedArrayMatch;
            if (!params[baseKey as keyof PaginateParams]) {
              (params as any)[baseKey] = {};
            }
            if (!(params as any)[baseKey][nestedKey]) {
              (params as any)[baseKey][nestedKey] = [];
            }
            (params as any)[baseKey][nestedKey].push(value);
          } else if (nestedObjectMatch) {
            const [, baseKey, nestedKey] = nestedObjectMatch;
            if (!params[baseKey as keyof PaginateParams]) {
              (params as any)[baseKey] = {};
            }
            
            // Handle multiple values for the same nested key
            const existingValue = (params as any)[baseKey][nestedKey];
            if (existingValue !== undefined) {
              // Convert to array if not already
              if (Array.isArray(existingValue)) {
                existingValue.push(value);
              } else {
                (params as any)[baseKey][nestedKey] = [existingValue, value];
              }
            } else {
              (params as any)[baseKey][nestedKey] = value;
            }
          } else if (key.endsWith('[]')) {
            // Handle simple array parameters like key[]
            const baseKey = key.slice(0, -2);
            if (!params[baseKey as keyof PaginateParams]) {
              (params as any)[baseKey] = [];
            }
            (params as any)[baseKey].push(value);
          }
        }
    } else {
      // Handle simple parameters
      if (key === 'page' || key === 'limit') {
        (params as any)[key] = parseInt(value, 10);
      } else if (key === 'vacuum') {
        (params as any)[key] = value === 'true';
      } else if (key === 'sort' || key === 'searchFields') {
        if (!(params as any)[key]) {
          (params as any)[key] = [];
        }
        (params as any)[key].push(value);
      } else {
        (params as any)[key] = value;
      }
    }
  }
  
  validatePaginationParams(params);
  return params;
}

/**
 * Default export - the main builder class
 */
export default PaginateBuilder;

/**
 * Namespace for all pagination utilities
 */
export const Paginate = {
  Builder: PaginateBuilder,
  create: createPaginate,
  createWithUrl: createPaginateWithUrl,
  toQueryString,
  toUrl,
  toAxiosConfig,
  toFetchConfig,
  fromJSON,
  fromObject,
  fromQueryString,
  utils: {
    buildQueryString,
    objectToQueryParams,
    parseSortString,
    mergeParams,
    validatePaginationParams
  }
};