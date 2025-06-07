import { PaginateBuilder } from '../builder';
import { PaginateParams } from '../types';

describe('PaginateBuilder', () => {
  let builder: PaginateBuilder;

  beforeEach(() => {
    builder = new PaginateBuilder();
  });

  describe('Basic pagination', () => {
    test('should set page and limit', () => {
      const result = builder.page(2).limit(25).getParams();
      
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    test('should build query string for basic pagination', () => {
      const queryString = builder.page(1).limit(10).buildQueryString();
      
      expect(queryString).toBe('page=1&limit=10');
    });
  });

  describe('Search functionality', () => {
    test('should set search term and fields', () => {
      const result = builder.search('john', 'name', 'email').getParams();
      
      expect(result.search).toBe('john');
      expect(result.searchFields).toEqual(['name', 'email']);
    });

    test('should add search fields', () => {
      const result = builder
        .search('john')
        .searchFields('name', 'email')
        .searchFields('username')
        .getParams();
      
      expect(result.searchFields).toEqual(['name', 'email', 'username']);
    });
  });

  describe('Sorting', () => {
    test('should add multiple sorts', () => {
      const result = builder
        .sort('name', '-created_at')
        .sortAsc('email')
        .sortDesc('updated_at')
        .getParams();
      
      expect(result.sort).toEqual(['name', '-created_at', 'email', '-updated_at']);
    });

    test('should build query string with sorts', () => {
      const queryString = builder
        .sort('name', '-created_at')
        .buildQueryString();
      
      expect(queryString).toBe('sort=name&sort=-created_at');
    });
  });

  describe('Filtering', () => {
    test('should add like filters', () => {
      const result = builder
        .like('name', 'john')
        .likeOr('status', 'active', 'pending')
        .likeAnd('email', '@company.com')
        .getParams();
      
      expect(result.like).toEqual({ name: 'john' });
      expect(result.likeor).toEqual({ status: ['active', 'pending'] });
      expect(result.likeand).toEqual({ email: ['@company.com'] });
    });

    test('should add equals filters', () => {
      const result = builder
        .equals('active', true)
        .equalsOr('dept_id', 1, 2, 3)
        .equalsAnd('role', 'admin', 'manager')
        .getParams();
      
      expect(result.eq).toEqual({ active: true });
      expect(result.eqor).toEqual({ dept_id: [1, 2, 3] });
      expect(result.eqand).toEqual({ role: ['admin', 'manager'] });
    });

    test('should add comparison filters', () => {
      const result = builder
        .greaterThan('age', 18)
        .greaterThanOrEqual('salary', 50000)
        .lessThan('experience', 10)
        .lessThanOrEqual('rating', 5)
        .getParams();
      
      expect(result.gt).toEqual({ age: 18 });
      expect(result.gte).toEqual({ salary: 50000 });
      expect(result.lt).toEqual({ experience: 10 });
      expect(result.lte).toEqual({ rating: 5 });
    });

    test('should add in/not in filters', () => {
      const result = builder
        .whereIn('dept_id', 1, 2, 3)
        .whereNotIn('status', 'deleted', 'archived')
        .getParams();
      
      expect(result.in).toEqual({ dept_id: [1, 2, 3] });
      expect(result.notin).toEqual({ status: ['deleted', 'archived'] });
    });

    test('should add between filter', () => {
      const result = builder
        .between('created_at', '2023-01-01', '2023-12-31')
        .getParams();
      
      expect(result.between).toEqual({ created_at: ['2023-01-01', '2023-12-31'] });
    });

    test('should add null filters', () => {
      const result = builder
        .isNull('deleted_at')
        .isNotNull('email', 'name')
        .getParams();
      
      expect(result.isnull).toEqual(['deleted_at']);
      expect(result.isnotnull).toEqual(['email', 'name']);
    });
  });

  describe('URL building', () => {
    test('should build complete URL', () => {
      const url = builder
        .setBaseUrl('https://api.example.com/users')
        .page(2)
        .limit(25)
        .search('john', 'name')
        .buildUrl();
      
      expect(url).toBe('https://api.example.com/users?page=2&limit=25&search=john&searchFields=name');
    });

    test('should handle URL with existing query parameters', () => {
      const url = builder
        .page(1)
        .buildUrl('https://api.example.com/users?version=v1');
      
      expect(url).toBe('https://api.example.com/users?version=v1&page=1');
    });
  });

  describe('Axios integration', () => {
    test('should build axios config', () => {
      const config = builder
        .page(1)
        .limit(10)
        .search('john')
        .buildAxiosConfig({
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
  });

  describe('Fetch integration', () => {
    test('should build fetch config', () => {
      const { url, config } = builder
        .page(1)
        .limit(10)
        .buildFetchConfig('https://api.example.com/users', {
          headers: { 'Authorization': 'Bearer token' }
        });
      
      expect(url).toBe('https://api.example.com/users?page=1&limit=10');
      expect(config).toEqual({
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' }
      });
    });
  });

  describe('Builder operations', () => {
    test('should merge parameters', () => {
      const existingParams: PaginateParams = {
        page: 1,
        search: 'existing',
        sort: ['name']
      };
      
      const result = builder
        .merge(existingParams)
        .page(2)
        .sort('-created_at')
        .getParams();
      
      expect(result.page).toBe(2); // overridden
      expect(result.search).toBe('existing'); // preserved
      expect(result.sort).toEqual(['name', '-created_at']); // merged
    });

    test('should reset parameters', () => {
      const result = builder
        .page(1)
        .limit(10)
        .search('test')
        .reset()
        .getParams();
      
      expect(result).toEqual({});
    });

    test('should clone builder', () => {
      const original = builder.page(1).limit(10);
      const cloned = original.clone().page(2);
      
      expect(original.getParams().page).toBe(1);
      expect(cloned.getParams().page).toBe(2);
      expect(cloned.getParams().limit).toBe(10);
    });
  });

  describe('Validation', () => {
    test('should throw error for invalid page', () => {
      expect(() => {
        builder.page(-1).buildQueryString();
      }).toThrow('Page must be a positive integer');
    });

    test('should throw error for invalid limit', () => {
      expect(() => {
        builder.limit(0).buildQueryString();
      }).toThrow('Limit must be a positive integer');
    });
  });

  describe('Complex queries', () => {
    test('should build complex query with all features', () => {
      const queryString = builder
        .page(2)
        .limit(25)
        .search('john', 'name', 'email')
        .sort('name', '-created_at')
        .like('status', 'active')
        .likeOr('department', 'IT', 'HR')
        .greaterThan('age', 18)
        .whereIn('role', 'admin', 'user')
        .vacuum(true)
        .buildQueryString();
      
      expect(queryString).toContain('page=2');
      expect(queryString).toContain('limit=25');
      expect(queryString).toContain('search=john');
      expect(queryString).toContain('vacuum=true');
    });
  });
});