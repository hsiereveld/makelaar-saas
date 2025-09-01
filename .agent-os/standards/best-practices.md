# Development Best Practices - Agent OS

## Context
Global development guidelines for all Agent OS projects. These practices ensure consistent, maintainable, and cost-predictable applications that any developer can understand and extend.

## Philosophy: Boring But Ships

### The Entrepreneur's Tech Principles
1. **Use what works** - Proven technology over cutting-edge
2. **Hire easily** - Popular stack means available developers
3. **Predict costs** - No usage-based surprise bills
4. **Ship reliably** - Stable patterns over perfect code
5. **Handoff cleanly** - Any developer can take over

## Core Development Principles

### 1. Choose Boring Technology
```typescript
// ✅ GOOD - Boring but proven
import { useState } from 'react' // React 18, not experimental
import { prisma } from '@/lib/prisma' // PostgreSQL, not MongoDB
import { useForm } from 'react-hook-form' // Popular, documented

// ❌ BAD - Cutting edge
import { use } from 'react' // Experimental
import { edge } from '@vercel/edge' // Vendor lock-in
import { newHotLibrary } from 'unknown-package' // Risky
```

### 2. Keep It Radically Simple
- Maximum 100 lines per function
- Maximum 300 lines per file
- Maximum 3 levels of nesting
- If explaining takes > 5 minutes, refactor

```typescript
// ✅ GOOD - Clear and simple
async function getPropertyPrice(id: string) {
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) return null
  return property.price
}

// ❌ BAD - Over-engineered
class PropertyPriceCalculatorFactoryService {
  // 200 lines of abstraction for a simple lookup
}
```

### 3. Optimize for Next Developer
```typescript
// ✅ GOOD - Anyone understands this
function calculateCommission(salePrice: number): number {
  const AGENT_COMMISSION_RATE = 0.03 // 3% standard in Spain
  return salePrice * AGENT_COMMISSION_RATE
}

// ❌ BAD - Clever but confusing
const calc = (p: number) => p * 0.03 // What is p? What is 0.03?
```

### 4. DRY with Pragmatism
- Extract when used 3+ times
- Keep some duplication if it aids clarity
- Don't create premature abstractions

```typescript
// ✅ GOOD - Justified extraction
// Used in: PropertyCard, PropertyList, PropertyDetail
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100)
}

// ❌ BAD - Premature abstraction
// Only used once, adds complexity
function createGenericDataFetcher<T>(endpoint: string) {
  // 50 lines of generic code for 1 use case
}
```

## Tech Stack Compliance

### Required Stack (No Exceptions)
```yaml
Framework: Next.js 14+ (Pages Router ONLY)
Language: TypeScript (strict mode)
Database: PostgreSQL + Prisma
Auth: Better-Auth
Hosting: Digital Ocean
Storage: Digital Ocean Spaces
Styling: TailwindCSS
UI: shadcn/ui
Forms: React Hook Form + Zod
Email: Resend
Payments: Stripe
```

### Banned Technologies
```yaml
NEVER USE:
- App Router (too new, hiring issues)
- AWS (complex pricing)
- MongoDB (schema-less chaos)
- GraphQL (over-engineering)
- CSS-in-JS (bundle bloat)
- Redux (unnecessary complexity)
- NextAuth (use Better-Auth)
- Serverless-specific code
```

## Project Structure Standards

### Monorepo Organization
```
agent-os/
├── .agent-os/                    # Agent OS configuration
│   ├── global/
│   │   └── tech-stack.md        # This document
│   └── templates/               # Reusable templates
├── apps/
│   ├── real-estate-crm/         # Pinoso agent project
│   │   ├── pages/              # Pages Router (NEVER 'app/')
│   │   │   ├── index.tsx       # Homepage
│   │   │   ├── api/           # API routes
│   │   │   └── properties/    # Property pages
│   │   ├── lib/               # Business logic
│   │   │   ├── prisma.ts     # Database client
│   │   │   ├── auth.ts       # Better-Auth setup
│   │   │   └── storage.ts    # DO Spaces client
│   │   ├── components/        # React components
│   │   └── public/           # Static assets
│   └── care-service/          # Care platform project
├── packages/                   # Shared code
│   ├── database/              # Prisma schemas
│   ├── ui/                   # Shared components
│   ├── auth/                 # Auth configuration
│   ├── emails/               # Email templates
│   └── utils/                # Helper functions
└── infrastructure/
    ├── docker/                # Local development
    └── .github/               # CI/CD workflows
```

