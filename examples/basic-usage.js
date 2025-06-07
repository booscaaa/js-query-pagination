// Basic usage examples for JS Paginate
const { createPaginate, toQueryString, toUrl } = require('../dist/index.js');

console.log('=== JS Paginate - Basic Usage Examples ===\n');

// Example 1: Basic pagination
console.log('1. Basic Pagination:');
const basicPaginate = createPaginate()
  .page(2)
  .limit(25)
  .search('john', 'name', 'email');

console.log('Query String:', basicPaginate.buildQueryString());
console.log('URL:', basicPaginate.buildUrl('https://api.example.com/users'));
console.log();

// Example 2: Advanced filtering
console.log('2. Advanced Filtering:');
const advancedPaginate = createPaginate()
  .page(1)
  .limit(10)
  .likeOr('status', 'active', 'pending', 'verified')
  .likeAnd('email', '@company.com')
  .equals('is_active', true)
  .whereIn('dept_id', 1, 2, 3, 5)
  .greaterThan('age', 21)
  .lessThanOrEqual('salary', 150000)
  .between('created_at', '2023-01-01', '2024-12-31')
  .sort('name', '-created_at')
  .vacuum(true);

console.log('Query String:', advancedPaginate.buildQueryString());
console.log();

// Example 3: Different array formats
console.log('3. Different Array Formats:');

const repeatFormat = createPaginate({ arrayFormat: 'repeat' })
  .sort('name', 'age', '-created_at');
console.log('Repeat (default):', repeatFormat.buildQueryString());

const bracketsFormat = createPaginate({ arrayFormat: 'brackets' })
  .sort('name', 'age', '-created_at');
console.log('Brackets:', bracketsFormat.buildQueryString());

const indicesFormat = createPaginate({ arrayFormat: 'indices' })
  .sort('name', 'age', '-created_at');
console.log('Indices:', indicesFormat.buildQueryString());

const commaFormat = createPaginate({ arrayFormat: 'comma' })
  .sort('name', 'age', '-created_at');
console.log('Comma:', commaFormat.buildQueryString());
console.log();

// Example 4: Quick utility functions
console.log('4. Quick Utility Functions:');
const params = {
  page: 1,
  limit: 10,
  search: 'john',
  sort: ['name', '-created_at'],
  likeor: {
    status: ['active', 'pending']
  },
  eq: {
    is_active: true
  }
};

console.log('toQueryString:', toQueryString(params));
console.log('toUrl:', toUrl('https://api.example.com/users', params));
console.log();

// Example 5: Axios configuration
console.log('5. Axios Configuration:');
const axiosConfig = createPaginate()
  .page(1)
  .limit(10)
  .search('john')
  .equals('active', true)
  .buildAxiosConfig({
    method: 'GET',
    url: 'https://api.example.com/users',
    headers: { 'Authorization': 'Bearer token' }
  });

console.log('Axios Config:', JSON.stringify(axiosConfig, null, 2));
console.log();

// Example 6: Fetch configuration
console.log('6. Fetch Configuration:');
const { url, config } = createPaginate()
  .page(1)
  .limit(10)
  .likeOr('status', 'active', 'pending')
  .buildFetchConfig('https://api.example.com/users', {
    headers: { 'Authorization': 'Bearer token' }
  });

console.log('Fetch URL:', url);
console.log('Fetch Config:', JSON.stringify(config, null, 2));
console.log();

// Example 7: Builder operations
console.log('7. Builder Operations:');
const originalBuilder = createPaginate()
  .page(1)
  .limit(10)
  .search('original');

const clonedBuilder = originalBuilder.clone()
  .page(2)
  .search('cloned');

console.log('Original:', originalBuilder.buildQueryString());
console.log('Cloned:', clonedBuilder.buildQueryString());

const mergedBuilder = createPaginate()
  .merge({ page: 1, search: 'existing' })
  .page(2)
  .limit(20);

console.log('Merged:', mergedBuilder.buildQueryString());
console.log();

console.log('=== Examples completed successfully! ===');