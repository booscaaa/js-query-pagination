import { BuilderOptions } from './types';

/**
 * Default builder options
 */
export const DEFAULT_OPTIONS: BuilderOptions = {
  encodeValues: true,
  arrayFormat: 'repeat',
  arraySeparator: ',',
  skipNulls: true,
  skipEmptyString: true,
};

/**
 * Encode a value for URL
 */
export function encodeValue(value: any, encode: boolean = true): string {
  const stringValue = String(value);
  return encode ? encodeURIComponent(stringValue) : stringValue;
}

/**
 * Check if a value should be skipped
 */
export function shouldSkipValue(value: any, options: BuilderOptions): boolean {
  if (options.skipNulls && (value === null || value === undefined)) {
    return true;
  }
  
  if (options.skipEmptyString && value === '') {
    return true;
  }
  
  return false;
}

/**
 * Format array values based on the specified format
 */
export function formatArrayValue(
  key: string,
  values: any[],
  options: BuilderOptions
): string[] {
  const { arrayFormat, arraySeparator, encodeValues } = options;
  
  switch (arrayFormat) {
    case 'brackets':
      return values.map(value => 
        `${encodeValue(key, encodeValues)}[]=${encodeValue(value, encodeValues)}`
      );
    
    case 'indices':
      return values.map((value, index) => 
        `${encodeValue(key, encodeValues)}[${index}]=${encodeValue(value, encodeValues)}`
      );
    
    case 'comma':
    case 'separator':
      const separator = arrayFormat === 'comma' ? ',' : arraySeparator;
      const joinedValues = values.map(v => encodeValue(v, encodeValues)).join(separator);
      return [`${encodeValue(key, encodeValues)}=${joinedValues}`];
    
    case 'repeat':
    default:
      return values.map(value => 
        `${encodeValue(key, encodeValues)}=${encodeValue(value, encodeValues)}`
      );
  }
}

/**
 * Convert camelCase to snake_case
 */
function camelToSnakeCase(str: string): string {
  // Convert searchFields to search_fields
  if (str === 'searchFields') {
    return 'search_fields';
  }
  return str;
}

/**
 * Convert an object to query string parameters
 */
export function objectToQueryParams(
  obj: Record<string, any>,
  options: BuilderOptions = DEFAULT_OPTIONS
): string[] {
  const params: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (shouldSkipValue(value, options)) {
      continue;
    }
    
    const queryKey = camelToSnakeCase(key);
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.push(...formatArrayValue(queryKey, value, options));
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects by flattening them
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (!shouldSkipValue(nestedValue, options)) {
          const flatKey = `${queryKey}[${nestedKey}]`;
          if (Array.isArray(nestedValue)) {
            params.push(...formatArrayValue(flatKey, nestedValue, options));
          } else {
            params.push(`${encodeValue(flatKey, options.encodeValues)}=${encodeValue(nestedValue, options.encodeValues)}`);
          }
        }
      }
    } else {
      params.push(`${encodeValue(queryKey, options.encodeValues)}=${encodeValue(value, options.encodeValues)}`);
    }
  }
  
  return params;
}

/**
 * Build a complete query string from parameters
 */
export function buildQueryString(
  params: Record<string, any>,
  options: BuilderOptions = DEFAULT_OPTIONS
): string {
  const queryParams = objectToQueryParams(params, options);
  return queryParams.length > 0 ? queryParams.join('&') : '';
}

/**
 * Parse sort string into structured format
 * Supports formats like: 'name', '-created_at', 'name:asc', 'created_at:desc'
 */
export function parseSortString(sortStr: string): { field: string; direction: 'asc' | 'desc' } {
  if (sortStr.startsWith('-')) {
    return {
      field: sortStr.substring(1),
      direction: 'desc'
    };
  }
  
  if (sortStr.includes(':')) {
    const [field, direction] = sortStr.split(':');
    return {
      field,
      direction: direction.toLowerCase() === 'desc' ? 'desc' : 'asc'
    };
  }
  
  return {
    field: sortStr,
    direction: 'asc'
  };
}

/**
 * Merge multiple parameter objects
 */
export function mergeParams(...paramObjects: Record<string, any>[]): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const params of paramObjects) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && Array.isArray(result[key])) {
          result[key] = [...result[key], ...value];
        } else if (typeof value === 'object' && typeof result[key] === 'object' && !Array.isArray(value)) {
          result[key] = { ...result[key], ...value };
        } else {
          result[key] = value;
        }
      }
    }
  }
  
  return result;
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: Record<string, any>): void {
  if (params.page !== undefined) {
    const page = Number(params.page);
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }
  }
  
  if (params.limit !== undefined) {
    const limit = Number(params.limit);
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Limit must be a positive integer');
    }
  }
}