### File Naming Conventions
```typescript
// Components: PascalCase
PropertyCard.tsx
SearchFilter.tsx

// Utilities: camelCase
formatPrice.ts
validateEmail.ts

// API Routes: kebab-case
pages/api/properties/index.ts
pages/api/auth/sign-in.ts

// Database: snake_case
property_listings
user_accounts
```

## API Development Standards

### REST API Structure
```typescript
// pages/api/properties/index.ts
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Auth check
  const user = await authMiddleware(req, res)
  if (!user) return

  // 2. Method routing
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, user)
    case 'POST':
      return handlePost(req, res, user)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: User) {
  try {
    const properties = await prisma.property.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return res.json({ data: properties })
  } catch (error) {
    console.error('Properties fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch properties' })
  }
}
```

### Response Format (JSend)
```typescript
// Success
{
  "status": "success",
  "data": { ... }
}

// Error
{
  "status": "error",
  "message": "User-friendly error message",
  "code": "ERROR_CODE" // For debugging
}
```

## Database Standards

### Prisma Schema Best Practices
```prisma
// packages/database/prisma/schema.prisma

model Property {
  id        String   @id @default(cuid())
  
  // Use cents for money (integer)
  price     Int      // Store 250000 for €2,500.00
  
  // Spanish-specific fields
  cadastral_reference String  @unique // Referencia catastral
  energy_certificate  String? // Certificado energético
  
  // Consistent timestamps
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  // Soft delete pattern
  deleted_at DateTime?
  
  // Relations
  user_id   String
  user      User     @relation(fields: [user_id], references: [id])
  
  // Indexes for common queries
  @@index([price, city])
  @@index([deleted_at])
  @@map("properties") // Table name in snake_case
}
```

### Database Query Patterns
```typescript
// ✅ GOOD - Use Prisma's type safety
const activeProperties = await prisma.property.findMany({
  where: {
    deleted_at: null,
    price: {
      gte: minPrice * 100, // Convert euros to cents
      lte: maxPrice * 100
    }
  },
  include: {
    images: true,
    user: {
      select: {
        name: true,
        phone: true
      }
    }
  }
})

// ❌ BAD - Raw SQL unless absolutely necessary
const properties = await prisma.$queryRaw`
  SELECT * FROM properties WHERE price > ${minPrice}
`
```

## Authentication Standards

### Better-Auth Implementation
```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  
  // Spanish market requirements
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    passwordRules: {
      minLength: 8,
      requireNumbers: true
    }
  },
  
  // Social login for Spain
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  },
  
  // Multi-tenant for different agencies/services
  multiTenant: {
    enabled: true,
    tenantIdField: 'organizationId'
  }
})
```

### Protected Routes Pattern
```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=' + router.asPath)
    }
  }, [user, isLoading])
  
  if (isLoading) return <LoadingSpinner />
  if (!user) return null
  if (requiredRole && user.role !== requiredRole) {
    return <div>No tienes permisos / You don't have permission</div>
  }
  
  return children
}
```

## Frontend Standards

### Component Structure
```typescript
// components/PropertyCard.tsx
import { formatPrice } from '@/lib/utils/format'
import { Property } from '@prisma/client'
import { Card } from '@/packages/ui'

interface PropertyCardProps {
  property: Property
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function PropertyCard({ property, onFavorite, isFavorite = false }: PropertyCardProps) {
  // 1. Hooks at the top
  const router = useRouter()
  const { t } = useTranslation()
  
  // 2. Event handlers
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onFavorite?.(property.id)
  }
  
  // 3. Render
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <img 
        src={property.image_url} 
        alt={property.title}
        loading="lazy" // Performance
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">
          {property.title}
        </h3>
        <p className="text-2xl font-bold text-green-600">
          {formatPrice(property.price)}
        </p>
        <p className="text-gray-600">
          {property.bedrooms} hab • {property.bathrooms} baños • {property.size}m²
        </p>
      </div>
    </Card>
  )
}
```

### Form Handling with React Hook Form
```typescript
// components/PropertyForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const propertySchema = z.object({
  title: z.string().min(10, 'Mínimo 10 caracteres'),
  price: z.number().min(1000, 'Precio mínimo €1,000'),
  city: z.string().min(2),
  cadastral_reference: z.string().regex(/^\d{20}$/, 'Formato incorrecto')
})

type PropertyFormData = z.infer<typeof propertySchema>

export function PropertyForm({ onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema)
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('title')}
          placeholder="Título del inmueble"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Propiedad'}
      </button>
    </form>
  )
}
```

