# JS Paginate 🚀

> Advanced JavaScript pagination library for generating query string parameters compatible with axios and fetch

Inspired by the powerful [Go Paginate](https://github.com/booscaaa/go-paginate) library, JS Paginate brings the same flexibility and power to JavaScript/TypeScript applications.

## ✨ Features

- 🔥 **Fluent Builder API** - Chainable methods for intuitive query building
- 🎯 **TypeScript Support** - Full type safety and IntelliSense
- 🌐 **HTTP Client Integration** - Built-in support for Axios and Fetch
- 🔍 **Advanced Filtering** - 15+ filter types (like, equals, greater than, etc.)
- 📊 **Flexible Sorting** - Multiple sort formats and directions
- 🔄 **Multiple Array Formats** - Repeat (default), brackets, indices, comma-separated
- ⚡ **Zero Dependencies** - Lightweight and fast
- 🛡️ **Input Validation** - Built-in parameter validation
- 🧪 **Well Tested** - Comprehensive test coverage

## 📦 Installation

```bash
npm install js-query-pagination
# or
yarn add js-query-pagination
# or
pnpm add js-query-pagination
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createPaginate } from 'js-query-pagination';

// Create a paginate builder
const paginate = createPaginate()
  .page(2)
  .limit(25)
  .search('john', 'name', 'email')
  .sort('name', '-created_at');

// Generate query string
const queryString = paginate.buildQueryString();
// Result: "page=2&limit=25&search=john&searchFields[]=name&searchFields[]=email&sort[]=name&sort[]=-created_at"

// Build complete URL
const url = paginate.buildUrl('https://api.example.com/users');
// Result: "https://api.example.com/users?page=2&limit=25&search=john&searchFields[]=name&searchFields[]=email&sort[]=name&sort[]=-created_at"
```

### With Axios

```typescript
import axios from 'axios';
import { createPaginate } from 'js-query-pagination';

const paginate = createPaginate()
  .page(1)
  .limit(10)
  .search('john')
  .equals('active', true);

// Method 1: Using buildAxiosConfig
const config = paginate.buildAxiosConfig({
  method: 'GET',
  url: 'https://api.example.com/users',
  headers: { 'Authorization': 'Bearer token' }
});

const response = await axios(config);

// Method 2: Using query parameters directly
const response2 = await axios.get('https://api.example.com/users', {
  params: paginate.getParams()
});
```

### With Fetch

```typescript
import { createPaginate } from 'js-query-pagination';

const paginate = createPaginate()
  .page(1)
  .limit(10)
  .likeOr('status', 'active', 'pending');

// Method 1: Using buildFetchConfig
const { url, config } = paginate.buildFetchConfig('https://api.example.com/users', {
  headers: { 'Authorization': 'Bearer token' }
});

const response = await fetch(url, config);

// Method 2: Building URL manually
const url2 = paginate.buildUrl('https://api.example.com/users');
const response2 = await fetch(url2);
```

## 🔍 Advanced Filtering

### Like Filters

```typescript
const paginate = createPaginate()
  .like('name', 'john')                    // name LIKE '%john%'
  .likeOr('status', 'active', 'pending')   // status LIKE '%active%' OR status LIKE '%pending%'
  .likeAnd('email', '@company', '.com');   // email LIKE '%@company%' AND email LIKE '%.com%'
```

### Equality Filters

```typescript
const paginate = createPaginate()
  .equals('active', true)                   // active = true
  .equalsOr('dept_id', 1, 2, 3)            // dept_id = 1 OR dept_id = 2 OR dept_id = 3
  .equalsAnd('role', 'admin', 'manager');   // role = 'admin' AND role = 'manager'
```

### Comparison Filters

```typescript
const paginate = createPaginate()
  .greaterThan('age', 18)                   // age > 18
  .greaterThanOrEqual('salary', 50000)      // salary >= 50000
  .lessThan('experience', 10)               // experience < 10
  .lessThanOrEqual('rating', 5);            // rating <= 5
```

### Range and List Filters

```typescript
const paginate = createPaginate()
  .whereIn('dept_id', 1, 2, 3, 5)          // dept_id IN (1, 2, 3, 5)
  .whereNotIn('status', 'deleted', 'archived') // status NOT IN ('deleted', 'archived')
  .between('created_at', '2023-01-01', '2023-12-31') // created_at BETWEEN '2023-01-01' AND '2023-12-31'
  .isNull('deleted_at')                    // deleted_at IS NULL
  .isNotNull('email', 'name');             // email IS NOT NULL AND name IS NOT NULL
```

## 📊 Sorting

```typescript
const paginate = createPaginate()
  .sort('name')                    // name ASC
  .sort('-created_at')             // created_at DESC
  .sortAsc('email')                // email ASC
  .sortDesc('updated_at')          // updated_at DESC
  .sort('name:asc', 'age:desc');   // name ASC, age DESC
```

## 🔧 Configuration Options

```typescript
import { createPaginate } from 'js-query-pagination';

const paginate = createPaginate({
  encodeValues: true,              // URL encode values (default: true)
  arrayFormat: 'repeat',           // Array format: 'repeat' (default), 'brackets', 'indices', 'comma', 'separator'
  arraySeparator: ',',             // Custom separator for 'separator' format
  skipNulls: true,                 // Skip null/undefined values (default: true)
  skipEmptyString: true            // Skip empty strings (default: true)
});

// Different array formats
const repeat = createPaginate({ arrayFormat: 'repeat' })
  .sort('name', 'age').buildQueryString();
// Result: "sort=name&sort=age" (default format)

const brackets = createPaginate({ arrayFormat: 'brackets' })
  .sort('name', 'age').buildQueryString();
// Result: "sort[]=name&sort[]=age"

const indices = createPaginate({ arrayFormat: 'indices' })
  .sort('name', 'age').buildQueryString();
// Result: "sort[0]=name&sort[1]=age"

const comma = createPaginate({ arrayFormat: 'comma' })
  .sort('name', 'age').buildQueryString();
// Result: "sort=name,age"
```

## 🛠️ Utility Functions

### Quick Functions

```typescript
import { toQueryString, toUrl, toAxiosConfig, toFetchConfig } from 'js-query-pagination';

const params = {
  page: 1,
  limit: 10,
  search: 'john',
  sort: ['name', '-created_at']
};

// Quick query string
const queryString = toQueryString(params);

// Quick URL building
const url = toUrl('https://api.example.com/users', params);

// Quick axios config
const axiosConfig = toAxiosConfig(params);

// Quick fetch config
const { url: fetchUrl, config } = toFetchConfig('https://api.example.com/users', params);
```

### Parsing Functions

```typescript
import { fromJSON, fromObject, fromQueryString } from 'js-query-pagination';

// From JSON string
const paramsFromJSON = fromJSON('{"page":1,"limit":10}');

// From object
const paramsFromObject = fromObject({ page: 1, limit: 10 });

// From query string
const paramsFromQuery = fromQueryString('page=1&limit=10&sort[]=name');
```

## 🌟 Real-World Examples

### Complex User Search

```typescript
import { createPaginate } from 'js-query-pagination';
import axios from 'axios';

// Complex user search with multiple filters
const searchUsers = async () => {
  const paginate = createPaginate()
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

  const response = await axios.get('https://api.example.com/users', {
    params: paginate.getParams()
  });

  return response.data;
};
```

### Dynamic Filtering from Form

```typescript
import { createPaginate } from 'js-query-pagination';

interface SearchForm {
  search?: string;
  department?: string[];
  minAge?: number;
  maxSalary?: number;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

const buildSearchQuery = (form: SearchForm, page: number = 1, limit: number = 20) => {
  const paginate = createPaginate()
    .page(page)
    .limit(limit);

  if (form.search) {
    paginate.search(form.search, 'name', 'email');
  }

  if (form.department?.length) {
    paginate.whereIn('department', ...form.department);
  }

  if (form.minAge !== undefined) {
    paginate.greaterThanOrEqual('age', form.minAge);
  }

  if (form.maxSalary !== undefined) {
    paginate.lessThanOrEqual('salary', form.maxSalary);
  }

  if (form.isActive !== undefined) {
    paginate.equals('is_active', form.isActive);
  }

  if (form.sortBy) {
    const sortField = form.sortDirection === 'desc' ? `-${form.sortBy}` : form.sortBy;
    paginate.sort(sortField);
  }

  return paginate;
};

// Usage
const searchForm: SearchForm = {
  search: 'john',
  department: ['IT', 'HR'],
  minAge: 25,
  isActive: true,
  sortBy: 'created_at',
  sortDirection: 'desc'
};

const query = buildSearchQuery(searchForm, 1, 10);
const url = query.buildUrl('https://api.example.com/users');
```

### React Hook Integration

```typescript
import { useState, useEffect } from 'react';
import { createPaginate, PaginateParams } from 'js-query-pagination';

interface UsePaginationOptions {
  baseUrl: string;
  initialParams?: Partial<PaginateParams>;
}

const usePagination = ({ baseUrl, initialParams = {} }: UsePaginationOptions) => {
  const [params, setParams] = useState<PaginateParams>(initialParams);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const paginate = createPaginate().merge(params);

  const updateParams = (newParams: Partial<PaginateParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = paginate.buildUrl(baseUrl);
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  return {
    data,
    loading,
    params,
    updateParams,
    paginate,
    refetch: fetchData
  };
};

// Usage in component
const UserList = () => {
  const { data, loading, updateParams, paginate } = usePagination({
    baseUrl: 'https://api.example.com/users',
    initialParams: { page: 1, limit: 10 }
  });

  const handleSearch = (search: string) => {
    updateParams({ search, page: 1 }); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  // Component JSX...
};
```

## 📚 API Reference

### PaginateBuilder Methods

#### Basic Pagination
- `page(page: number)` - Set page number
- `limit(limit: number)` - Set items per page
- `search(term: string, ...fields: string[])` - Set search term and fields
- `searchFields(...fields: string[])` - Add search fields
- `vacuum(enabled?: boolean)` - Enable/disable vacuum mode

#### Sorting
- `sort(...sorts: string[])` - Add sort fields
- `sortAsc(field: string)` - Add ascending sort
- `sortDesc(field: string)` - Add descending sort

#### Filtering
- `like(field: string, value: string)` - LIKE filter
- `likeOr(field: string, ...values: string[])` - LIKE OR filter
- `likeAnd(field: string, ...values: string[])` - LIKE AND filter
- `equals(field: string, value: any)` - Equals filter
- `equalsOr(field: string, ...values: any[])` - Equals OR filter
- `equalsAnd(field: string, ...values: any[])` - Equals AND filter
- `greaterThan(field: string, value: any)` - Greater than filter
- `greaterThanOrEqual(field: string, value: any)` - Greater than or equal filter
- `lessThan(field: string, value: any)` - Less than filter
- `lessThanOrEqual(field: string, value: any)` - Less than or equal filter
- `whereIn(field: string, ...values: any[])` - IN filter
- `whereNotIn(field: string, ...values: any[])` - NOT IN filter
- `between(field: string, min: any, max: any)` - BETWEEN filter
- `isNull(...fields: string[])` - IS NULL filter
- `isNotNull(...fields: string[])` - IS NOT NULL filter

#### Building
- `buildQueryString()` - Generate query string
- `buildUrl(baseUrl?: string)` - Generate complete URL
- `buildAxiosConfig(config?)` - Generate Axios config
- `buildFetchConfig(baseUrl?, config?)` - Generate Fetch config
- `getParams()` - Get current parameters
- `merge(params)` - Merge with existing parameters
- `reset()` - Reset all parameters
- `clone()` - Create a copy of the builder

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Go Paginate](https://github.com/booscaaa/go-paginate)
- Built with TypeScript and modern JavaScript practices

---

**Made with ❤️ by [booscaaa](https://github.com/booscaaa)**