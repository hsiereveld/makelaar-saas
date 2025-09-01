# Code Style Guide - Agent OS

## Context
Global code style rules for all Agent OS projects. These rules ensure consistency across all codebases and make it easy for any developer to jump between projects.

## Core Principle
**Consistency > Personal Preference**  
Use Prettier defaults + ESLint. Don't waste time debating semicolons.

## Language-Specific Formatting

### TypeScript/JavaScript

#### Naming Conventions
```typescript
// ✅ CORRECT - JavaScript/TypeScript conventions
const userProfile = {} // camelCase for variables
function calculateTotal() {} // camelCase for functions
class PaymentProcessor {} // PascalCase for classes
const MAX_RETRY_COUNT = 3 // UPPER_SNAKE_CASE for constants

interface UserProfile {} // PascalCase for types/interfaces
type PaymentStatus = 'pending' | 'completed' // PascalCase for types

// React Components - PascalCase
export function PropertyCard() {}
export const SearchFilter = () => {}

// Files
PropertyCard.tsx // PascalCase for components
useAuth.ts // camelCase for hooks
formatPrice.ts // camelCase for utilities
types.ts // lowercase for type definitions
```

#### Database Fields (Prisma/PostgreSQL)
```prisma
// schema.prisma - snake_case in database
model User {
  id         String @id
  first_name String // snake_case in DB
  created_at DateTime @default(now())
  
  @@map("users") // table names lowercase
}
```

```typescript
// TypeScript - Prisma generates camelCase
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    firstName: true, // Prisma converts to camelCase
    createdAt: true
  }
})
```

### String Formatting
```typescript
// ✅ Use whatever Prettier defaults to (usually single quotes)
const message = 'Hello World'

// ✅ Template literals for interpolation
const greeting = `Hello ${userName}`

// ✅ Template literals for multi-line
const query = `
  SELECT * FROM properties
  WHERE city = 'Pinoso'
`
```

### Import Organization
```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

// 2. Third-party libraries
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Absolute imports (from packages/)
import { Button } from '@/packages/ui'
import { auth } from '@/packages/auth'

// 4. Relative imports
import { PropertyCard } from '../components/PropertyCard'
import { formatPrice } from '../lib/utils'

// 5. Type imports
import type { Property } from '@prisma/client'
import type { NextApiRequest } from 'next'
```

## React/JSX Conventions

### Component Structure
```typescript
// ✅ CORRECT - Consistent component structure
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Property } from '@prisma/client'

interface PropertyCardProps {
  property: Property
  onSelect?: (id: string) => void
  featured?: boolean // Optional props with ?
}

export function PropertyCard({ 
  property, 
  onSelect,
  featured = false // Default values
}: PropertyCardProps) {
  // 1. Hooks first
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  
  // 2. Derived state
  const canEdit = user?.id === property.userId
  
  // 3. Event handlers
  const handleClick = () => {
    onSelect?.(property.id)
  }
  
  // 4. Early returns
  if (!property) return null
  
  // 5. Main render
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      {/* Component content */}
    </div>
  )
}
```

### JSX Formatting
```tsx
// ✅ Self-closing tags
<Image src={url} alt={title} />

// ✅ Multi-line props when > 2 props
<Button
  variant="primary"
  size="large"
  onClick={handleClick}
  disabled={isLoading}
>
  Guardar
</Button>

// ✅ Conditional rendering
{isLoading && <Spinner />}
{error ? <ErrorMessage /> : <Content />}

// ❌ AVOID - Nested ternaries
{isLoading ? <Spinner /> : error ? <Error /> : <Content />}
```

## API Routes Style

### REST API Pattern
```typescript
// pages/api/properties/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Auth first
  const user = await authMiddleware(req, res)
  if (!user) return
  
  // Method routing
  switch (req.method) {
    case 'GET':
      return getProperty(req, res)
    case 'PUT':
      return updateProperty(req, res, user)
    case 'DELETE':
      return deleteProperty(req, res, user)
    default:
      return res.status(405).json({ 
        error: 'Method not allowed' 
      })
  }
}

// Separate handler functions
async function getProperty(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  
  try {
    const property = await prisma.property.findUnique({
      where: { id: String(id) }
    })
    
    if (!property) {
      return res.status(404).json({ 
        error: 'Property not found' 
      })
    }
    
    return res.json({ data: property })
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
}
```