## Error Handling

### User-Friendly Error Messages
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
  }
}

// Spanish + English error messages
export const ErrorMessages = {
  PROPERTY_NOT_FOUND: {
    es: 'Propiedad no encontrada',
    en: 'Property not found',
    code: 'PROPERTY_NOT_FOUND'
  },
  UNAUTHORIZED: {
    es: 'No tienes permiso para realizar esta acción',
    en: 'You don't have permission to perform this action',
    code: 'UNAUTHORIZED'
  },
  BOOKING_CONFLICT: {
    es: 'Este horario ya no está disponible',
    en: 'This time slot is no longer available',
    code: 'BOOKING_CONFLICT'
  }
}

// API error handler
export function handleApiError(error: unknown, res: NextApiResponse) {
  console.error('API Error:', error)
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      code: error.code
    })
  }
  
  // Never expose internal errors to users
  return res.status(500).json({
    status: 'error',
    message: 'Algo salió mal / Something went wrong',
    code: 'INTERNAL_ERROR'
  })
}
```

## File Storage Standards

### Digital Ocean Spaces Pattern
```typescript
// lib/storage/upload.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const client = new S3Client({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!
  }
})

export async function uploadPropertyImage(
  file: Buffer,
  filename: string,
  propertyId: string
): Promise<string> {
  const key = `properties/${propertyId}/${Date.now()}-${filename}`
  
  await client.send(new PutObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET!,
    Key: key,
    Body: file,
    ContentType: 'image/jpeg',
    ACL: 'public-read', // Or 'private' with signed URLs
    Metadata: {
      propertyId,
      uploadedAt: new Date().toISOString()
    }
  }))
  
  return `https://${process.env.DO_SPACES_BUCKET}.ams3.cdn.digitaloceanspaces.com/${key}`
}
```

## Spanish/EU Market Requirements

### Localization Standards
```typescript
// lib/i18n/messages.ts
export const messages = {
  es: {
    welcome: 'Bienvenido',
    property: {
      bedroom: 'habitación',
      bedrooms: 'habitaciones',
      bathroom: 'baño',
      bathrooms: 'baños'
    }
  },
  en: {
    welcome: 'Welcome',
    property: {
      bedroom: 'bedroom',
      bedrooms: 'bedrooms',
      bathroom: 'bathroom',
      bathrooms: 'bathrooms'
    }
  },
  ca: { // Valencian/Catalan
    welcome: 'Benvingut'
  }
}

// lib/utils/format.ts
export function formatSpanishPhone(phone: string): string {
  // Format: +34 XXX XX XX XX
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

export function formatEuropeanDate(date: Date): string {
  // DD/MM/YYYY format, not MM/DD/YYYY
  return new Intl.DateTimeFormat('es-ES').format(date)
}

export function formatPrice(cents: number): string {
  // Spanish: 1.234,56 €
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100)
}
```

### GDPR Compliance
```typescript
// components/CookieConsent.tsx
export function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null)
  
  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent')
    if (stored) setConsent(JSON.parse(stored))
  }, [])
  
  if (consent !== null) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          Utilizamos cookies para mejorar tu experiencia / 
          We use cookies to improve your experience
        </p>
        <div className="flex gap-2">
          <button onClick={() => handleConsent(false)}>
            Rechazar / Reject
          </button>
          <button onClick={() => handleConsent(true)}>
            Aceptar / Accept
          </button>
        </div>
      </div>
    </div>
  )
}
```

## Testing Standards

### What to Test (Priority Order)
1. **Payment flows** - Critical, always test
2. **Authentication** - Security critical
3. **Business calculations** - Commission, pricing
4. **Data validation** - Form submissions
5. **API endpoints** - Integration tests

### Testing Pattern
```typescript
// __tests__/api/properties.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/properties'
import { prisma } from '@/lib/prisma'

describe('/api/properties', () => {
  beforeEach(async () => {
    await prisma.property.deleteMany()
  })
  
  it('returns properties for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    const json = JSON.parse(res._getData())
    expect(json.status).toBe('success')
  })
})
```

## Performance Standards

### Target Metrics
```yaml
# For Spanish/EU market (varied connection speeds)
First Contentful Paint: < 1.5s
Time to Interactive: < 3.5s
Cumulative Layout Shift: < 0.1
Bundle Size: < 200KB initial

