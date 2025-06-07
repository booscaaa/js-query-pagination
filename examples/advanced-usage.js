// Advanced usage examples for JS Paginate
const { createPaginate, fromJSON, fromQueryString, Paginate } = require('../dist/index.js');

console.log('=== JS Paginate - Advanced Usage Examples ===\n');

// Example 1: Complex user search simulation
console.log('1. Complex User Search Simulation:');
const userSearch = createPaginate()
  .page(2)
  .limit(25)
  .search('john', 'name', 'email', 'username')
  .sort('name', '-created_at', 'department')
  .likeOr('status', 'active', 'pending', 'verified')
  .likeAnd('email', '@company.com')
  .equals('is_active', true)
  .whereIn('dept_id', 1, 2, 3, 5)
  .greaterThan('age', 21)
  .lessThanOrEqual('salary', 150000)
  .between('created_at', '2023-01-01', '2024-12-31')
  .isNotNull('email', 'phone')
  .vacuum(true);

console.log('Complex Query:', userSearch.buildQueryString());
console.log('URL Length:', userSearch.buildUrl('https://api.example.com/users').length);
console.log();

// Example 2: Dynamic filter building
console.log('2. Dynamic Filter Building:');
function buildDynamicFilters(searchCriteria) {
  const paginate = createPaginate()
    .page(searchCriteria.page || 1)
    .limit(searchCriteria.limit || 20);

  // Add search if provided
  if (searchCriteria.search) {
    paginate.search(searchCriteria.search, 'name', 'email', 'description');
  }

  // Add status filters
  if (searchCriteria.statuses && searchCriteria.statuses.length > 0) {
    paginate.whereIn('status', ...searchCriteria.statuses);
  }

  // Add date range
  if (searchCriteria.dateFrom && searchCriteria.dateTo) {
    paginate.between('created_at', searchCriteria.dateFrom, searchCriteria.dateTo);
  }

  // Add age range
  if (searchCriteria.minAge) {
    paginate.greaterThanOrEqual('age', searchCriteria.minAge);
  }
  if (searchCriteria.maxAge) {
    paginate.lessThanOrEqual('age', searchCriteria.maxAge);
  }

  // Add sorting
  if (searchCriteria.sortBy) {
    const sortField = searchCriteria.sortDesc ? `-${searchCriteria.sortBy}` : searchCriteria.sortBy;
    paginate.sort(sortField);
  }

  // Add department filter
  if (searchCriteria.departments && searchCriteria.departments.length > 0) {
    paginate.whereIn('department_id', ...searchCriteria.departments);
  }

  // Add active filter
  if (searchCriteria.activeOnly !== undefined) {
    paginate.equals('is_active', searchCriteria.activeOnly);
  }

  return paginate;
}

const searchCriteria = {
  page: 1,
  limit: 15,
  search: 'developer',
  statuses: ['active', 'pending'],
  dateFrom: '2023-01-01',
  dateTo: '2023-12-31',
  minAge: 25,
  maxAge: 45,
  sortBy: 'created_at',
  sortDesc: true,
  departments: [1, 2, 3],
  activeOnly: true
};

const dynamicQuery = buildDynamicFilters(searchCriteria);
console.log('Dynamic Query:', dynamicQuery.buildQueryString());
console.log();

// Example 3: JSON serialization and parsing
console.log('3. JSON Serialization and Parsing:');
const originalParams = {
  page: 2,
  limit: 25,
  search: 'test search',
  searchFields: ['name', 'email'],
  sort: ['name', '-created_at'],
  likeor: {
    status: ['active', 'pending'],
    type: ['user', 'admin']
  },
  eq: {
    is_active: true,
    verified: true
  },
  gte: {
    age: 18,
    experience: 2
  },
  vacuum: true
};

// Serialize to JSON
const jsonString = JSON.stringify(originalParams);
console.log('JSON String:', jsonString);

// Parse from JSON
const parsedParams = fromJSON(jsonString);
console.log('Parsed Params:', parsedParams);

// Build query from parsed params
const fromJsonQuery = createPaginate().merge(parsedParams);
console.log('Query from JSON:', fromJsonQuery.buildQueryString());
console.log();

// Example 4: Query string round-trip
console.log('4. Query String Round-trip:');
const originalQuery = createPaginate()
  .page(3)
  .limit(50)
  .search('round trip test', 'title', 'content')
  .sort('title', '-updated_at')
  .likeOr('category', 'tech', 'science')
  .equals('published', true)
  .greaterThan('views', 100)
  .buildQueryString();

console.log('Original Query:', originalQuery);

// Parse the query string back to parameters
const parsedFromQuery = fromQueryString(originalQuery);
console.log('Parsed from Query:', parsedFromQuery);