## CSS/TailwindCSS Conventions

### TailwindCSS Class Order
```tsx
// ✅ CORRECT - Consistent class order
<div className="
  {/* 1. Layout */}
  flex items-center justify-between
  {/* 2. Spacing */}
  p-4 mx-auto
  {/* 3. Sizing */}
  w-full max-w-4xl h-64
  {/* 4. Typography */}
  text-lg font-semibold
  {/* 5. Colors */}
  bg-white text-gray-800
  {/* 6. Borders */}
  border border-gray-200 rounded-lg
  {/* 7. Effects */}
  shadow-md hover:shadow-lg
  {/* 8. Transitions */}
  transition-shadow duration-200
">
```

### Component Styling Pattern
```tsx
// ✅ Use cx/clsx for conditional classes
import { clsx } from 'clsx'

function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={clsx(
        // Base styles
        'rounded-lg font-medium transition-colors',
        // Variant styles
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
        },
        // Size styles
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        // Custom classes
        className
      )}
      {...props}
    />
  )
}
```

## File & Folder Structure

### Naming Conventions
```
pages/
  index.tsx                    // lowercase routes
  properties/
    index.tsx                  // list page
    [id].tsx                   // dynamic route
  api/
    properties/
      index.ts                 // REST endpoints
      [id].ts

components/
  PropertyCard.tsx             // PascalCase components
  SearchFilter.tsx
  common/
    Button.tsx
    Input.tsx

lib/
  auth.ts                      // camelCase utilities
  prisma.ts
  utils/
    formatPrice.ts
    validateEmail.ts

hooks/
  useAuth.ts                   // camelCase with 'use' prefix
  useDebounce.ts

types/
  property.ts                  // lowercase type files
  user.ts
```

## Comments & Documentation

### Code Comments
```typescript
/**
 * Calculate agent commission for property sale
 * @param price - Property price in cents
 * @param isRural - Whether property is in rural area
 * @returns Commission amount in cents
 */
function calculateCommission(price: number, isRural: boolean): number {
  // Standard rate: 3% (agreed with client - don't change)
  const baseRate = 0.03
  
  // Rural properties get 0.5% extra (client requirement)
  const ruralBonus = isRural ? 0.005 : 0
  
  return Math.round(price * (baseRate + ruralBonus))
}

// ❌ AVOID - Obvious comments
// Set user to null
setUser(null)

// ✅ GOOD - Explains why
// Clear user session on logout to prevent stale data
setUser(null)
```

### JSDoc for Shared Functions
```typescript
/**
 * Format price for Spanish market display
 * @example
 * formatPrice(150000) // "1.500 €"
 * formatPrice(2500050) // "25.000,50 €"
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100)
}
```

## Error Handling Style

### Try-Catch Pattern
```typescript
// ✅ CORRECT - User-friendly errors
try {
  const result = await riskyOperation()
  return res.json({ data: result })
} catch (error) {
  console.error('Operation failed:', error) // Log for debugging
  
  return res.status(500).json({
    error: 'No se pudo completar la operación', // User message
    code: 'OPERATION_FAILED' // Error code for frontend
  })
}

// ❌ AVOID - Exposing internal errors
catch (error) {
  return res.status(500).json({ 
    error: error.message // Never expose internal messages
  })
}
```

## Form Validation Style

### Zod Schema Pattern
```typescript
// ✅ CORRECT - Bilingual error messages
import { z } from 'zod'

const propertySchema = z.object({
  title: z
    .string()
    .min(10, 'Mínimo 10 caracteres / Minimum 10 characters')
    .max(100, 'Máximo 100 caracteres / Maximum 100 characters'),
  
  price: z
    .number()
    .min(1000, 'Precio mínimo €10 / Minimum price €10')
    .max(10000000, 'Precio máximo €100,000 / Maximum price €100,000'),
  
  bedrooms: z
    .number()
    .int()
    .min(0, 'No puede ser negativo / Cannot be negative')
    .max(20, 'Demasiadas habitaciones / Too many bedrooms'),
  
  cadastralReference: z
    .string()
    .regex(
      /^\d{20}$/,
      'Referencia catastral incorrecta (20 dígitos) / Invalid cadastral reference (20 digits)'
    )
})
```

