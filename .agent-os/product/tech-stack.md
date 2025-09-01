# Technical Stack

## Application Framework
- **Framework:** Next.js 15.0.3
- **Runtime:** Node.js with App Router
- **Language:** TypeScript 5.x
- **Package Manager:** npm

## Frontend Stack
- **JavaScript Framework:** React 19.0.0
- **Styling:** Tailwind CSS (latest) + Custom Components
- **UI Components:** Radix UI (@radix-ui/react-dialog)
- **State Management:** Zustand + TanStack React Query
- **Data Tables:** TanStack React Table
- **Charts & Analytics:** Recharts
- **Icons:** Lucide React
- **Utility Libraries:** clsx, tailwind-merge, date-fns

## Backend & Database
- **Database:** PostgreSQL with Row Level Security (RLS)
- **ORM:** Drizzle ORM (latest) + Drizzle Kit
- **Database Hosting:** Neon Database (@neondatabase/serverless)
- **Authentication:** better-auth (latest)
- **API Architecture:** REST API with Next.js API routes
- **Multi-tenancy:** Database-level isolation with tenant_id foreign keys

## External Services & Integrations
- **Payment Processing:** Stripe (latest) with multi-currency support (EUR/GBP)
- **Email Service:** Resend (latest) with multilingual template support
- **File Storage:** Vercel Blob (@vercel/blob) for international document management
- **Currency Exchange:** Real-time EUR/GBP conversion API integration
- **Translation Services:** Integration-ready for Dutch, English, French, Spanish content
- **Environment Management:** dotenv-cli for database operations

## Development Tools
- **Build System:** Next.js built-in (Turbopack)
- **Linting:** ESLint 9.34.0
- **Type Checking:** TypeScript compiler
- **Database Management:** Drizzle Kit for migrations and studio
- **Development Server:** Next.js dev server with hot reload

## Database Schema Design
- **Multi-tenant Architecture:** Strict tenant isolation using UUID tenant_id with pan-European data compliance
- **User Roles:** Enum-based role hierarchy (platform_admin → tenant_owner → tenant_admin → agent → assistant → viewer)
- **Property Management:** Complete property lifecycle with multi-currency pricing and international status workflows
- **Contact Types:** Support for international buyers, sellers, landlords, tenants with nationality and language preferences
- **Multi-Language Support:** JSONB fields for content in Dutch, English, French, and Spanish
- **Currency Handling:** Native EUR/GBP storage with historical exchange rate tracking
- **Legal Compliance:** Fields for multi-jurisdiction requirements (NL, UK, BE, ES)

## API Design Principles
- **REST API Structure:** `/api/v1/[tenant]/resource` pattern with multi-language support
- **Authentication:** JWT with tenant claims and user nationality/language preferences
- **Response Format:** Consistent JSON with localized success/error states (NL/EN/FR/ES)
- **Multi-tenant Isolation:** Middleware-enforced tenant context validation with GDPR compliance
- **Rate Limiting:** Per-tenant API limits with European data protection considerations
- **Currency Handling:** Native multi-currency responses with real-time conversion rates

## Deployment & Infrastructure
- **Application Hosting:** Vercel (Next.js optimized)
- **Database Hosting:** Neon (PostgreSQL-compatible)
- **Asset Hosting:** Vercel Blob for file storage
- **Domain Management:** Custom domains per tenant (optional)
- **Environment Variables:** .env.local for development, Vercel env for production

## Security Implementation
- **Authentication:** JWT tokens with tenant isolation
- **Database Security:** Row Level Security (RLS) policies
- **API Security:** Tenant validation middleware
- **Data Isolation:** Complete tenant data separation
- **HTTPS:** Enforced TLS 1.3 encryption

## Development Workflow
- **Version Control:** Git with GitHub
- **Database Migrations:** Drizzle Kit generate/push workflow
- **Local Development:** Next.js dev server + Neon database
- **Database Studio:** Drizzle Studio for data inspection
- **Build Process:** Next.js build with TypeScript validation

## WordPress Integration (Planned)
- **Plugin Framework:** Native WordPress plugin architecture with multi-language support
- **API Communication:** REST API calls to tenant-specific endpoints with currency conversion
- **Authentication:** WordPress-specific API keys with tenant and language context
- **Frontend Integration:** Multilingual shortcodes and widgets for property display (NL/EN/FR/ES)
- **Real-time Updates:** Webhook system for data synchronization across time zones
- **Currency Display:** Automatic EUR/GBP conversion based on visitor location/preference