// Rebuild query string
const rebuiltQuery = createPaginate().merge(parsedFromQuery).buildQueryString();
console.log('Rebuilt Query:', rebuiltQuery);
console.log('Round-trip Success:', originalQuery === rebuiltQuery);
console.log();

// Example 5: Performance comparison
console.log('5. Performance Comparison:');
const performanceTest = () => {
  const iterations = 1000;
  
  // Test builder performance
  console.time('Builder Performance');
  for (let i = 0; i < iterations; i++) {
    createPaginate()
      .page(i % 10 + 1)
      .limit(25)
      .search(`test${i}`, 'name', 'email')
      .sort('name', '-created_at')
      .likeOr('status', 'active', 'pending')
      .equals('active', true)
      .greaterThan('age', 18)
      .buildQueryString();
  }
  console.timeEnd('Builder Performance');
  
  // Test utility function performance
  const params = {
    page: 1,
    limit: 25,
    search: 'test',
    sort: ['name', '-created_at']
  };
  
  console.time('Utility Performance');
  for (let i = 0; i < iterations; i++) {
    Paginate.toQueryString({ ...params, page: i % 10 + 1 });
  }
  console.timeEnd('Utility Performance');
};

performanceTest();
console.log();

// Example 6: Error handling
console.log('6. Error Handling:');
try {
  // This should throw an error
  createPaginate().page(-1).buildQueryString();
} catch (error) {
  console.log('Caught expected error:', error.message);
}

try {
  // This should throw an error
  createPaginate().limit(0).buildQueryString();
} catch (error) {
  console.log('Caught expected error:', error.message);
}

try {
  // This should throw an error
  fromJSON('invalid json');
} catch (error) {
  console.log('Caught expected error:', error.message);
}
console.log();

// Example 7: Chaining and method combinations
console.log('7. Method Chaining Combinations:');
const chainedBuilder = createPaginate()
  // Basic pagination
  .page(1).limit(20)
  // Search functionality
  .search('javascript', 'title', 'description', 'tags')
  // Multiple like filters
  .like('author', 'john')
  .likeOr('category', 'tutorial', 'guide', 'howto')
  .likeAnd('tags', 'beginner', 'javascript')
  // Equality filters
  .equals('published', true)
  .equalsOr('difficulty', 'easy', 'medium')
  // Comparison filters
  .greaterThan('views', 1000)
  .lessThanOrEqual('reading_time', 30)
  // Range filters
  .whereIn('author_id', 1, 2, 3, 4, 5)
  .between('publish_date', '2023-01-01', '2023-12-31')
  // Null checks
  .isNotNull('featured_image')
  // Sorting
  .sort('title', '-publish_date', 'views')
  // Options
  .vacuum(true);

console.log('Chained Query:', chainedBuilder.buildQueryString());
console.log('Parameter Count:', Object.keys(chainedBuilder.getParams()).length);
console.log();

// Example 8: Builder state management
console.log('8. Builder State Management:');
const baseBuilder = createPaginate()
  .limit(10)
  .sort('created_at')
  .equals('is_active', true);

// Create variations without affecting the base
const userVariation = baseBuilder.clone()
  .search('users')
  .whereIn('role', 'user', 'member');

const adminVariation = baseBuilder.clone()
  .search('admin')
  .whereIn('role', 'admin', 'moderator');

const recentVariation = baseBuilder.clone()
  .greaterThan('created_at', '2023-01-01')
  .sort('-created_at'); // Override sort

console.log('Base Query:', baseBuilder.buildQueryString());
console.log('User Variation:', userVariation.buildQueryString());
console.log('Admin Variation:', adminVariation.buildQueryString());
console.log('Recent Variation:', recentVariation.buildQueryString());
console.log();

// Example 9: Array Format Comparison
console.log('9. Array Format Comparison:');
const arrayData = ['name', 'email', 'created_at', '-updated_at'];
const filterValues = ['active', 'pending', 'verified'];

// Repeat format (default)
const repeatExample = createPaginate({ arrayFormat: 'repeat' })
  .sort(...arrayData)
  .whereIn('status', ...filterValues);
console.log('Repeat format (default):', repeatExample.buildQueryString());

// Brackets format
const bracketsExample = createPaginate({ arrayFormat: 'brackets' })
  .sort(...arrayData)
  .whereIn('status', ...filterValues);
console.log('Brackets format:', bracketsExample.buildQueryString());

// Indices format
const indicesExample = createPaginate({ arrayFormat: 'indices' })
  .sort(...arrayData)
  .whereIn('status', ...filterValues);
console.log('Indices format:', indicesExample.buildQueryString());

// Comma format
const commaExample = createPaginate({ arrayFormat: 'comma' })
  .sort(...arrayData)
  .whereIn('status', ...filterValues);
console.log('Comma format:', commaExample.buildQueryString());
console.log();

console.log('=== Advanced examples completed successfully! ===');