# Mobile-first (Spain = mobile usage)
Mobile Score: 90+ (Lighthouse)
3G Support: Required
Offline Support: Service worker for key pages
```

### Optimization Patterns
```typescript
// ✅ GOOD - Lazy load heavy components
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  loading: () => <div>Cargando mapa...</div>,
  ssr: false
})

// ✅ GOOD - Image optimization
<Image
  src={property.image}
  alt={property.title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>

// ✅ GOOD - Database query optimization
const properties = await prisma.property.findMany({
  where: { city: 'Pinoso' },
  select: {  // Only get needed fields
    id: true,
    title: true,
    price: true,
    image_url: true
  },
  take: 20  // Pagination
})
```

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables in `.env.example`
- [ ] Database migrations created and tested
- [ ] No console.log in production code
- [ ] Error messages in Spanish + English
- [ ] Mobile responsive tested
- [ ] GDPR compliance checked
- [ ] Costs documented for client

### Digital Ocean Deployment
```yaml
# .do/app.yaml
name: real-estate-crm
region: ams # Amsterdam for EU
services:
  - name: web
    github:
      repo: your-github/real-estate-crm
      branch: main
      deploy_on_push: true
    build_command: pnpm build
    run_command: pnpm start
    http_port: 3000
    instance_count: 1
    instance_size_slug: basic-xs # $4/month
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
        type: SECRET
databases:
  - name: db
    engine: PG
    version: "15"
    size: db-s-1vcpu-1gb # $15/month
    num_nodes: 1
```

## Cost Documentation

### Always Document for Client
```typescript
/**
 * MONTHLY COSTS FOR THIS SERVICE:
 * - Hosting: €4/month (DO App Platform)
 * - Database: €15/month (DO PostgreSQL)
 * - Storage: €5/month (DO Spaces)
 * - Email: €10/month (Resend - 3000 emails)
 * - Total: €34/month
 * 
 * SCALING COSTS:
 * - Next tier: €68/month (2x capacity)
 * - High traffic: €150/month (10x capacity)
 */
```

## Common Patterns Library

### Pagination Pattern
```typescript
// lib/pagination.ts
export interface PaginationParams {
  page?: number
  limit?: number
}

export function getPaginationParams(query: any): PaginationParams {
  const page = parseInt(query.page) || 1
  const limit = Math.min(parseInt(query.limit) || 20, 100)
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

// Usage in API
const { skip, limit } = getPaginationParams(req.query)
const [properties, total] = await Promise.all([
  prisma.property.findMany({ skip, take: limit }),
  prisma.property.count()
])
```

### Search Pattern
```typescript
// lib/search.ts
export function buildSearchQuery(search?: string) {
  if (!search) return {}
  
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } }
    ]
  }
}
```

### File Upload Pattern
```typescript
// pages/api/upload.ts
import multer from 'multer'
import { uploadToSpaces } from '@/lib/storage'

const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

export default async function handler(req, res) {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        error: 'Archivo demasiado grande / File too large' 
      })
    }
    
    const url = await uploadToSpaces(req.file)
    return res.json({ url })
  })
}
```

## Code Review Checklist

### Before Every PR
- [ ] No App Router imports
- [ ] No AWS dependencies  
- [ ] TypeScript errors fixed
- [ ] Spanish + English messages
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Database migrations included
- [ ] Environment variables documented
- [ ] Costs impact documented

## Emergency Procedures

### When Things Break
1. **Check DO status page** - https://status.digitalocean.com
2. **Check error logs** - DO App Platform logs
3. **Database issues** - Check connection pool
4. **High costs** - Check DO Spaces bandwidth
5. **Rollback procedure** - Redeploy previous commit

### Support Contacts
```yaml
Digital Ocean Support: Via dashboard
Stripe Support: dashboard.stripe.com/support  
Resend Support: resend.com/support
Your DevOps: [Add contact here]
```

## Final Rules

### The Three Questions
Before any technical decision, ask:
1. **Can I hire someone in Spain to maintain this?**
2. **Will this surprise me with a bill?**
3. **Does this ship features faster?**

If any answer is "No", reconsider the approach.

### Remember
- Boring technology is good technology
- Working code > Perfect code
- Ship today > Ship perfectly
- Predictable > Clever
- Simple > Complex

---

*"The best code is boring code that makes money."* - Agent OS Philosophy