## State Management Style

### useState Pattern
```typescript
// ✅ CORRECT - Clear state names
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [properties, setProperties] = useState<Property[]>([])

// ❌ AVOID - Unclear names
const [flag, setFlag] = useState(false)
const [data, setData] = useState()
```

### Custom Hook Pattern
```typescript
// hooks/useProperties.ts
export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchProperties()
  }, [filters])
  
  const fetchProperties = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/properties')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setProperties(data.properties)
    } catch (err) {
      setError('No se pudieron cargar las propiedades')
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties
  }
}
```

## Testing Style

### Test File Naming
```
PropertyCard.test.tsx        // Component tests
formatPrice.test.ts          // Utility tests
properties.test.ts           // API route tests
```

### Test Structure
```typescript
// __tests__/components/PropertyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PropertyCard } from '@/components/PropertyCard'

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Casa en Pinoso',
    price: 15000000, // €150,000 in cents
    bedrooms: 3,
    bathrooms: 2
  }
  
  it('displays property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('Casa en Pinoso')).toBeInTheDocument()
    expect(screen.getByText('150.000 €')).toBeInTheDocument()
    expect(screen.getByText(/3.*habitaciones/)).toBeInTheDocument()
  })
  
  it('calls onSelect when clicked', () => {
    const handleSelect = jest.fn()
    render(
      <PropertyCard 
        property={mockProperty} 
        onSelect={handleSelect}
      />
    )
    
    fireEvent.click(screen.getByRole('article'))
    expect(handleSelect).toHaveBeenCalledWith('1')
  })
})
```

## Git Commit Style

### Commit Message Format
```bash
# ✅ CORRECT - Clear, descriptive
feat: add property search filter
fix: correct price calculation for rural properties  
chore: update dependencies
docs: add API documentation
refactor: simplify auth middleware
test: add property validation tests

# ❌ AVOID - Unclear messages
update
fix bug
changes
wip
```

## Environment Variables

### Naming Convention
```bash
# .env.local
# ✅ CORRECT - Clear, prefixed
DATABASE_URL=postgresql://...
DO_SPACES_KEY=...
DO_SPACES_SECRET=...
DO_SPACES_BUCKET=...
NEXT_PUBLIC_API_URL=... # NEXT_PUBLIC_ for client-side

# ❌ AVOID - Unclear names
KEY=...
SECRET=...
URL=...
```

## Prettier Configuration

### .prettierrc
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## ESLint Configuration

### .eslintrc.json
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/jsx-sort-props": ["warn", {
      "callbacksLast": true,
      "shorthandFirst": true
    }]
  }
}
```

## Code Quality Checklist

Before committing code, ensure:
- [ ] TypeScript has no errors (`pnpm tsc`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Prettier formatted (`pnpm format`)
- [ ] Imports are organized correctly
- [ ] Error messages are bilingual (ES/EN)
- [ ] No console.log statements
- [ ] Comments explain "why" not "what"
- [ ] Functions are under 50 lines
- [ ] Files are under 300 lines
- [ ] Component props have TypeScript interfaces

## Summary

### Key Points to Remember
1. **Use Prettier + ESLint** - Don't debate formatting
2. **camelCase for JS/TS** - snake_case only in database
3. **PascalCase for components** - And their file names
4. **Bilingual messages** - English first, then Spanish 
5. **User-friendly errors** - Never expose technical details
6. **Clear naming** - Self-documenting code
7. **Consistent structure** - Same patterns everywhere

### The Golden Rule
> "Code as if the person maintaining it is a Spanish developer who knows React but not your specific business logic."

---

*Last Updated: 2025*  
*Maintained by: Agent OS Team*