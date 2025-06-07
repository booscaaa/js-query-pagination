#!/usr/bin/env node

const { createPaginate, toQueryString } = require('../dist/index.js');

console.log('=== JS Paginate - Repeat Format Examples ===\n');

// Example 1: Basic repeat format (default)
console.log('1. Basic Repeat Format (Default):');
const basicRepeat = createPaginate()
  .sort('name', 'email', '-created_at')
  .whereIn('status', 'active', 'pending', 'verified');

console.log('Query String:', basicRepeat.buildQueryString());
console.log('Expected: sort=name&sort=email&sort=-created_at&in[status]=active&in[status]=pending&in[status]=verified');
console.log();

// Example 2: Explicit repeat format
console.log('2. Explicit Repeat Format:');
const explicitRepeat = createPaginate({ arrayFormat: 'repeat' })
  .sort('title', '-updated_at')
  .likeOr('category', 'tech', 'science', 'programming');

console.log('Query String:', explicitRepeat.buildQueryString());
console.log();

// Example 3: Complex filtering with repeat format
console.log('3. Complex Filtering with Repeat Format:');
const complexRepeat = createPaginate({ arrayFormat: 'repeat' })
  .page(2)
  .limit(25)
  .search('javascript', 'title', 'description', 'tags')
  .sort('relevance', '-publish_date', 'author')
  .likeOr('difficulty', 'beginner', 'intermediate')
  .whereIn('author_id', 1, 5, 10, 15, 20)
  .equalsOr('featured', true, false)
  .greaterThan('views', 100);

console.log('Query String:', complexRepeat.buildQueryString());
console.log();

// Example 4: Comparison with other formats
console.log('4. Format Comparison:');
const sortFields = ['name', 'email', 'created_at'];
const statusValues = ['active', 'pending'];

// Repeat format
const repeat = createPaginate({ arrayFormat: 'repeat' })
  .sort(...sortFields)
  .whereIn('status', ...statusValues);
console.log('Repeat:', repeat.buildQueryString());

// Brackets format
const brackets = createPaginate({ arrayFormat: 'brackets' })
  .sort(...sortFields)
  .whereIn('status', ...statusValues);
console.log('Brackets:', brackets.buildQueryString());

// Indices format
const indices = createPaginate({ arrayFormat: 'indices' })
  .sort(...sortFields)
  .whereIn('status', ...statusValues);
console.log('Indices:', indices.buildQueryString());

// Comma format
const comma = createPaginate({ arrayFormat: 'comma' })
  .sort(...sortFields)
  .whereIn('status', ...statusValues);
console.log('Comma:', comma.buildQueryString());
console.log();

// Example 5: Using utility functions with repeat format
console.log('5. Utility Functions with Repeat Format:');
const params = {
  page: 1,
  limit: 20,
  sort: ['name', '-created_at'],
  search: 'test',
  searchFields: ['title', 'content'],
  likeor: {
    category: ['tech', 'science']
  },
  in: {
    status: ['active', 'published']
  }
};

// Default format (repeat)
const defaultQuery = toQueryString(params);
console.log('Default (repeat):', defaultQuery);

// Explicit repeat format
const repeatQuery = toQueryString(params, { arrayFormat: 'repeat' });
console.log('Explicit repeat:', repeatQuery);
console.log();

// Example 6: Real-world API scenarios
console.log('6. Real-world API Scenarios:');

// Blog posts API
const blogQuery = createPaginate({ arrayFormat: 'repeat' })
  .page(1)
  .limit(10)
  .search('javascript tutorial', 'title', 'content')
  .sort('-publish_date', 'title')
  .whereIn('category_id', 1, 2, 3)
  .equals('published', true)
  .greaterThan('views', 50);

console.log('Blog API:', blogQuery.buildUrl('https://api.blog.com/posts'));

// User management API
const userQuery = createPaginate({ arrayFormat: 'repeat' })
  .page(2)
  .limit(25)
  .search('john', 'name', 'email')
  .sort('name', '-last_login')
  .likeOr('role', 'admin', 'moderator', 'user')
  .whereIn('department_id', 1, 2, 5)
  .equals('is_active', true)
  .isNotNull('email_verified_at');

console.log('User API:', userQuery.buildUrl('https://api.company.com/users'));

// Product catalog API
const productQuery = createPaginate({ arrayFormat: 'repeat' })
  .page(1)
  .limit(50)
  .search('laptop', 'name', 'description')
  .sort('price', '-rating')
  .whereIn('category_id', 10, 11, 12)
  .between('price', 500, 2000)
  .greaterThanOrEqual('rating', 4.0)
  .equals('in_stock', true);

console.log('Product API:', productQuery.buildUrl('https://api.store.com/products'));
console.log();

console.log('=== Repeat format examples completed successfully! ===');