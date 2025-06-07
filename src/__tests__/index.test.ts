import {
  createPaginate,
  createPaginateWithUrl,
  toQueryString,
  toUrl,
  toAxiosConfig,
  toFetchConfig,
  fromJSON,
  fromObject,
  fromQueryString,
  Paginate
} from '../index';
import { PaginateParams } from '../types';

describe('Index Functions', () => {
  describe('createPaginate', () => {
    test('should create a new builder instance', () => {
      const builder = createPaginate();
      
      expect(builder).toBeDefined();
      expect(typeof builder.page).toBe('function');
      expect(typeof builder.limit).toBe('function');
    });

    test('should create builder with custom options', () => {
      const builder = createPaginate({ arrayFormat: 'comma' });
      const queryString = builder.sort('name', 'age').buildQueryString();
      
      expect(queryString).toBe('sort=name,age');
    });
  });

  describe('createPaginateWithUrl', () => {
    test('should create builder with base URL', () => {
      const builder = createPaginateWithUrl('https://api.example.com/users');
      const url = builder.page(1).buildUrl();
      
      expect(url).toBe('https://api.example.com/users?page=1');
    });
  });

  describe('toQueryString', () => {
    test('should convert params to query string', () => {
      const params: PaginateParams = {
        page: 1,
        limit: 10,
        search: 'john',
        sort: ['name', '-created_at']
      };
      
      const result = toQueryString(params);
      
      expect(result).toContain('page=1');
      expect(result).toContain('limit=10');
      expect(result).toContain('search=john');
      expect(result).toContain('sort=name');
    expect(result).toContain('sort=-created_at');
    });

    test('should use custom options', () => {
      const params: PaginateParams = {
        sort: ['name', 'age']
      };
      
      const result = toQueryString(params, { arrayFormat: 'comma' });
      
      expect(result).toBe('sort=name,age');
    });
  });

  describe('toUrl', () => {
    test('should build complete URL', () => {
      const params: PaginateParams = { page: 1, limit: 10 };
      const url = toUrl('https://api.example.com/users', params);
      
      expect(url).toBe('https://api.example.com/users?page=1&limit=10');
    });

    test('should handle existing query parameters', () => {
      const params: PaginateParams = { page: 1 };
      const url = toUrl('https://api.example.com/users?version=v1', params);
      
      expect(url).toBe('https://api.example.com/users?version=v1&page=1');
    });

    test('should return base URL when no params', () => {
      const url = toUrl('https://api.example.com/users', {});
      
      expect(url).toBe('https://api.example.com/users');
    });
  });

  describe('toAxiosConfig', () => {
    test('should build axios config', () => {
      const params: PaginateParams = {
        page: 1,
        limit: 10,
        search: 'john'
      };
      
      const config = toAxiosConfig(params, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' }
      });
      
      expect(config).toEqual({
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' },
        params: {
          page: 1,
          limit: 10,
          search: 'john'
        }
      });
    });

    test('should merge with existing params', () => {
      const params: PaginateParams = { page: 1 };
      const config = toAxiosConfig(params, {
        params: { version: 'v1' }
      });
      
      expect(config.params).toEqual({
        version: 'v1',
        page: 1
      });
    });
  });

  describe('toFetchConfig', () => {
    test('should build fetch config', () => {
      const params: PaginateParams = { page: 1, limit: 10 };
      const { url, config } = toFetchConfig('https://api.example.com/users', params);
      
      expect(url).toBe('https://api.example.com/users?page=1&limit=10');
      expect(config).toEqual({
        method: 'GET'
      });
    });

    test('should merge with existing config', () => {
      const params: PaginateParams = { page: 1 };
      const { url, config } = toFetchConfig(
        'https://api.example.com/users',
        params,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      expect(config).toEqual({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });

  describe('fromJSON', () => {
    test('should parse valid JSON', () => {
      const json = JSON.stringify({
        page: 1,
        limit: 10,
        search: 'john',
        sort: ['name']
      });
      
      const result = fromJSON(json);
      
      expect(result).toEqual({
        page: 1,
        limit: 10,
        search: 'john',
        sort: ['name']
      });
    });

    test('should throw error for invalid JSON', () => {
      expect(() => fromJSON('invalid json')).toThrow('Invalid JSON for pagination parameters');
    });

    test('should validate parsed parameters', () => {
      const json = JSON.stringify({ page: -1 });
      
      expect(() => fromJSON(json)).toThrow('Page must be a positive integer');
    });
  });

  describe('fromObject', () => {
    test('should convert valid object', () => {
      const obj = {
        page: 1,
        limit: 10,
        search: 'john'
      };
      
      const result = fromObject(obj);
      
      expect(result).toEqual(obj);
    });

    test('should throw error for null object', () => {
      expect(() => fromObject(null)).toThrow('Invalid object for pagination parameters');
    });

    test('should throw error for non-object', () => {
      expect(() => fromObject('string')).toThrow('Invalid object for pagination parameters');
    });

    test('should validate object parameters', () => {
      expect(() => fromObject({ page: 0 })).toThrow('Page must be a positive integer');
    });
  });

  describe('fromQueryString', () => {
    test('should parse simple query string', () => {
      const queryString = 'page=1&limit=10&search=john&vacuum=true';
      const result = fromQueryString(queryString);
      
      expect(result).toEqual({
        page: 1,
        limit: 10,
        search: 'john',
        vacuum: true
      });
    });

    test('should parse array parameters', () => {
      const queryString = 'sort=name&sort=-created_at&searchFields=name&searchFields=email';
      const result = fromQueryString(queryString);
      
      expect(result).toEqual({
        sort: ['name', '-created_at'],
        searchFields: ['name', 'email']
      });
    });

    test('should parse nested object parameters', () => {
      const queryString = 'likeor[status]=active&likeor[status]=pending&eq[active]=true';
      const result = fromQueryString(queryString);
      
      expect(result).toEqual({
        likeor: {
          status: ['active', 'pending']
        },
        eq: {
          active: 'true'
        }
      });
    });

    test('should handle indexed array parameters', () => {
      const queryString = 'sort[0]=name&sort[1]=-created_at';
      const result = fromQueryString(queryString);
      
      expect(result).toEqual({
        sort: ['name', '-created_at']
      });
    });

    test('should validate parsed parameters', () => {
      const queryString = 'page=-1';
      
      expect(() => fromQueryString(queryString)).toThrow('Page must be a positive integer');
    });
  });

  describe('Paginate namespace', () => {
    test('should provide all utilities', () => {
      expect(Paginate.Builder).toBeDefined();
      expect(Paginate.create).toBeDefined();
      expect(Paginate.createWithUrl).toBeDefined();
      expect(Paginate.toQueryString).toBeDefined();
      expect(Paginate.toUrl).toBeDefined();
      expect(Paginate.toAxiosConfig).toBeDefined();
      expect(Paginate.toFetchConfig).toBeDefined();
      expect(Paginate.fromJSON).toBeDefined();
      expect(Paginate.fromObject).toBeDefined();
      expect(Paginate.fromQueryString).toBeDefined();
      expect(Paginate.utils).toBeDefined();
    });

    test('should create builder through namespace', () => {
      const builder = Paginate.create();
      const queryString = builder.page(1).limit(10).buildQueryString();
      
      expect(queryString).toBe('page=1&limit=10');
    });
  });

  describe('Integration tests', () => {
    test('should work with complex real-world scenario', () => {
      // Simulate a complex user search with multiple filters
      const builder = createPaginate()
        .page(2)
        .limit(25)
        .search('john', 'name', 'email', 'username')
        .sort('name', '-created_at')
        .likeOr('status', 'active', 'pending', 'verified')
        .likeAnd('email', '@company.com')
        .equals('is_active', true)
        .whereIn('dept_id', 1, 2, 3, 5)
        .greaterThan('age', 21)
        .lessThanOrEqual('salary', 150000)
        .between('created_at', '2023-01-01', '2024-12-31')
        .vacuum(true);
      
      const queryString = builder.buildQueryString();
      const axiosConfig = builder.buildAxiosConfig();
      const { url, config } = builder.buildFetchConfig('https://api.example.com/users');
      
      // Verify query string contains all expected parameters
      expect(queryString).toContain('page=2');
      expect(queryString).toContain('limit=25');
      expect(queryString).toContain('search=john');
      expect(queryString).toContain('vacuum=true');
      
      // Verify axios config
      expect(axiosConfig.params).toHaveProperty('page', 2);
      expect(axiosConfig.params).toHaveProperty('limit', 25);
      expect(axiosConfig.params).toHaveProperty('search', 'john');
      
      // Verify fetch config
      expect(url).toContain('https://api.example.com/users?');
      expect(url).toContain('page=2');
      expect(config.method).toBe('GET');
    });

    test('should handle round-trip conversion', () => {
      const originalParams: PaginateParams = {
        page: 2,
        limit: 25,
        search: 'john',
        searchFields: ['name', 'email'],
        sort: ['name', '-created_at'],
        likeor: {
          status: ['active', 'pending']
        },
        eq: {
          is_active: true
        },
        gte: {
          age: 18
        },
        vacuum: true
      };
      
      // Convert to query string and back
      const queryString = toQueryString(originalParams);
      const parsedParams = fromQueryString(queryString);
      
      // Basic parameters should match
      expect(parsedParams.page).toBe(originalParams.page);
      expect(parsedParams.limit).toBe(originalParams.limit);
      expect(parsedParams.search).toBe(originalParams.search);
      expect(parsedParams.vacuum).toBe(originalParams.vacuum);
      
      // Arrays should match
      expect(parsedParams.searchFields).toEqual(originalParams.searchFields);
      expect(parsedParams.sort).toEqual(originalParams.sort);
    });
  });
});