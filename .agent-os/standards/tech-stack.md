# .agent-os/global/tech-stack.md

## Core Stack
- Framework: Next.js 14+ (Pages Router, NOT App Router)
- Language: TypeScript 5.0+
- Package Manager: pnpm 8.0+
- Node Version: 22 LTS
- Monorepo Tool: Turborepo

## Database
- Primary Database: PostgreSQL 17+
- ORM: Prisma
- Database GUI: Prisma Studio
- Migrations: Prisma Migrate

## Authentication & Security
- Auth Solution: Better-Auth
- Session Storage: Database sessions (PostgreSQL)
- Social Auth: Google, Facebook, WhatsApp
- 2FA: TOTP support
- RBAC: Role-based access control
- Password Hashing: Argon2

## Frontend
- UI Framework: React 18+
- Styling: TailwindCSS 4.0+
- UI Components: shadcn/ui
- Icons: Lucide React
- Forms: React Hook Form + Zod
- State Management: Zustand (when needed)
- Data Fetching: TanStack Query (React Query)
- Animations: Framer Motion (when needed)

## Backend & API
- API Design: REST (tRPC for type-safe internal APIs)
- API Routes: Next.js API Routes (pages/api)
- Validation: Zod
- File Upload: Multer + DO Spaces
- Background Jobs: BullMQ + Redis (when needed)
- Rate Limiting: Upstash Redis

## Infrastructure - DO Ecosystem
- Application Hosting: Digital Ocean App Platform
- Database Hosting: Digital Ocean Managed PostgreSQL
- Redis: Digital Ocean Managed Redis (when needed)
- File Storage: Digital Ocean Spaces
- CDN: Digital Ocean CDN (included with Spaces)
- Backup CDN: Cloudflare (free tier)
- DNS: Cloudflare
- Domain Registrar: Namecheap/Cloudflare

## File Storage Details
- Primary: Digital Ocean Spaces (S3-compatible)
- Regions: AMS3 (Amsterdam) for EU compliance
- Alternative: Cloudflare R2 (for zero egress fees)
- Image Processing: Sharp (server-side)
- PDF Generation: Puppeteer or react-pdf
- File Types: Images, PDFs, Documents
- Access Control: Signed URLs for private files

## Email & Communications
- Transactional Email: Resend (EU-friendly)
- SMS/WhatsApp: Twilio (Spain/EU support)
- Push Notifications: OneSignal (web + mobile)
- Email Templates: React Email

## Mobile Apps
- Framework: React Native + Expo
- Navigation: React Navigation
- State: Same as web (Zustand)
- API: Shared Next.js backend
- Auth: Better-Auth (shared)

## Development Tools
- Version Control: Git + GitHub
- CI/CD: GitHub Actions
- Local Development: Docker Compose
- API Testing: Thunder Client/Insomnia
- E2E Testing: Playwright
- Unit Testing: Vitest (faster than Jest)
- Code Quality: ESLint + Prettier
- Git Hooks: Husky + lint-staged
- Error Tracking: Sentry (self-hosted option available)

## Monitoring & Analytics
- Analytics: Plausible (EU-compliant, privacy-first)
- Uptime: Better Uptime
- Logging: Axiom or DO Papertrail
- Performance: Lighthouse CI

## Environment Management
- Environments: development, staging, production
- Env Variables: dotenv for local, DO App Platform for deployed
- Secrets: DO App Platform encrypted env vars
- Branch Strategy: main (prod), staging, feature branches

## Payment Processing
- Primary: Stripe (global + Stripe Tax for EU)
- Spanish Market: Bizum integration via Stripe
- Subscriptions: Stripe Billing
- Invoicing: Stripe Invoicing

## Compliance & Legal
- GDPR: Cookie consent, data export, right to deletion
- Spanish Law: LOPD compliance
- Terms: Iubenda (generates compliant terms)
- Cookies: Own implementation or Cookiebot

## Project Organization
monorepo/
├── apps/
│   ├── web/              # Main Next.js app
│   ├── mobile/           # React Native app
│   └── admin/            # Admin dashboard
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── ui/               # Shared components
│   ├── auth/             # Better-Auth config
│   ├── emails/           # Email templates
│   └── utils/            # Shared utilities
└── infrastructure/
    ├── docker/           # Docker configs
    └── .github/          # GitHub Actions

## Standards & Conventions
- API Response Format: JSend
- Date Format: ISO 8601
- Currency: Store in cents (integer)
- Phone Numbers: E.164 format
- Timezone: UTC storage, local display
- Naming: camelCase (JS), snake_case (DB)

## Performance Targets
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle Size: < 200KB initial