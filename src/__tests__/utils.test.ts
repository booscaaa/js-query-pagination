import {
  buildQueryString,
  parseSortString,
  mergeParams,
  validatePaginationParams,
  formatArrayValue,
  objectToQueryParams,
  shouldSkipValue,
  DEFAULT_OPTIONS
} from '../utils';
import { BuilderOptions } from '../types';

describe('Utils', () => {
  describe('buildQueryString', () => {
    test('should build simple query string', () => {
      const params = { page: 1, limit: 10, search: 'test' };
      const result = buildQueryString(params);
      
      expect(result).toBe('page=1&limit=10&search=test');
    });

    test('should handle arrays with brackets format', () => {
      const params = { sort: ['name', '-created_at'] };
      const result = buildQueryString(params);
      
      expect(result).toBe('sort=name&sort=-created_at');
    });

    test('should handle nested objects', () => {
      const params = {
        likeor: {
          status: ['active', 'pending'],
          type: ['user', 'admin']
        }
      };
      const result = buildQueryString(params);
      
      expect(result).toContain('likeor%5Bstatus%5D=active');
      expect(result).toContain('likeor%5Bstatus%5D=pending');
      expect(result).toContain('likeor%5Btype%5D=user');
      expect(result).toContain('likeor%5Btype%5D=admin');
    });

    test('should skip null and undefined values by default', () => {
      const params = { page: 1, search: null, limit: undefined, name: 'test' };
      const result = buildQueryString(params);
      
      expect(result).toBe('page=1&name=test');
    });

    test('should skip empty strings when configured', () => {
      const params = { page: 1, search: '', name: 'test' };
      const result = buildQueryString(params, { ...DEFAULT_OPTIONS, skipEmptyString: true });
      
      expect(result).toBe('page=1&name=test');
    });
  });

  describe('formatArrayValue', () => {
    test('should format with brackets', () => {
      const options: BuilderOptions = { ...DEFAULT_OPTIONS, arrayFormat: 'brackets' };
      const result = formatArrayValue('sort', ['name', 'age'], options);
      
      expect(result).toEqual(['sort[]=name', 'sort[]=age']);
    });

    test('should format with indices', () => {
      const options: BuilderOptions = { ...DEFAULT_OPTIONS, arrayFormat: 'indices' };
      const result = formatArrayValue('sort', ['name', 'age'], options);
      
      expect(result).toEqual(['sort[0]=name', 'sort[1]=age']);
    });

    test('should format with comma separator', () => {
      const options: BuilderOptions = { ...DEFAULT_OPTIONS, arrayFormat: 'comma' };
      const result = formatArrayValue('sort', ['name', 'age'], options);
      
      expect(result).toEqual(['sort=name,age']);
    });

    test('should format with custom separator', () => {
      const options: BuilderOptions = { 
        ...DEFAULT_OPTIONS, 
        arrayFormat: 'separator',
        arraySeparator: '|'
      };
      const result = formatArrayValue('sort', ['name', 'age'], options);
      
      expect(result).toEqual(['sort=name|age']);
    });
  });

  describe('parseSortString', () => {
    test('should parse ascending sort', () => {
      const result = parseSortString('name');
      
      expect(result).toEqual({ field: 'name', direction: 'asc' });
    });

    test('should parse descending sort with minus prefix', () => {
      const result = parseSortString('-created_at');
      
      expect(result).toEqual({ field: 'created_at', direction: 'desc' });
    });

    test('should parse sort with colon notation', () => {
      const ascResult = parseSortString('name:asc');
      const descResult = parseSortString('created_at:desc');
      
      expect(ascResult).toEqual({ field: 'name', direction: 'asc' });
      expect(descResult).toEqual({ field: 'created_at', direction: 'desc' });
    });

    test('should default to asc for invalid direction', () => {
      const result = parseSortString('name:invalid');
      
      expect(result).toEqual({ field: 'name', direction: 'asc' });
    });
  });

  describe('mergeParams', () => {
    test('should merge simple objects', () => {
      const obj1 = { page: 1, search: 'test' };
      const obj2 = { limit: 10, page: 2 };
      const result = mergeParams(obj1, obj2);
      
      expect(result).toEqual({ page: 2, search: 'test', limit: 10 });
    });

    test('should merge arrays', () => {
      const obj1 = { sort: ['name'] };
      const obj2 = { sort: ['age'] };
      const result = mergeParams(obj1, obj2);
      
      expect(result).toEqual({ sort: ['name', 'age'] });
    });

    test('should merge nested objects', () => {
      const obj1 = { likeor: { status: ['active'] } };
      const obj2 = { likeor: { type: ['user'] } };
      const result = mergeParams(obj1, obj2);
      
      expect(result).toEqual({
        likeor: {
          status: ['active'],
          type: ['user']
        }
      });
    });

    test('should skip null and undefined values', () => {
      const obj1 = { page: 1, search: 'test' };
      const obj2 = { limit: null, search: undefined, name: 'john' };
      const result = mergeParams(obj1, obj2);
      
      expect(result).toEqual({ page: 1, search: 'test', name: 'john' });
    });
  });

  describe('validatePaginationParams', () => {
    test('should pass valid parameters', () => {
      const params = { page: 1, limit: 10 };
      
      expect(() => validatePaginationParams(params)).not.toThrow();
    });

    test('should throw error for invalid page', () => {
      expect(() => validatePaginationParams({ page: 0 })).toThrow('Page must be a positive integer');
      expect(() => validatePaginationParams({ page: -1 })).toThrow('Page must be a positive integer');
      expect(() => validatePaginationParams({ page: 1.5 })).toThrow('Page must be a positive integer');
    });

    test('should throw error for invalid limit', () => {
      expect(() => validatePaginationParams({ limit: 0 })).toThrow('Limit must be a positive integer');
      expect(() => validatePaginationParams({ limit: -1 })).toThrow('Limit must be a positive integer');
      expect(() => validatePaginationParams({ limit: 2.5 })).toThrow('Limit must be a positive integer');
    });

    test('should allow undefined page and limit', () => {
      const params = { search: 'test' };
      
      expect(() => validatePaginationParams(params)).not.toThrow();
    });
  });

  describe('shouldSkipValue', () => {
    test('should skip null when configured', () => {
      const options = { ...DEFAULT_OPTIONS, skipNulls: true };
      
      expect(shouldSkipValue(null, options)).toBe(true);
      expect(shouldSkipValue(undefined, options)).toBe(true);
    });

    test('should not skip null when not configured', () => {
      const options = { ...DEFAULT_OPTIONS, skipNulls: false };
      
      expect(shouldSkipValue(null, options)).toBe(false);
      expect(shouldSkipValue(undefined, options)).toBe(false);
    });

    test('should skip empty string when configured', () => {
      const options = { ...DEFAULT_OPTIONS, skipEmptyString: true };
      
      expect(shouldSkipValue('', options)).toBe(true);
    });

    test('should not skip empty string when not configured', () => {
      const options = { ...DEFAULT_OPTIONS, skipEmptyString: false };
      
      expect(shouldSkipValue('', options)).toBe(false);
    });

    test('should not skip valid values', () => {
      const options = DEFAULT_OPTIONS;
      
      expect(shouldSkipValue('test', options)).toBe(false);
      expect(shouldSkipValue(0, options)).toBe(false);
      expect(shouldSkipValue(false, options)).toBe(false);
      expect(shouldSkipValue([], options)).toBe(false);
      expect(shouldSkipValue({}, options)).toBe(false);
    });
  });

  describe('objectToQueryParams', () => {
    test('should convert simple object', () => {
      const obj = { page: 1, search: 'test', active: true };
      const result = objectToQueryParams(obj);
      
      expect(result).toEqual(['page=1', 'search=test', 'active=true']);
    });

    test('should handle arrays', () => {
      const obj = { sort: ['name', 'age'] };
      const result = objectToQueryParams(obj);
      
      expect(result).toEqual(['sort=name', 'sort=age']);
    });

    test('should handle nested objects', () => {
      const obj = {
        filter: {
          status: 'active',
          type: ['user', 'admin']
        }
      };
      const result = objectToQueryParams(obj, { encodeValues: false, arrayFormat: 'brackets' });
      
      expect(result).toContain('filter[status]=active');
      expect(result).toContain('filter[type][]=user');
      expect(result).toContain('filter[type][]=admin');
    });

    test('should skip empty arrays', () => {
      const obj = { sort: [], search: 'test' };
      const result = objectToQueryParams(obj);
      
      expect(result).toEqual(['search=test']);
    });
  });
});