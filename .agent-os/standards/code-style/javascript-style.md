# JavaScript/TypeScript Style Guide - Agent OS

## Core Principle
**TypeScript by default** - We write TypeScript, not JavaScript. Type everything.

## TypeScript Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,  // Always strict mode
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/packages/*": ["packages/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Variable Declarations

### Use const by Default
```typescript
// ✅ GOOD - Immutable by default
const API_URL = process.env.NEXT_PUBLIC_API_URL
const user = { name: 'Juan', city: 'Pinoso' }
const prices = [100, 200, 300]

// ✅ Use let only when reassigning
let retryCount = 0
while (retryCount < 3) {
  retryCount++
}

// ❌ NEVER use var
var oldStyle = 'never do this'
```

## Function Styles

### Named Functions for Top-Level
```typescript
// ✅ Named functions for exports and components
export function calculateCommission(price: number): number {
  return price * 0.03
}

export function PropertyCard({ property }: Props) {
  return <div>{property.title}</div>
}
```

### Arrow Functions for Callbacks
```typescript
// ✅ Arrow functions for callbacks and handlers
const handleClick = () => {
  console.log('clicked')
}

properties.map((p) => p.price)

// ✅ With proper typing
const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault()
  // handle form
}
```

### Avoid Function Expressions
```typescript
// ❌ AVOID - Old style function expressions
const calculate = function(x: number) {
  return x * 2
}
```

## Async/Await Patterns

### Always Use Async/Await
```typescript
// ✅ GOOD - Clean async/await
export async function getProperty(id: string): Promise<Property | null> {
  try {
    const property = await prisma.property.findUnique({
      where: { id }
    })
    return property
  } catch (error) {
    console.error('Failed to fetch property:', error)
    return null
  }
}

// ❌ AVOID - Promise chains
function getProperty(id: string) {
  return prisma.property.findUnique({ where: { id } })
    .then(property => property)
    .catch(error => {
      console.error(error)
      return null
    })
}
```

### Parallel Promises
```typescript
// ✅ GOOD - Parallel execution
const [properties, user, settings] = await Promise.all([
  getProperties(),
  getUser(userId),
  getSettings()
])

// ❌ AVOID - Sequential when parallel possible
const properties = await getProperties()
const user = await getUser(userId)
const settings = await getSettings()
```

## Error Handling

### Try-Catch Pattern
```typescript
// ✅ GOOD - Proper error handling
export async function updateProperty(
  id: string,
  data: UpdatePropertyDto
): Promise<ApiResponse<Property>> {
  try {
    const property = await prisma.property.update({
      where: { id },
      data
    })
    
    return {
      success: true,
      data: property
    }
  } catch (error) {
    // Log for debugging
    console.error('Update failed:', error)
    
    // Return user-friendly error
    return {
      success: false,
      error: 'No se pudo actualizar la propiedad'
    }
  }
}
```

### Custom Error Classes
```typescript
// ✅ Define specific error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Usage
throw new ApiError('Property not found', 404, 'PROPERTY_NOT_FOUND')
```

## Type Definitions

### Interface vs Type
```typescript
// ✅ Interface for objects (extendable)
interface User {
  id: string
  email: string
  name?: string
}

interface Admin extends User {
  role: 'admin'
  permissions: string[]
}

// ✅ Type for unions, primitives, functions
type Status = 'pending' | 'active' | 'inactive'
type Price = number // in cents
type AsyncFunction<T> = () => Promise<T>
```

### Avoid any
```typescript
// ❌ NEVER use any
function process(data: any) {
  return data.something
}

// ✅ Use unknown or proper types
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'something' in data) {
    return data.something
  }
}

// ✅ Better: Define the type
interface ProcessData {
  something: string
}
function process(data: ProcessData) {
  return data.something
}
```

## React Hooks Patterns

### Custom Hooks
```typescript
// ✅ Custom hook with proper typing
export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true)
        const response = await fetch(`/api/properties/${id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        setProperty(data.property)
      } catch (err) {
        setError('No se pudo cargar la propiedad')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProperty()
  }, [id])
  
  return { property, loading, error }
}
```

### State Management
```typescript
// ✅ Properly typed state
const [count, setCount] = useState(0) // Type inferred
const [user, setUser] = useState<User | null>(null) // Explicit type
const [filters, setFilters] = useState<PropertyFilters>({
  minPrice: 0,
  maxPrice: 1000000,
  city: 'Pinoso'
})

// ✅ State update patterns
setFilters(prev => ({ ...prev, city: 'Alicante' }))
```

## API Call Patterns

### Fetch Wrapper
```typescript
// lib/api.ts
export class ApiClient {
  private baseUrl: string
  
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new ApiError(
        'Request failed',
        response.status
      )
    }
    
    return response.json()
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Usage
const api = new ApiClient()
const properties = await api.get<Property[]>('/properties')
```

## Database Query Patterns (Prisma)

### Typed Queries
```typescript
// ✅ Prisma with proper typing
import { Prisma, Property } from '@prisma/client'

export async function searchProperties(
  filters: {
    city?: string
    minPrice?: number
    maxPrice?: number
  }
): Promise<Property[]> {
  const where: Prisma.PropertyWhereInput = {}
  
  if (filters.city) {
    where.city = filters.city
  }
  
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice && { gte: filters.minPrice }),
      ...(filters.maxPrice && { lte: filters.maxPrice })
    }
  }
  
  return prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      images: true,
      _count: {
        select: { favorites: true }
      }
    }
  })
}
```

## Array Methods

### Use Modern Array Methods
```typescript
// ✅ GOOD - Functional array methods
const prices = properties.map(p => p.price)
const expensive = properties.filter(p => p.price > 500000)
const total = prices.reduce((sum, price) => sum + price, 0)
const hasExpensive = properties.some(p => p.price > 1000000)
const allAvailable = properties.every(p => p.status === 'available')
const property = properties.find(p => p.id === targetId)

// ❌ AVOID - Old-style loops for transformations
const prices = []
for (let i = 0; i < properties.length; i++) {
  prices.push(properties[i].price)
}
```

### Array Destructuring
```typescript
// ✅ Use destructuring
const [first, second, ...rest] = properties
const [property] = await prisma.property.findMany({ take: 1 })
```

## Object Patterns

### Object Destructuring
```typescript
// ✅ Destructure in function parameters
function createProperty({ title, price, city }: CreatePropertyDto) {
  // use title, price, city
}

// ✅ With defaults
function search({ page = 1, limit = 20 }: SearchParams = {}) {
  // use page and limit
}
```

### Object Spread
```typescript
// ✅ Object spread for immutable updates
const updatedProperty = {
  ...property,
  price: newPrice,
  updatedAt: new Date()
}

// ✅ Conditional properties
const query = {
  ...(userId && { userId }),
  ...(status && { status }),
  published: true
}
```

## Import/Export Patterns

### Named Exports Default
```typescript
// ✅ lib/utils.ts - Named exports
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES').format(date)
}

// Import
import { formatPrice, formatDate } from '@/lib/utils'
```

### Default Export for Components
```typescript
// ✅ Components use default export
export default function PropertyCard({ property }: Props) {
  return <div>{property.title}</div>
}

// Import
import PropertyCard from '@/components/PropertyCard'
```

## Null/Undefined Handling

### Optional Chaining
```typescript
// ✅ Use optional chaining
const city = property?.location?.city
const price = property?.prices?.[0]
const result = await fetchData?.()

// ❌ AVOID - Manual checks
const city = property && property.location && property.location.city
```

### Nullish Coalescing
```typescript
// ✅ Use ?? for null/undefined
const name = user.name ?? 'Anónimo'
const page = query.page ?? 1

// ❌ AVOID || for falsy values when 0 or '' are valid
const count = data.count || 10 // Wrong if count can be 0
```

## Performance Patterns

### Memoization
```typescript
// ✅ Use React.memo for expensive components
export const ExpensiveList = React.memo(({ items }: Props) => {
  return (
    <div>
      {items.map(item => <ComplexItem key={item.id} {...item} />)}
    </div>
  )
})

// ✅ useMemo for expensive calculations
const sortedProperties = useMemo(
  () => properties.sort((a, b) => b.price - a.price),
  [properties]
)

// ✅ useCallback for stable references
const handleSearch = useCallback(
  (query: string) => {
    // search logic
  },
  [dependencies]
)
```

## Common Utilities

### Debounce Pattern
```typescript
// lib/utils/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Usage in component
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    searchProperties(query)
  }, 300),
  []
)
```

### Format Utilities
```typescript
// lib/utils/format.ts
export const formatters = {
  price: (cents: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100)
  },
  
  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 9) {
      return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  },
  
  date: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-ES').format(d)
  }
} as const
```

## Testing Patterns

### Unit Test Structure
```typescript
// __tests__/utils/format.test.ts
import { formatPrice, formatPhone } from '@/lib/utils/format'

describe('Format Utils', () => {
  describe('formatPrice', () => {
    it('formats cents to euros correctly', () => {
      expect(formatPrice(10000)).toBe('100,00 €')
      expect(formatPrice(250050)).toBe('2.500,50 €')
    })
    
    it('handles zero', () => {
      expect(formatPrice(0)).toBe('0,00 €')
    })
  })
  
  describe('formatPhone', () => {
    it('formats Spanish phone numbers', () => {
      expect(formatPhone('666777888')).toBe('+34 666 777 888')
    })
  })
})
```

## Do's and Don'ts

### Do's ✅
- Always use TypeScript
- Type all function parameters and returns
- Use async/await over promises
- Use const by default
- Destructure objects and arrays
- Use optional chaining and nullish coalescing
- Handle errors gracefully
- Use modern array methods

### Don'ts ❌
- Never use `any` type
- Never use `var`
- Don't use `==` (use `===`)
- Don't mutate arrays/objects directly
- Don't use promise chains
- Don't ignore TypeScript errors
- Don't use magic numbers (use constants)
- Don't create huge functions (max 50 lines)

## ESLint Rules

```json
// .eslintrc.json additions
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": "error"
  }
}
```

## Summary

Key JavaScript/TypeScript principles for Agent OS:
1. **TypeScript always** - Never plain JavaScript
2. **Type everything** - No `any`, no implicit types
3. **Async/await** - No promise chains
4. **Modern syntax** - Use ES2022+ features
5. **Immutable updates** - Spread, don't mutate
6. **Error handling** - Always try/catch async code
7. **Functional style** - map/filter/reduce over loops

---

*"If TypeScript complains, fix it. Don't ignore it."* - Agent OS Principle